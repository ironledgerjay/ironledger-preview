import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, DollarSign, Clock, CheckCircle, XCircle, AlertCircle,
  Receipt, Calendar, User, Phone, Mail, RefreshCw, Download,
  TrendingUp, BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useToast } from '@/hooks/use-toast';
import { usePayFast } from '@/hooks/usePayFast';
import { apiRequest } from '@/lib/queryClient';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface Payment {
  id: string;
  userId: string;
  appointmentId?: string;
  amount: string;
  type: 'booking-fee' | 'membership' | 'consultation';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'payfast' | 'medical-aid' | 'cash';
  paymentReference: string;
  description: string;
  createdAt: Date;
  completedAt?: Date;
  refundedAt?: Date;
  metadata: {
    doctorName?: string;
    appointmentDate?: string;
    membershipType?: string;
    patientName?: string;
    bookingReference?: string;
  };
}

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  successRate: number;
  averageTransaction: number;
  revenueByType: {
    bookingFees: number;
    memberships: number;
    consultations: number;
  };
  monthlyTrend: {
    month: string;
    revenue: number;
    transactions: number;
  }[];
}

interface RefundRequest {
  paymentId: string;
  reason: string;
  amount?: number;
  requestedBy: string;
  status: 'pending' | 'approved' | 'denied' | 'processed';
}

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  isActive: boolean;
  stripePriceId?: string;
}

const membershipPlans: MembershipPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    duration: 'monthly',
    features: ['R10 booking fees', 'Email support', 'Basic search'],
    isActive: true,
  },
  {
    id: 'premium-quarterly',
    name: 'Premium Quarterly',
    price: 39,
    duration: 'quarterly',
    features: ['Free bookings', 'Priority support', 'Advanced search', 'Video consultations'],
    isActive: true,
  },
  {
    id: 'premium-annual',
    name: 'Premium Annual',
    price: 149,
    duration: 'annual',
    features: ['Free bookings', 'Priority support', 'Advanced search', 'Video consultations', '24% savings'],
    isActive: true,
  },
];

