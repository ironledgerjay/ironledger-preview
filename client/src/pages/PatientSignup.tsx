import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Link } from 'wouter';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const patientSignupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  province: z.string().min(1, 'Please select your province'),
  medicalAidNumber: z.string().optional(),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  agreedToTerms: z.boolean().refine(val => val, 'You must agree to the terms and conditions'),
  agreedToPrivacy: z.boolean().refine(val => val, 'You must agree to the privacy policy'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PatientSignupForm = z.infer<typeof patientSignupSchema>;

const southAfricanProvinces = [
  'Eastern Cape',
  'Free State', 
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
];

export default function PatientSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { logUserAction } = useActivityLogger();

  const form = useForm<PatientSignupForm>({
    resolver: zodResolver(patientSignupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      dateOfBirth: '',
      province: '',
      medicalAidNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      agreedToTerms: false,
      agreedToPrivacy: false,
    },
  });

  const onSubmit = async (data: PatientSignupForm) => {
    setIsLoading(true);
    try {
      logUserAction('patient_registration_attempt', 'patient_signup', {
        province: data.province,
        hasEmergencyContact: true,
      });

      const registrationData = {
        ...data,
        role: 'patient',
        extraData: {
          dateOfBirth: data.dateOfBirth,
          medicalAidNumber: data.medicalAidNumber,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
        }
      };

      await apiRequest('POST', '/api/auth/register', registrationData);
      
      logUserAction('patient_registration_success', 'patient_signup', {
        province: data.province,
      });

      toast({
        title: 'Registration Successful!',
        description: 'Please check your email to verify your account before booking appointments.',
      });

      // Redirect to verification pending page
      window.location.href = '/verification-pending';
      
    } catch (error: any) {
      logUserAction('patient_registration_error', 'patient_signup', {
        error: error.message,
      });

      toast({
        title: 'Registration Failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    const step1Fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    const step2Fields = ['phone', 'dateOfBirth', 'province'];
    
    if (currentStep === 1) {
      form.trigger(step1Fields as any).then(isValid => {
        if (isValid) setCurrentStep(2);
      });
    } else if (currentStep === 2) {
      form.trigger(step2Fields as any).then(isValid => {
        if (isValid) setCurrentStep(3);
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/signup" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration Options
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Patient Registration
            </CardTitle>
            <CardDescription>
              Join MedMap to book appointments with verified doctors across South Africa
            </CardDescription>
            
            {/* Progress Indicator */}
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        data-testid="input-firstName"
                        {...form.register('firstName')}
                        placeholder="Enter your first name"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        data-testid="input-lastName"
                        {...form.register('lastName')}
                        placeholder="Enter your last name"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-email"
                      {...form.register('email')}
                      placeholder="Enter your email address"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        data-testid="input-password"
                        {...form.register('password')}
                        placeholder="Create a password"
                      />
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        data-testid="input-confirmPassword"
                        {...form.register('confirmPassword')}
                        placeholder="Confirm your password"
                      />
                      {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Location */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Contact & Location</h3>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      data-testid="input-phone"
                      {...form.register('phone')}
                      placeholder="+27 XX XXX XXXX"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      data-testid="input-dateOfBirth"
                      {...form.register('dateOfBirth')}
                    />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Select onValueChange={(value) => form.setValue('province', value)}>
                      <SelectTrigger data-testid="select-province">
                        <SelectValue placeholder="Select your province" />
                      </SelectTrigger>
                      <SelectContent>
                        {southAfricanProvinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.province && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.province.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="medicalAidNumber">Medical Aid Number (Optional)</Label>
                    <Input
                      id="medicalAidNumber"
                      data-testid="input-medicalAidNumber"
                      {...form.register('medicalAidNumber')}
                      placeholder="Enter your medical aid number"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Emergency Contact & Terms */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Emergency Contact & Terms</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        data-testid="input-emergencyContactName"
                        {...form.register('emergencyContactName')}
                        placeholder="Full name"
                      />
                      {form.formState.errors.emergencyContactName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.emergencyContactName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        data-testid="input-emergencyContactPhone"
                        {...form.register('emergencyContactPhone')}
                        placeholder="+27 XX XXX XXXX"
                      />
                      {form.formState.errors.emergencyContactPhone && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.emergencyContactPhone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreedToTerms"
                        data-testid="checkbox-agreedToTerms"
                        checked={form.watch('agreedToTerms')}
                        onCheckedChange={(checked) => form.setValue('agreedToTerms', !!checked)}
                      />
                      <Label htmlFor="agreedToTerms" className="text-sm">
                        I agree to the{' '}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms and Conditions
                        </Link>
                      </Label>
                    </div>
                    {form.formState.errors.agreedToTerms && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.agreedToTerms.message}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="agreedToPrivacy"
                        data-testid="checkbox-agreedToPrivacy"
                        checked={form.watch('agreedToPrivacy')}
                        onCheckedChange={(checked) => form.setValue('agreedToPrivacy', !!checked)}
                      />
                      <Label htmlFor="agreedToPrivacy" className="text-sm">
                        I agree to the{' '}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {form.formState.errors.agreedToPrivacy && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.agreedToPrivacy.message}
                      </p>
                    )}
                  </div>

                  <Alert>
                    <AlertDescription>
                      After registration, you'll receive an email verification link. 
                      You must verify your email before booking appointments.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    data-testid="button-previous"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="ml-auto"
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="ml-auto"
                    data-testid="button-register"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Patient Account'}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}