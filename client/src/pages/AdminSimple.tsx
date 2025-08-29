import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import BackButton from "@/components/BackButton";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  metadata: string;
}

interface Stats {
  totalDoctors: number;
  totalPatients: number;
  totalBookings: number;
  averageRating: number;
  totalUsers: number;
  premiumMembers: number;
  activeUsers: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Payment {
  id: string;
  userId: string;
  amount: string;
  status: string;
  type: string;
  createdAt: string;
  user?: User;
}

export default function AdminSimple() {
  // Always call hooks at the top level
  useActivityLogger();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State hooks
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretPhrase, setSecretPhrase] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'payments' | 'stats' | 'enroll'>('pending');
  
  // Enrollment form state
  const [enrollmentForm, setEnrollmentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    hpcsaNumber: '',
    practiceLocation: '',
    yearsExperience: '',
    medicalSchool: '',
    notes: ''
  });

  // All queries - always called
  const { data: pendingDoctors = [], isLoading: loadingPending } = useQuery<Doctor[]>({
    queryKey: ['/api/crm/doctors/pending'],
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 3000 : false,
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ['/api/crm/users'],
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 5000 : false,
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery<Payment[]>({
    queryKey: ['/api/crm/payments'],
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 15000 : false,
  });

  const { data: stats, isLoading: loadingStats } = useQuery<Stats>({
    queryKey: ['/api/crm/stats'],
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 10000 : false,
  });

  // Mutations - always called
  const approveDoctorMutation = useMutation({
    mutationFn: async ({ doctorId, isVerified, notes }: { doctorId: string; isVerified: boolean; notes?: string }) => {
      const response = await fetch(`/api/crm/doctors/${doctorId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified, notes }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/doctors/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
      toast({
        title: "Doctor Status Updated",
        description: "Doctor verification status has been updated successfully.",
      });
    },
  });

  const removeUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await fetch(`/api/crm/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
      toast({
        title: "User Removed",
        description: "User account has been successfully removed.",
      });
    },
  });

  const enrollDoctor = useMutation({
    mutationFn: async (formData: typeof enrollmentForm) => {
      const response = await fetch('/api/admin/enroll-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
      toast({
        title: "Doctor Enrolled Successfully",
        description: `Dr. ${enrollmentForm.firstName} ${enrollmentForm.lastName} has been enrolled and is now visible on the platform.`,
      });
      // Reset form
      setEnrollmentForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: '',
        hpcsaNumber: '',
        practiceLocation: '',
        yearsExperience: '',
        medicalSchool: '',
        notes: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll doctor. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleAdminAuth = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel.",
      });
      setIsAuthenticating(false);
    }, 500);
  };

  const handleDoctorAction = (doctorId: string, isVerified: boolean) => {
    const notes = isVerified 
      ? "HPCSA verification completed successfully. Account approved for platform use."
      : "Application does not meet current verification requirements.";
    
    approveDoctorMutation.mutate({ doctorId, isVerified, notes });
  };

  const handleRemoveUser = (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove the account for ${userEmail}?`)) {
      return;
    }
    const reason = prompt('Please provide a reason for account removal:') || 'Policy violation';
    removeUser.mutate({ userId, reason });
  };

  const handleEnrollmentFormChange = (field: string, value: string) => {
    setEnrollmentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEnrollDoctor = () => {
    if (!enrollmentForm.firstName || !enrollmentForm.lastName || !enrollmentForm.email || !enrollmentForm.specialization) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the doctor's name, email, and specialization.",
        variant: "destructive",
      });
      return;
    }
    enrollDoctor.mutate(enrollmentForm);
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
            <CardDescription>
              Enter the secret phrase to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="secretPhrase" className="text-sm font-medium">
                Secret Phrase
              </label>
              <Input
                id="secretPhrase"
                type="text"
                value={secretPhrase}
                onChange={(e) => setSecretPhrase(e.target.value)}
                placeholder="Enter anything to access admin panel"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
                data-testid="input-secret-phrase"
              />
              <p className="text-xs text-muted-foreground">
                Demo mode: Enter any text to access admin panel
              </p>
            </div>
            <Button 
              onClick={handleAdminAuth}
              disabled={isAuthenticating}
              className="w-full"
              data-testid="button-admin-auth"
            >
              {isAuthenticating ? "Accessing..." : "Access Admin Panel"}
            </Button>
            <div className="text-center">
              <BackButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main admin panel UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive platform management and analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Live Updates Active
              </Badge>
              <BackButton />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending Approvals
              {pendingDoctors.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {pendingDoctors.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="payments">Payment Analytics</TabsTrigger>
            <TabsTrigger value="stats">Platform Statistics</TabsTrigger>
            <TabsTrigger value="enroll">Manual Enrollment</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Doctor Approvals</CardTitle>
                <CardDescription>
                  Review and approve doctor registrations (Updates every 3 seconds)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPending ? (
                  <div className="text-center py-4">Loading pending doctors...</div>
                ) : pendingDoctors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending doctor approvals at this time
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingDoctors.map((doctor) => (
                      <div key={doctor.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">Dr. {doctor.firstName} {doctor.lastName}</h3>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                            <p className="text-sm text-gray-600">{doctor.email}</p>
                            <p className="text-xs text-gray-500">Applied: {new Date(doctor.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleDoctorAction(doctor.id, true)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={approveDoctorMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleDoctorAction(doctor.id, false)}
                              size="sm"
                              variant="destructive"
                              disabled={approveDoctorMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all platform users (Updates every 5 seconds)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">Role: {user.role} | Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button
                          onClick={() => handleRemoveUser(user.id, user.email)}
                          size="sm"
                          variant="destructive"
                          disabled={removeUser.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Analytics</CardTitle>
                <CardDescription>
                  Monitor PayFast transactions and memberships (Updates every 15 seconds)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPayments ? (
                  <div className="text-center py-4">Loading payments...</div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No payment transactions recorded yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">R{payment.amount}</h3>
                            <p className="text-sm text-gray-600">Type: {payment.type}</p>
                            <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={payment.status === 'COMPLETE' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>
                  Live platform metrics and analytics (Updates every 10 seconds)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="text-center py-4">Loading statistics...</div>
                ) : stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-blue-600">{stats.totalDoctors}</h3>
                      <p className="text-sm text-gray-600">Total Doctors</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-green-600">{stats.totalPatients}</h3>
                      <p className="text-sm text-gray-600">Total Patients</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-purple-600">{stats.totalBookings}</h3>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <h3 className="text-2xl font-bold text-orange-600">{stats.premiumMembers}</h3>
                      <p className="text-sm text-gray-600">Premium Members</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Unable to load statistics
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enroll">
            <Card>
              <CardHeader>
                <CardTitle>Manual Doctor Enrollment</CardTitle>
                <CardDescription>
                  Directly enroll verified doctors to bypass the approval process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input 
                        placeholder="Sarah" 
                        value={enrollmentForm.firstName}
                        onChange={(e) => handleEnrollmentFormChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input 
                        placeholder="Mthembu" 
                        value={enrollmentForm.lastName}
                        onChange={(e) => handleEnrollmentFormChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <Input 
                        placeholder="dr.sarah@example.com" 
                        type="email" 
                        value={enrollmentForm.email}
                        onChange={(e) => handleEnrollmentFormChange('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input 
                        placeholder="+27 11 123 4567" 
                        value={enrollmentForm.phone}
                        onChange={(e) => handleEnrollmentFormChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Medical Specialization</label>
                      <Input 
                        placeholder="Cardiologist" 
                        value={enrollmentForm.specialization}
                        onChange={(e) => handleEnrollmentFormChange('specialization', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">HPCSA Registration Number</label>
                      <Input 
                        placeholder="MP123456" 
                        value={enrollmentForm.hpcsaNumber}
                        onChange={(e) => handleEnrollmentFormChange('hpcsaNumber', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Practice Location</label>
                    <Input 
                      placeholder="Johannesburg, Gauteng" 
                      value={enrollmentForm.practiceLocation}
                      onChange={(e) => handleEnrollmentFormChange('practiceLocation', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Years of Experience</label>
                    <Input 
                      placeholder="15" 
                      type="number" 
                      min="1" 
                      max="50" 
                      value={enrollmentForm.yearsExperience}
                      onChange={(e) => handleEnrollmentFormChange('yearsExperience', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Medical School</label>
                    <Input 
                      placeholder="University of the Witwatersrand" 
                      value={enrollmentForm.medicalSchool}
                      onChange={(e) => handleEnrollmentFormChange('medicalSchool', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Notes</label>
                    <Input 
                      placeholder="Pre-verified credentials, direct enrollment approved by admin" 
                      value={enrollmentForm.notes}
                      onChange={(e) => handleEnrollmentFormChange('notes', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={handleEnrollDoctor}
                      disabled={enrollDoctor.isPending}
                    >
                      {enrollDoctor.isPending ? "Enrolling..." : "Enroll Doctor Immediately"}
                    </Button>
                    <Button variant="outline" className="flex-1" disabled={enrollDoctor.isPending}>
                      Save as Draft
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">Enrollment Benefits</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Immediate platform access without approval queue</li>
                      <li>• Pre-verified professional status</li>
                      <li>• Instant booking system activation</li>
                      <li>• Direct integration with PayFast payment processing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}