import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Lock, 
  User, 
  Stethoscope, 
  Eye, 
  EyeOff,
  ArrowRight,
  Shield,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuthNew } from '@/hooks/useAuthNew';
import { useToast } from '@/hooks/use-toast';

const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
  "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"
];

const specialties = [
  "General Practice", "Cardiology", "Dermatology", "Neurology", 
  "Orthopedics", "Pediatrics", "Psychiatry", "Radiology", "Emergency Medicine", 
  "Gynecology", "Ophthalmology", "Anesthesiology"
];

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  province: string;
  city: string;
  specialty?: string;
  hpcsaNumber?: string;
  practiceAddress?: string;
  bio?: string;
  agreeToTerms: boolean;
}

export default function Signup() {
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    province: '',
    city: '',
    specialty: '',
    hpcsaNumber: '',
    practiceAddress: '',
    bio: '',
    agreeToTerms: false,
  });
  
  const [, setLocation] = useLocation();
  const { register } = useAuthNew();
  const { toast } = useToast();

  const handleChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        role: userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        province: formData.province,
        city: formData.city,
        ...(userType === 'doctor' && {
          specialty: formData.specialty || undefined,
          hpcsaNumber: formData.hpcsaNumber || undefined,
          practiceAddress: formData.practiceAddress || undefined,
        }),
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4" data-testid="page-signup">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join IronLedger MedMap
          </h1>
          <p className="text-muted-foreground">
            Create your account to access quality healthcare across South Africa
          </p>
        </div>

        {/* User Type Selection */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={userType === 'patient' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setUserType('patient')}
            data-testid="button-select-patient"
          >
            <User className="h-4 w-4 mr-2" />
            I'm a Patient
          </Button>
          <Button
            type="button"
            variant={userType === 'doctor' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => setUserType('doctor')}
            data-testid="button-select-doctor"
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            I'm a Doctor
          </Button>
        </div>

        {/* Signup Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {userType === 'doctor' ? (
                <Stethoscope className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
              {userType === 'doctor' ? 'Doctor Registration' : 'Patient Registration'}
            </CardTitle>
            {userType === 'doctor' && (
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Verification Required
                </Badge>
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  HPCSA Verified
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required
                      data-testid="input-signup-firstname"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required
                      data-testid="input-signup-lastname"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-signup-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27 XX XXX XXXX"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-signup-phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className="pl-10 pr-10"
                        required
                        data-testid="input-signup-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10"
                        required
                        data-testid="input-signup-confirm-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="province" className="text-sm font-medium text-foreground">
                      Province *
                    </label>
                    <Select
                      value={formData.province}
                      onValueChange={(value) => handleChange('province', value)}
                    >
                      <SelectTrigger data-testid="select-signup-province">
                        <SelectValue placeholder="Select your province" />
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

                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium text-foreground">
                      City *
                    </label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Enter your city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      required
                      data-testid="input-signup-city"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor-specific fields */}
              {userType === 'doctor' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Professional Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="specialty" className="text-sm font-medium text-foreground">
                        Medical Specialty *
                      </label>
                      <Select
                        value={formData.specialty}
                        onValueChange={(value) => handleChange('specialty', value)}
                      >
                        <SelectTrigger data-testid="select-signup-specialty">
                          <SelectValue placeholder="Select your specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="hpcsaNumber" className="text-sm font-medium text-foreground">
                        HPCSA Number *
                      </label>
                      <Input
                        id="hpcsaNumber"
                        type="text"
                        placeholder="Enter your HPCSA number"
                        value={formData.hpcsaNumber}
                        onChange={(e) => handleChange('hpcsaNumber', e.target.value)}
                        required
                        data-testid="input-signup-hpcsa"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="practiceAddress" className="text-sm font-medium text-foreground">
                      Practice Address
                    </label>
                    <Textarea
                      id="practiceAddress"
                      placeholder="Enter your practice address"
                      value={formData.practiceAddress}
                      onChange={(e) => handleChange('practiceAddress', e.target.value)}
                      rows={3}
                      data-testid="textarea-signup-practice-address"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium text-foreground">
                      Professional Bio
                    </label>
                    <Textarea
                      id="bio"
                      placeholder="Tell patients about your experience and qualifications..."
                      value={formData.bio}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      rows={4}
                      data-testid="textarea-signup-bio"
                    />
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleChange('agreeToTerms', !!checked)}
                  data-testid="checkbox-terms"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground leading-tight">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms and Conditions
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
                data-testid="button-signup-submit"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Doctor Verification Notice */}
        {userType === 'doctor' && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                    Doctor Account Verification Process
                  </p>
                  <ul className="space-y-1 text-orange-700 dark:text-orange-300">
                    <li>• Your HPCSA number will be verified with the Health Professions Council</li>
                    <li>• Background checks will be conducted for patient safety</li>
                    <li>• You'll receive an email once verification is complete (3-5 business days)</li>
                    <li>• Your profile will be visible to patients only after approval</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
