import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, CheckCircle, XCircle, BarChart3, Star, Phone, MapPin } from 'lucide-react';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useToast } from '@/hooks/use-toast';

interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  province: string;
  city: string;
  phone: string;
  rating: string;
  reviewCount: number;
  consultationFee: string;
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
}

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  reason: string;
  consultationType: 'in-person' | 'virtual';
}

interface Analytics {
  monthlyRevenue: number;
  totalPatients: number;
  appointmentsThisMonth: number;
  averageRating: number;
  popularTimeSlots: Array<{ time: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
}

export default function DoctorPortal() {
  useActivityLogger('doctor_portal');
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch doctor profile
  const { data: profile, isLoading: loadingProfile } = useQuery<DoctorProfile>({
    queryKey: ['/api/doctor/profile'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Fetch pending appointments
  const { data: appointments = [], isLoading: loadingAppointments, refetch: refetchAppointments } = useQuery<Appointment[]>({
    queryKey: ['/api/doctor/appointments'],
    enabled: activeTab === 'appointments',
    refetchInterval: 10000, // Update every 10 seconds for real-time appointment management
  });

  // Fetch analytics
  const { data: analytics, isLoading: loadingAnalytics } = useQuery<Analytics>({
    queryKey: ['/api/doctor/analytics'],
    enabled: activeTab === 'analytics',
    refetchInterval: 60000, // Update every minute
  });

  const handleAppointmentAction = async (appointmentId: string, action: 'confirm' | 'cancel') => {
    try {
      const response = await fetch(`/api/doctor/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'confirm' ? 'confirmed' : 'cancelled' }),
      });

      if (response.ok) {
        toast({
          title: `Appointment ${action === 'confirm' ? 'Confirmed' : 'Cancelled'}`,
          description: `The appointment has been ${action === 'confirm' ? 'confirmed' : 'cancelled'} successfully.`,
        });
        await refetchAppointments();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} appointment. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dr. {profile?.firstName} {profile?.lastName}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary">{profile?.specialty}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{profile?.rating} ({profile?.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Consultation Fee</div>
              <div className="text-lg font-semibold">R{profile?.consultationFee}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="appointments" data-testid="tab-appointments">Appointments</TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule">Schedule</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.totalPatients || 0}</div>
                  <p className="text-xs text-muted-foreground">Lifetime patients</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.totalAppointments || 0}</div>
                  <p className="text-xs text-muted-foreground">All time appointments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.pendingAppointments || 0}</div>
                  <p className="text-xs text-muted-foreground">Awaiting your response</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.rating || 'N/A'}</div>
                  <p className="text-xs text-muted-foreground">{profile?.reviewCount || 0} reviews</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Practice Information</CardTitle>
                <CardDescription>Your profile and contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{profile?.city}, {profile?.province}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{profile?.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Requests</CardTitle>
                <CardDescription>Manage incoming appointment requests from patients</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4" data-testid={`appointment-${appointment.id}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{appointment.patientName}</h4>
                            <p className="text-sm text-gray-600">{appointment.patientEmail}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(appointment.appointmentDate).toLocaleDateString()} at {new Date(appointment.appointmentDate).toLocaleTimeString()}
                            </p>
                            <p className="text-sm mt-2">{appointment.reason}</p>
                            <Badge variant={appointment.consultationType === 'virtual' ? 'secondary' : 'outline'} className="mt-2">
                              {appointment.consultationType === 'virtual' ? 'Virtual' : 'In-Person'}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {appointment.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                                  data-testid={`button-confirm-${appointment.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                                  data-testid={`button-cancel-${appointment.id}`}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </>
                            )}
                            {appointment.status !== 'pending' && (
                              <Badge variant={appointment.status === 'confirmed' ? 'default' : 'destructive'}>
                                {appointment.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No appointment requests</h3>
                    <p className="text-gray-600">You'll see patient appointment requests here when they book with you.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Management</CardTitle>
                <CardDescription>Set your availability and manage your calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Schedule Management</h3>
                  <p className="text-gray-600 mb-4">Set your available hours and manage your appointment calendar.</p>
                  <Button>Configure Schedule</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Your practice statistics for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAnalytics ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Monthly Revenue</span>
                        <span className="font-semibold">R{analytics?.monthlyRevenue || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Appointments This Month</span>
                        <span className="font-semibold">{analytics?.appointmentsThisMonth || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Rating</span>
                        <span className="font-semibold">{analytics?.averageRating || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Practice Insights</CardTitle>
                  <CardDescription>Trends and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-600">Detailed practice analytics and performance metrics coming soon.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}