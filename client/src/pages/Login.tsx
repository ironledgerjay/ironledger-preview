import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/BackButton';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Stethoscope, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  useActivityLogger('login_page');
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('doctor');
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });

  const doctorLoginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return apiRequest('POST', '/api/doctors/login', data);
    },
    onSuccess: (response) => {
      toast({
        title: "Login Successful!",
        description: `Welcome back, Dr. ${response.doctor.firstName}!`,
      });
      // Store login info in localStorage (in real app, use proper authentication)
      localStorage.setItem('doctor_session', JSON.stringify(response));
      setLocation('/doctor-portal');
    },
    onError: (error: any) => {
      if (error.message.includes('pending approval')) {
        toast({
          title: "Account Pending Approval",
          description: "Your doctor account is still under review by our admin team. You'll be notified once approved.",
          variant: "default",
          duration: 8000,
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const patientLoginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      // For now, redirect to main site as patient login isn't implemented
      return Promise.resolve({ success: true });
    },
    onSuccess: () => {
      toast({
        title: "Patient Login",
        description: "Patient authentication coming soon! Redirecting to main site.",
      });
      setLocation('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'doctor') {
      doctorLoginMutation.mutate(formData);
    } else {
      patientLoginMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="mb-6">
          <BackButton />
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2 text-center">Sign In</h1>
          <p className="text-gray-600 text-center">Access your IronLedger MedMap account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Choose your account type to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="doctor" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </TabsTrigger>
                <TabsTrigger value="patient" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient
                </TabsTrigger>
              </TabsList>

              <TabsContent value="doctor" className="space-y-4 mt-6">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-teal-800 mb-1">Doctor Portal Access</h4>
                      <p className="text-sm text-teal-700">
                        Sign in to manage your practice, appointments, and patient bookings.
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="mr-2">Demo Credentials</Badge>
                        <span className="text-xs text-teal-600">
                          Use password: <code className="bg-teal-100 px-1 rounded">TempPass123!</code>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="doctor-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="doctor-email"
                      type="email"
                      required
                      placeholder="doctor@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      data-testid="input-doctor-email"
                    />
                  </div>

                  <div>
                    <label htmlFor="doctor-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <Input
                      id="doctor-password"
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      data-testid="input-doctor-password"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={doctorLoginMutation.isPending}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    data-testid="button-doctor-login"
                  >
                    {doctorLoginMutation.isPending ? 'Signing In...' : 'Sign In as Doctor'}
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Don't have a doctor account?{' '}
                    <a href="/doctor-signup" className="text-teal-600 hover:text-teal-700 font-medium">
                      Register here
                    </a>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="patient" className="space-y-4 mt-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800 mb-1">Patient Access</h4>
                      <p className="text-sm text-orange-700">
                        Patient authentication is coming soon. For now, you can browse doctors and book appointments directly.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="patient-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="patient-email"
                      type="email"
                      required
                      placeholder="patient@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      data-testid="input-patient-email"
                      disabled
                    />
                  </div>

                  <div>
                    <label htmlFor="patient-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <Input
                      id="patient-password"
                      type="password"
                      required
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      data-testid="input-patient-password"
                      disabled
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={true}
                    className="w-full bg-gray-400 cursor-not-allowed"
                    data-testid="button-patient-login"
                  >
                    Patient Login Coming Soon
                  </Button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    For now, visit the{' '}
                    <a href="/" className="text-teal-600 hover:text-teal-700 font-medium">
                      main site
                    </a>
                    {' '}to book appointments
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}