export default function PaymentIntegration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logPageView, logUserAction } = useActivityLogger();
  const { generatePaymentUrl } = usePayFast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  // Log page view
  useEffect(() => {
    logPageView('payment_integration', { 
      userId: user?.id,
      role: user?.role 
    });
  }, []);

  // Fetch payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ['/api/payments', dateRange],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch payment statistics
  const { data: stats, isLoading: statsLoading } = useQuery<PaymentStats>({
    queryKey: ['/api/payments/stats', dateRange],
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
  });

  // Process refund mutation
  const processRefundMutation = useMutation({
    mutationFn: async ({ paymentId, reason, amount }: { paymentId: string; reason: string; amount?: number }) => {
      return apiRequest('POST', `/api/payments/${paymentId}/refund`, { reason, amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/stats'] });
      setSelectedPayment(null);
      setRefundReason('');
      toast({
        title: 'Refund Processed',
        description: 'The refund has been initiated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Refund Failed',
        description: error.message || 'Failed to process refund.',
        variant: 'destructive',
      });
    },
  });

  // Retry payment mutation
  const retryPaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      return apiRequest('POST', `/api/payments/${paymentId}/retry`);
    },
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Retry Failed',
        description: error.message || 'Failed to retry payment.',
        variant: 'destructive',
      });
    },
  });

  // Create membership payment
  const createMembershipPayment = async (planId: string) => {
    const plan = membershipPlans.find(p => p.id === planId);
    if (!plan) return;

    logUserAction('membership_upgrade_attempt', 'payment_integration', { 
      planId, 
      price: plan.price 
    });

    try {
      const paymentUrl = await generatePaymentUrl({
        amount: plan.price,
        item_name: `${plan.name} Membership`,
        custom_str1: 'membership',
        custom_str2: planId,
      });
      
      window.location.href = paymentUrl;
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to create payment.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return XCircle;
      case 'refunded': return RefreshCw;
      default: return AlertCircle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking-fee': return 'bg-blue-100 text-blue-800';
      case 'membership': return 'bg-purple-100 text-purple-800';
      case 'consultation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'doctor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This page is only accessible to authorized users</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <p className="text-gray-600">Monitor transactions, process refunds, and analyze revenue</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">R{stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">R{stats?.monthlyRevenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Receipt className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold">{stats?.totalTransactions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">{stats?.successRate?.toFixed(1) || '0.0'}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
            <TabsTrigger value="memberships" data-testid="tab-memberships">Memberships</TabsTrigger>
            <TabsTrigger value="refunds" data-testid="tab-refunds">Refunds</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-center py-8">Loading revenue data...</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                        <span className="font-medium">Booking Fees</span>
                        <span className="font-bold">R{stats?.revenueByType?.bookingFees?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                        <span className="font-medium">Memberships</span>
                        <span className="font-bold">R{stats?.revenueByType?.memberships?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                        <span className="font-medium">Consultations</span>
                        <span className="font-bold">R{stats?.revenueByType?.consultations?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentsLoading ? (
                    <div className="text-center py-8">Loading transactions...</div>
                  ) : payments.length === 0 ? (
                    <div className="text-center py-8">
                      <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payments.slice(0, 5).map((payment) => {
                        const StatusIcon = getStatusIcon(payment.status);
                        return (
                          <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <StatusIcon className="w-4 h-4 text-gray-500" />
                              <div>
                                <p className="font-medium text-sm">{payment.description}</p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(payment.createdAt), 'MMM d, HH:mm')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">R{payment.amount}</p>
                              <Badge className={`text-xs ${getStatusColor(payment.status)}`}>
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-center py-8">Loading trend data...</div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Revenue charts coming soon</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  All Transactions
                </CardTitle>
                <CardDescription>
                  View and manage all payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Date Range Filter */}
                <div className="flex gap-4 mb-6">
                  <div>
                    <Label htmlFor="startDate">From</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      data-testid="input-date-start"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">To</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      data-testid="input-date-end"
                    />
                  </div>
                </div>

                {paymentsLoading ? (
                  <div className="text-center py-8">Loading transactions...</div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found for this period</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => {
                      const StatusIcon = getStatusIcon(payment.status);
                      return (
                        <div key={payment.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <StatusIcon className="w-5 h-5 text-gray-500" />
                              <div>
                                <h4 className="font-semibold">{payment.description}</h4>
                                <p className="text-sm text-gray-600">
                                  Reference: {payment.paymentReference}
                                </p>
                                {payment.metadata.doctorName && (
                                  <p className="text-sm text-gray-600">
                                    Doctor: {payment.metadata.doctorName}
                                  </p>
                                )}
                                {payment.metadata.appointmentDate && (
                                  <p className="text-sm text-gray-600">
                                    Appointment: {format(new Date(payment.metadata.appointmentDate), 'PPP')}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right space-y-2">
                              <p className="text-2xl font-bold">R{payment.amount}</p>
                              <div className="space-x-2">
                                <Badge className={getStatusColor(payment.status)}>
                                  {payment.status}
                                </Badge>
                                <Badge className={getTypeColor(payment.type)}>
                                  {payment.type}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-500">Created</p>
                              <p>{format(new Date(payment.createdAt), 'PPp')}</p>
                            </div>
                            {payment.completedAt && (
                              <div>
                                <p className="text-gray-500">Completed</p>
                                <p>{format(new Date(payment.completedAt), 'PPp')}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500">Method</p>
                              <p className="capitalize">{payment.paymentMethod}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">User ID</p>
                              <p className="font-mono text-xs">{payment.userId}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-3 border-t">
                            {payment.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => retryPaymentMutation.mutate(payment.id)}
                                disabled={retryPaymentMutation.isPending}
                                data-testid={`button-retry-${payment.id}`}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Retry
                              </Button>
                            )}
                            
                            {payment.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedPayment(payment)}
                                data-testid={`button-refund-${payment.id}`}
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Refund
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Download receipt functionality
                                logUserAction('receipt_download', 'payment_integration', { paymentId: payment.id });
                              }}
                              data-testid={`button-receipt-${payment.id}`}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memberships Tab */}
          <TabsContent value="memberships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Membership Plans
                </CardTitle>
                <CardDescription>
                  Manage membership plans and pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {membershipPlans.map((plan) => (
                    <Card key={plan.id} className={plan.id === 'premium-quarterly' ? 'border-blue-500' : ''}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {plan.name}
                          {plan.id === 'premium-quarterly' && (
                            <Badge>Most Popular</Badge>
                          )}
                        </CardTitle>
                        <div className="text-3xl font-bold">
                          R{plan.price}
                          <span className="text-lg font-normal text-gray-500">
                            /{plan.duration === 'monthly' ? 'mo' : plan.duration === 'quarterly' ? '3mo' : 'year'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {plan.price > 0 && (
                          <Button
                            className="w-full"
                            onClick={() => createMembershipPayment(plan.id)}
                            data-testid={`button-upgrade-${plan.id}`}
                          >
                            Upgrade to {plan.name}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Refund Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Refund management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Payment Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Advanced analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Refund Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Process Refund</CardTitle>
                <CardDescription>
                  Refund payment for {selectedPayment.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Amount to Refund</Label>
                  <p className="text-2xl font-bold">R{selectedPayment.amount}</p>
                </div>
                
                <div>
                  <Label htmlFor="refundReason">Reason for Refund</Label>
                  <Select onValueChange={setRefundReason}>
                    <SelectTrigger data-testid="select-refund-reason">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="duplicate-charge">Duplicate Charge</SelectItem>
                      <SelectItem value="service-not-provided">Service Not Provided</SelectItem>
                      <SelectItem value="customer-request">Customer Request</SelectItem>
                      <SelectItem value="technical-error">Technical Error</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This action cannot be undone. The refund will be processed immediately.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPayment(null);
                      setRefundReason('');
                    }}
                    className="flex-1"
                    data-testid="button-cancel-refund"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => processRefundMutation.mutate({
                      paymentId: selectedPayment.id,
                      reason: refundReason
                    })}
                    disabled={processRefundMutation.isPending || !refundReason}
                    className="flex-1"
                    data-testid="button-confirm-refund"
                  >
                    {processRefundMutation.isPending ? 'Processing...' : 'Process Refund'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}