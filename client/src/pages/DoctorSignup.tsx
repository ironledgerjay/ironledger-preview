import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/BackButton';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Stethoscope, Shield, Clock } from 'lucide-react';

const provinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

const specialties = [
  'General Practice', 'Cardiology', 'Dermatology', 'Emergency Medicine',
  'Family Medicine', 'Internal Medicine', 'Neurology', 'Obstetrics & Gynecology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery', 'Urology'
];

interface DoctorSignupForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  specialty: string;
  hpcsaNumber: string;
  province: string;
  city: string;
  zipCode: string;
  practiceAddress: string;
  consultationFee: string;
  qualifications: string;
  experience: string;
}

export default function DoctorSignup() {
  useActivityLogger('doctor_signup');
  
  const { toast } = useToast();
  const [formData, setFormData] = useState<DoctorSignupForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialty: '',
    hpcsaNumber: '',
    province: '',
    city: '',
    zipCode: '',
    practiceAddress: '',
    consultationFee: '',
    qualifications: '',
    experience: ''
  });

  const signupMutation = useMutation({
    mutationFn: async (data: DoctorSignupForm) => {
      return apiRequest('POST', '/api/doctors/signup', data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted Successfully!",
        description: "Your doctor profile has been submitted for admin approval. You'll receive an email once approved.",
        duration: 10000,
      });
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        specialty: '',
        hpcsaNumber: '',
        province: '',
        city: '',
        zipCode: '',
        practiceAddress: '',
        consultationFee: '',
        qualifications: '',
        experience: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Signup Failed",
        description: error.message || "There was an error processing your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof DoctorSignupForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <BackButton />
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Doctor Registration</h1>
          <p className="text-gray-600">Join IronLedger MedMap as a verified medical professional</p>
        </div>

        {/* Process Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-teal-600" />
              Registration Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-teal-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-teal-600 font-bold">1</span>
                </div>
                <h3 className="font-medium mb-2">Submit Application</h3>
                <p className="text-sm text-gray-600">Complete your registration with medical credentials</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-medium mb-2">Admin Verification</h3>
                <p className="text-sm text-gray-600">Our team verifies your credentials and HPCSA registration</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Start Practicing</h3>
                <p className="text-sm text-gray-600">Access your portal and begin accepting appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+27 11 123 4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    data-testid="input-phone"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      data-testid="input-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Credentials */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Credentials</CardTitle>
                <CardDescription>Your professional qualifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Specialty *
                  </label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) => handleInputChange('specialty', value)}
                    required
                  >
                    <SelectTrigger data-testid="select-specialty">
                      <SelectValue placeholder="Select your specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="hpcsaNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    HPCSA Registration Number *
                  </label>
                  <Input
                    id="hpcsaNumber"
                    required
                    placeholder="MP123456"
                    value={formData.hpcsaNumber}
                    onChange={(e) => handleInputChange('hpcsaNumber', e.target.value)}
                    data-testid="input-hpcsa-number"
                  />
                </div>

                <div>
                  <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fee (ZAR) *
                  </label>
                  <Input
                    id="consultationFee"
                    type="number"
                    required
                    placeholder="650.00"
                    value={formData.consultationFee}
                    onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                    data-testid="input-consultation-fee"
                  />
                </div>

                <div>
                  <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications *
                  </label>
                  <Textarea
                    id="qualifications"
                    required
                    placeholder="MBChB, MMed (Cardiology), etc."
                    rows={3}
                    value={formData.qualifications}
                    onChange={(e) => handleInputChange('qualifications', e.target.value)}
                    data-testid="textarea-qualifications"
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (Years) *
                  </label>
                  <Input
                    id="experience"
                    type="number"
                    required
                    placeholder="5"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    data-testid="input-experience"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Practice Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Practice Information</CardTitle>
                <CardDescription>Where you practice medicine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <Select
                      value={formData.province}
                      onValueChange={(value) => handleInputChange('province', value)}
                      required
                    >
                      <SelectTrigger data-testid="select-province">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map(province => (
                          <SelectItem key={province} value={province}>{province}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <Input
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      data-testid="input-zip-code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="practiceAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Practice Address *
                  </label>
                  <Textarea
                    id="practiceAddress"
                    required
                    placeholder="123 Medical Centre, Sandton"
                    rows={3}
                    value={formData.practiceAddress}
                    onChange={(e) => handleInputChange('practiceAddress', e.target.value)}
                    data-testid="textarea-practice-address"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex gap-4">
            <BackButton />
            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700 flex-1"
              data-testid="button-submit-registration"
            >
              {signupMutation.isPending ? 'Submitting Application...' : 'Submit Doctor Registration'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}