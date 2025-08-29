import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, DollarSign, Star, Phone, Video, MapPin, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  hpcsaNumber: string;
  consultationFee: string;
  city: string;
  province: string;
  bio: string;
  isVerified: boolean;
  experience: string;
  qualifications: string;
  practiceAddress: string;
  averageRating: number;
  totalReviews: number;
  profileImageUrl?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  consultationType: 'in-person' | 'video-call' | 'phone-call';
  reason: string;
  notes?: string;
  convenienceFee: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  appointmentId?: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  slots: TimeSlot[];
}

interface Revenue {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalEarnings: number;
}

interface DoctorStats {
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  cancelledAppointments: number;
  averageRating: number;
  totalReviews: number;
  revenue: Revenue;
}

const defaultTimeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function DoctorPortalEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logPageView, logUserAction } = useActivityLogger();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [scheduleChanges, setScheduleChanges] = useState<Record<string, TimeSlot[]>>({});

  // Log page view
  useEffect(() => {
    logPageView('doctor_portal_enhanced', { 
      userId: user?.id,
      role: user?.role 
    });
  }, []);

  // Fetch doctor profile
  const { data: profile, isLoading: profileLoading } = useQuery<DoctorProfile>({
    queryKey: ['/api/doctors/profile'],
    enabled: !!user && user.role === 'doctor',
  });

  // Fetch appointments with real-time updates
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/doctors/appointments'],
    enabled: !!user && user.role === 'doctor',
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Fetch doctor statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DoctorStats>({
    queryKey: ['/api/doctors/stats'],
    enabled: !!user && user.role === 'doctor',
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch weekly schedule
  const { data: weeklySchedule = [], isLoading: scheduleLoading } = useQuery<DaySchedule[]>({
    queryKey: ['/api/doctors/schedule', format(selectedWeek, 'yyyy-MM-dd')],
    enabled: !!user && user.role === 'doctor',
  });

  // Update appointment status mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, status, notes }: { appointmentId: string; status: string; notes?: string }) => {
      return apiRequest('PATCH', `/api/appointments/${appointmentId}`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/doctors/stats'] });
      toast({
        title: 'Appointment Updated',
        description: 'Appointment status has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update appointment.',
        variant: 'destructive',
      });
    },
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: async (scheduleData: Record<string, TimeSlot[]>) => {
      return apiRequest('PUT', '/api/doctors/schedule', { schedule: scheduleData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors/schedule'] });
      setScheduleChanges({});
      toast({
        title: 'Schedule Updated',
        description: 'Your availability has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update schedule.',
        variant: 'destructive',
      });
    },
  });

  if (!user || user.role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This portal is only accessible to verified doctors</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/doctor-signup">
              <Button>Apply as Doctor</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile?.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Account Under Review</CardTitle>
            <CardDescription>
              Your doctor account is being verified by our team. 
              You'll receive an email notification once approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Badge variant="secondary">Verification Pending</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todayAppointments = appointments.filter(apt => 
    format(new Date(apt.appointmentDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) > new Date() && apt.status !== 'cancelled'
  );

  const handleAppointmentAction = (appointmentId: string, action: string, notes?: string) => {
    logUserAction('appointment_action', 'doctor_portal', { 
      appointmentId, 
      action,
      hasNotes: !!notes 
    });
    
    updateAppointmentMutation.mutate({ appointmentId, status: action, notes });
  };

  const handleScheduleChange = (date: string, slotIndex: number, isAvailable: boolean) => {
    setScheduleChanges(prev => {
      const daySchedule = [...(prev[date] || weeklySchedule.find(d => d.date === date)?.slots || [])];
      if (daySchedule[slotIndex]) {
        daySchedule[slotIndex] = { ...daySchedule[slotIndex], isAvailable };
      }
      return { ...prev, [date]: daySchedule };
    });
  };

  const saveScheduleChanges = () => {
    if (Object.keys(scheduleChanges).length > 0) {
      logUserAction('schedule_update', 'doctor_portal', { 
        changedDays: Object.keys(scheduleChanges).length 
      });
      updateScheduleMutation.mutate(scheduleChanges);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.profileImageUrl} />
              <AvatarFallback className="text-lg">
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dr. {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-gray-600">{profile?.specialty}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default">Verified</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{profile?.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-gray-500">({profile?.totalReviews || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Today's Appointments</p>
            <p className="text-2xl font-bold">{todayAppointments.length}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                  <p className="text-2xl font-bold">{stats?.totalAppointments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">{stats?.completedAppointments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold">{stats?.upcomingAppointments || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">R{stats?.revenue?.thisMonth?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="appointments" data-testid="tab-appointments">Appointments</TabsTrigger>
            <TabsTrigger value="schedule" data-testid="tab-schedule">Schedule</TabsTrigger>
            <TabsTrigger value="patients" data-testid="tab-patients">Patients</TabsTrigger>
            <TabsTrigger value="revenue" data-testid="tab-revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No appointments today</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.slice(0, 5).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {appointment.patientName?.split(' ').map(n => n[0]).join('') || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{appointment.patientName}</p>
                              <p className="text-xs text-gray-600">{appointment.reason}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {format(new Date(appointment.appointmentDate), 'HH:mm')}
                            </p>
                            <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('schedule')}
                    data-testid="button-update-schedule"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Update Availability
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('appointments')}
                    data-testid="button-view-appointments"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    View All Appointments
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('revenue')}
                    data-testid="button-view-revenue"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Revenue Analytics
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    asChild
                  >
                    <Link href="/doctors">
                      <MapPin className="w-4 h-4 mr-2" />
                      View Public Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{appointment.patientName}</span> booked an appointment
                        </p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(appointment.createdAt), 'MMM d, HH:mm')}
                        </p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Appointment Management
                </CardTitle>
                <CardDescription>
                  Manage your patient appointments and consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="text-center py-8">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No appointments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback>
                                {appointment.patientName?.split(' ').map(n => n[0]).join('') || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{appointment.patientName}</h4>
                              <p className="text-sm text-gray-600">{appointment.patientEmail}</p>
                              <p className="text-sm text-gray-600">{appointment.patientPhone}</p>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                              {appointment.paymentStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(appointment.appointmentDate), 'PPP')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(appointment.appointmentDate), 'p')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {appointment.consultationType === 'video-call' ? (
                              <Video className="w-4 h-4 text-gray-400" />
                            ) : appointment.consultationType === 'phone-call' ? (
                              <Phone className="w-4 h-4 text-gray-400" />
                            ) : (
                              <MapPin className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="capitalize">{appointment.consultationType.replace('-', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span>R{appointment.convenienceFee}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded mb-4">
                          <p className="text-sm"><strong>Reason:</strong> {appointment.reason}</p>
                          {appointment.notes && (
                            <p className="text-sm mt-1"><strong>Notes:</strong> {appointment.notes}</p>
                          )}
                        </div>

                        {appointment.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                              data-testid={`button-confirm-${appointment.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
                              data-testid={`button-cancel-${appointment.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}

                        {appointment.status === 'confirmed' && new Date(appointment.appointmentDate) < new Date() && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, 'completed')}
                              data-testid={`button-complete-${appointment.id}`}
                            >
                              Mark Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAppointmentAction(appointment.id, 'no-show')}
                              data-testid={`button-no-show-${appointment.id}`}
                            >
                              No Show
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Availability Management
                </CardTitle>
                <CardDescription>
                  Set your weekly availability for patient bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Week Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
                      data-testid="button-prev-week"
                    >
                      Previous Week
                    </Button>
                    <h3 className="text-lg font-semibold">
                      {format(startOfWeek(selectedWeek), 'MMM d')} - {format(endOfWeek(selectedWeek), 'MMM d, yyyy')}
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
                      data-testid="button-next-week"
                    >
                      Next Week
                    </Button>
                  </div>

                  {/* Schedule Grid */}
                  {scheduleLoading ? (
                    <div className="text-center py-8">Loading schedule...</div>
                  ) : (
                    <div className="space-y-4">
                      {weeklySchedule.map((day) => (
                        <div key={day.date} className="border rounded-lg p-4">
                          <h4 className="font-semibold mb-3">
                            {day.dayName} - {format(new Date(day.date), 'MMM d')}
                          </h4>
                          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                            {day.slots.map((slot, index) => {
                              const currentSlots = scheduleChanges[day.date] || day.slots;
                              const currentSlot = currentSlots[index] || slot;
                              
                              return (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={currentSlot.isAvailable ? "default" : "outline"}
                                  className={`${
                                    currentSlot.isBooked 
                                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                      : currentSlot.isAvailable 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                  onClick={() => !currentSlot.isBooked && handleScheduleChange(day.date, index, !currentSlot.isAvailable)}
                                  disabled={currentSlot.isBooked}
                                  data-testid={`slot-${day.date}-${index}`}
                                >
                                  {slot.time}
                                  {currentSlot.isBooked && <span className="ml-1">📅</span>}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Save Changes */}
                  {Object.keys(scheduleChanges).length > 0 && (
                    <div className="flex justify-end">
                      <Button
                        onClick={saveScheduleChanges}
                        disabled={updateScheduleMutation.isPending}
                        data-testid="button-save-schedule"
                      >
                        {updateScheduleMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Patient Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Patient management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="text-center py-8">Loading revenue data...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Today</p>
                        <p className="text-2xl font-bold text-blue-900">
                          R{stats?.revenue?.today?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">This Week</p>
                        <p className="text-2xl font-bold text-green-900">
                          R{stats?.revenue?.thisWeek?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Total Earnings</p>
                        <p className="text-2xl font-bold text-purple-900">
                          R{stats?.revenue?.totalEarnings?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-center py-8">
                      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Detailed analytics coming soon</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}