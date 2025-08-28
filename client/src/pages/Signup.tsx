import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Stethoscope, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin,
  AlertCircle, 
  CheckCircle,
  Calendar
} from 'lucide-react';

const provinces = [
  'Western Cape',
  'Gauteng',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Free State',
  'Northern Cape',
];

const userRoles = [
  { value: 'patient', label: 'Patient - Find and book doctors' },
  { value: 'doctor', label: 'Doctor - Join our medical network' },
];

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'patient' | 'doctor' | '';
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  dateOfBirth: string;
  specialty?: string; // For doctors
  hpcsaNumber?: string; // For doctors
  termsAccepted: boolean;
}

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signUp } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<SignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    firstName: '',
    lastName: '',
    phone: '',
    province: '',
    dateOfBirth: '',
    specialty: '',
    hpcsaNumber: '',
    termsAccepted: false,
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      // First create the auth user
      const authResult = await signUp(data.email, data.password);
      if (authResult.error) {
        throw new Error(authResult.error.message);
      }

      // Then create the profile
      const profileData = {
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        province: data.province,
        dateOfBirth: data.dateOfBirth,
        ...(data.role === 'doctor' && {
          specialty: data.specialty,
          hpcsaNumber: data.hpcsaNumber,
        }),
      };

      return apiRequest('POST', '/api/users/profile', profileData);
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully!",
        description: "Welcome to IronLedger MedMap. You can now start exploring our platform.",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.email || !form.password || !form.confirmPassword || !form.firstName || !form.lastName || !form.role) {
      setError('Please fill in all required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.role === 'doctor' && (!form.specialty || !form.hpcsaNumber)) {
      setError('Doctors must provide specialty and HPCSA number');
      return;
    }

    if (!form.termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    signupMutation.mutate(form);
  };

  const handleChange = (field: keyof SignupForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Stethoscope className="text-primary-foreground h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-primary">IronLedger MedMap</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
            <p className="mt-2 text-muted-foreground">
              Join South Africa's trusted medical network
            </p>
          </div>

          {/* Signup Form */}
          <Card className="shadow-lg" data-testid="card-signup-form">
            <CardHeader>
              <CardTitle className="text-center text-xl">Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-signup">
                {error && (
                  <Alert variant="destructive" data-testid="alert-signup-error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Account Type */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    I am a... *
                  </Label>
                  <Select value={form.role} onValueChange={(value) => handleChange('role', value)}>
                    <SelectTrigger data-testid="select-user-role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        required
                        value={form.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                        className="pl-10"
                        data-testid="input-first-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                        className="pl-10"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className="pl-10"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+27 11 123 4567"
                        className="pl-10"
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-sm font-medium">
                      Province
                    </Label>
                    <Select value={form.province} onValueChange={(value) => handleChange('province', value)}>
                      <SelectTrigger data-testid="select-province">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      className="pl-10"
                      data-testid="input-date-of-birth"
                    />
                  </div>
                </div>

                {/* Doctor-specific fields */}
                {form.role === 'doctor' && (
                  <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary">Medical Professional Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialty" className="text-sm font-medium">
                        Medical Specialty *
                      </Label>
                      <Input
                        id="specialty"
                        type="text"
                        required={form.role === 'doctor'}
                        value={form.specialty}
                        onChange={(e) => handleChange('specialty', e.target.value)}
                        placeholder="e.g., Cardiology, General Practice"
                        data-testid="input-specialty"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hpcsaNumber" className="text-sm font-medium">
                        HPCSA Registration Number *
                      </Label>
                      <Input
                        id="hpcsaNumber"
                        type="text"
                        required={form.role === 'doctor'}
                        value={form.hpcsaNumber}
                        onChange={(e) => handleChange('hpcsaNumber', e.target.value)}
                        placeholder="Enter your HPCSA number"
                        data-testid="input-hpcsa-number"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={form.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10"
                        data-testid="input-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={form.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10"
                        data-testid="input-confirm-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        data-testid="button-toggle-confirm-password"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={form.termsAccepted}
                    onCheckedChange={(checked) => handleChange('termsAccepted', checked === true)}
                    data-testid="checkbox-terms"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the terms and conditions
                    </label>
                    <p className="text-xs text-muted-foreground">
                      By creating an account, you agree to our{' '}
                      <Link href="/terms" className="underline hover:text-primary">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="underline hover:text-primary">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={signupMutation.isPending}
                  data-testid="button-create-account"
                >
                  {signupMutation.isPending ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6">
                <Separator className="mb-6" />
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link href="/login" className="font-medium text-primary hover:underline" data-testid="link-login">
                    Sign in here
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>HPCSA Verified Doctors</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>PayFast Secure Payments</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
