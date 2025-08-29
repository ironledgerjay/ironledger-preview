import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Phone, Mail, MapPin, Heart, FileText, Star, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Link } from 'wouter';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  doctorId: string;
  appointmentDate: Date;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  consultationType: 'in-person' | 'video-call' | 'phone-call';
  reason: string;
  convenienceFee: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    consultationFee: string;
    city: string;
    province: string;
  };
  notes?: string;
}

interface MedicalRecord {
  id: string;
  appointmentId: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  createdAt: Date;
  doctor: {
    firstName: string;
    lastName: string;
    specialty: string;
  };
}

interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  province: string;
  membershipType: 'basic' | 'premium';
  freeBookingsRemaining: number;
  membershipExpiresAt?: Date;
  medicalAidNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const { logPageView } = useActivityLogger();
  const [activeTab, setActiveTab] = useState('appointments');

  // Log page view
  useEffect(() => {
    logPageView('patient_dashboard', { 
      userId: user?.id,
      membershipType: 'unknown' // Will be updated when profile loads
    });
  }, []);

  // Fetch patient profile
  const { data: profile, isLoading: profileLoading } = useQuery<PatientProfile>({
    queryKey: ['/api/patients/profile'],
    enabled: !!user,
  });

  // Fetch appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/patients/appointments'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch medical records
  const { data: medicalRecords = [], isLoading: recordsLoading } = useQuery<MedicalRecord[]>({
    queryKey: ['/api/patients/medical-records'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to access your patient dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) > new Date() && apt.status !== 'cancelled'
  );

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) <= new Date() || apt.status === 'completed'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.firstName || 'Patient'}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your appointments and health records
              </p>
            </div>
            <Link href="/doctors">
              <Button data-testid="button-book-appointment" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Book New Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Membership</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile?.membershipType === 'premium' ? 'default' : 'secondary'}>
                      {profile?.membershipType === 'premium' ? 'Premium' : 'Basic'}
                    </Badge>
                    {profile?.membershipType === 'basic' && (
                      <Link href="/membership">
                        <Button variant="outline" size="sm">Upgrade</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Records</p>
                  <p className="text-2xl font-bold">{medicalRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Free Bookings</p>
                  <p className="text-2xl font-bold">{profile?.freeBookingsRemaining || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments" data-testid="tab-appointments">Appointments</TabsTrigger>
            <TabsTrigger value="records" data-testid="tab-records">Medical Records</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            <TabsTrigger value="billing" data-testid="tab-billing">Billing</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>
                  Your scheduled appointments with doctors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="text-center py-8">Loading appointments...</div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No upcoming appointments</p>
                    <Link href="/doctors">
                      <Button>Book Your First Appointment</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback>
                                  {appointment.doctor.firstName[0]}{appointment.doctor.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">
                                  Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">{appointment.doctor.specialty}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{format(new Date(appointment.appointmentDate), 'PPP')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{format(new Date(appointment.appointmentDate), 'p')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{appointment.doctor.city}, {appointment.doctor.province}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-gray-400" />
                                <span>{appointment.reason}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
                              {appointment.paymentStatus}
                            </Badge>
                            <p className="text-sm font-medium">R{appointment.convenienceFee}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Past Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pastAppointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 opacity-75">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{appointment.doctor.specialty}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(appointment.appointmentDate), 'PPP')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Medical Records Tab */}
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Medical Records
                </CardTitle>
                <CardDescription>
                  Your consultation notes and prescriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recordsLoading ? (
                  <div className="text-center py-8">Loading medical records...</div>
                ) : medicalRecords.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No medical records yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Records will appear here after your consultations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicalRecords.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{record.diagnosis}</h4>
                            <p className="text-sm text-gray-600">
                              Dr. {record.doctor.firstName} {record.doctor.lastName} - {record.doctor.specialty}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {format(new Date(record.createdAt), 'PPP')}
                          </p>
                        </div>
                        
                        {record.prescription && (
                          <div className="bg-blue-50 p-3 rounded mb-3">
                            <h5 className="font-medium text-blue-900 mb-1">Prescription</h5>
                            <p className="text-sm text-blue-800">{record.prescription}</p>
                          </div>
                        )}
                        
                        {record.notes && (
                          <div className="bg-gray-50 p-3 rounded">
                            <h5 className="font-medium text-gray-900 mb-1">Notes</h5>
                            <p className="text-sm text-gray-700">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Manage your personal details and emergency contacts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="text-center py-8">Loading profile...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Basic Information</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Full Name</p>
                              <p className="font-medium">{profile?.firstName} {profile?.lastName}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Email</p>
                              <p className="font-medium">{profile?.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Phone</p>
                              <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Date of Birth</p>
                              <p className="font-medium">
                                {profile?.dateOfBirth ? format(new Date(profile.dateOfBirth), 'PPP') : 'Not provided'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Province</p>
                              <p className="font-medium">{profile?.province || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Emergency Contact</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Contact Name</p>
                              <p className="font-medium">{profile?.emergencyContactName || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Contact Phone</p>
                              <p className="font-medium">{profile?.emergencyContactPhone || 'Not provided'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">Medical Aid</p>
                              <p className="font-medium">{profile?.medicalAidNumber || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button data-testid="button-edit-profile">Edit Profile</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Membership Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Membership & Billing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">
                        {profile?.membershipType === 'premium' ? 'Premium Membership' : 'Basic Membership'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {profile?.membershipType === 'premium' 
                          ? `Expires ${profile.membershipExpiresAt ? format(new Date(profile.membershipExpiresAt), 'PPP') : 'Never'}`
                          : 'R10 booking fee applies'
                        }
                      </p>
                      <p className="text-sm text-blue-600 font-medium">
                        {profile?.freeBookingsRemaining || 0} free bookings remaining
                      </p>
                    </div>
                    {profile?.membershipType === 'basic' && (
                      <Link href="/membership">
                        <Button>Upgrade to Premium</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No payment history yet</p>
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