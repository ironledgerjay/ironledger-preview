import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthNew } from '@/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, User, Eye, EyeOff, Mail, Lock, Shield, CheckCircle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useActivityLogger } from '@/hooks/useActivityLogger';

const provinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

const specialties = [
  'General Practice', 'Cardiology', 'Dermatology', 'Emergency Medicine',
  'Family Medicine', 'Internal Medicine', 'Neurology', 'Obstetrics & Gynecology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery', 'Urology'
];

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  city: string;
  specialty: string;
  hpcsaNumber: string;
  practiceAddress: string;
  qualifications: string;
  experience: string;
  consultationFee: string;
}

export default function SignupNew() {
  useActivityLogger('enhanced_signup_page');
  
  const [, setLocation] = useLocation();
  const { register } = useAuthNew();
  const [activeTab, setActiveTab] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState<SignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    province: '',
    city: '',
    specialty: '',
    hpcsaNumber: '',
    practiceAddress: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
  });

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 15;
    if (/[@$!%*?&]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  const isPasswordValid = () => {
    return passwordStrength >= 70 && formData.password === formData.confirmPassword;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        role: activeTab as 'patient' | 'doctor',
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        province: formData.province || undefined,
        city: formData.city || undefined,
        ...(activeTab === 'doctor' && {
          specialty: formData.specialty,
          hpcsaNumber: formData.hpcsaNumber,
          practiceAddress: formData.practiceAddress || undefined,
          qualifications: formData.qualifications || undefined,
          experience: formData.experience || undefined,
          consultationFee: formData.consultationFee || undefined,
        }),
      });
      
      // Redirect to email verification page
      setLocation('/verify-email');
    } catch (error) {
      // Error handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < (activeTab === 'doctor' ? 3 : 2)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedStep1 = () => {
    return formData.email && formData.firstName && formData.lastName && isPasswordValid();
  };

  const canProceedStep2 = () => {
    return formData.phone && formData.province && formData.city;
  };

  const canSubmit = () => {
    if (activeTab === 'patient') {
      return canProceedStep1() && canProceedStep2();
    } else {
      return canProceedStep1() && canProceedStep2() && formData.specialty && formData.hpcsaNumber;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Your Account
            </CardTitle>
            <CardDescription>
              Join IronLedger MedMap's secure healthcare platform
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              setCurrentStep(1);
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="patient" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Account
                </TabsTrigger>
                <TabsTrigger value="doctor" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Doctor Account
                </TabsTrigger>
              </TabsList>
              
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Step {currentStep} of {activeTab === 'doctor' ? 3 : 2}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round((currentStep / (activeTab === 'doctor' ? 3 : 2)) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / (activeTab === 'doctor' ? 3 : 2)) * 100}%` }}
                  />
                </div>
              </div>

              <TabsContent value="patient">
                <form onSubmit={handleSignup} className="space-y-6">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            First Name *
                          </label>
                          <Input
                            required
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Last Name *
                          </label>
                          <Input
                            required
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            required
                            placeholder="patient@example.com"
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            data-testid="input-email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Create a strong password"
                            className="pl-10 pr-10"
                            value={formData.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {formData.password && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Password Strength</span>
                              <span>{getPasswordStrengthText(passwordStrength)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="Confirm your password"
                            className="pl-10 pr-10"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            data-testid="input-confirm-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceedStep1()}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        data-testid="button-next-step"
                      >
                        Continue
                      </Button>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Phone Number *
                        </label>
                        <Input
                          type="tel"
                          required
                          placeholder="+27 XX XXX XXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          data-testid="input-phone"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Province *
                        </label>
                        <Select value={formData.province} onValueChange={(value) => setFormData(prev => ({ ...prev, province: value }))}>
                          <SelectTrigger data-testid="select-province">
                            <SelectValue placeholder="Select your province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map(province => (
                              <SelectItem key={province} value={province}>{province}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          City *
                        </label>
                        <Input
                          required
                          placeholder="Cape Town"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          data-testid="input-city"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="flex-1"
                          data-testid="button-prev-step"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading || !canSubmit()}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          data-testid="button-submit-patient"
                        >
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </TabsContent>
              
              <TabsContent value="doctor">
                <form onSubmit={handleSignup} className="space-y-6">
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            First Name *
                          </label>
                          <Input
                            required
                            placeholder="Dr. John"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Last Name *
                          </label>
                          <Input
                            required
                            placeholder="Smith"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            required
                            placeholder="doctor@example.com"
                            className="pl-10"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            data-testid="input-email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Create a strong password"
                            className="pl-10 pr-10"
                            value={formData.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            data-testid="input-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {formData.password && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Password Strength</span>
                              <span>{getPasswordStrengthText(passwordStrength)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            placeholder="Confirm your password"
                            className="pl-10 pr-10"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            data-testid="input-confirm-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceedStep1()}
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        data-testid="button-next-step"
                      >
                        Continue
                      </Button>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Contact & Location</h3>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Phone Number *
                        </label>
                        <Input
                          type="tel"
                          required
                          placeholder="+27 XX XXX XXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          data-testid="input-phone"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Province *
                          </label>
                          <Select value={formData.province} onValueChange={(value) => setFormData(prev => ({ ...prev, province: value }))}>
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
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            City *
                          </label>
                          <Input
                            required
                            placeholder="Johannesburg"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            data-testid="input-city"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Practice Address
                        </label>
                        <Textarea
                          placeholder="123 Medical Plaza, Sandton, Johannesburg"
                          value={formData.practiceAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, practiceAddress: e.target.value }))}
                          data-testid="textarea-practice-address"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="flex-1"
                          data-testid="button-prev-step"
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!canProceedStep2()}
                          className="flex-1 bg-teal-600 hover:bg-teal-700"
                          data-testid="button-next-step"
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Specialty *
                          </label>
                          <Select value={formData.specialty} onValueChange={(value) => setFormData(prev => ({ ...prev, specialty: value }))}>
                            <SelectTrigger data-testid="select-specialty">
                              <SelectValue placeholder="Select specialty" />
                            </SelectTrigger>
                            <SelectContent>
                              {specialties.map(specialty => (
                                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            HPCSA Number *
                          </label>
                          <Input
                            required
                            placeholder="MP0123456"
                            value={formData.hpcsaNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, hpcsaNumber: e.target.value }))}
                            data-testid="input-hpcsa-number"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Qualifications
                        </label>
                        <Textarea
                          placeholder="MBChB, FCRad(D)SA - University of Cape Town"
                          value={formData.qualifications}
                          onChange={(e) => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
                          data-testid="textarea-qualifications"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Years of Experience
                        </label>
                        <Input
                          placeholder="10"
                          value={formData.experience}
                          onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                          data-testid="input-experience"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Consultation Fee (ZAR)
                        </label>
                        <Input
                          placeholder="500"
                          value={formData.consultationFee}
                          onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: e.target.value }))}
                          data-testid="input-consultation-fee"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="flex-1"
                          data-testid="button-prev-step"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading || !canSubmit()}
                          className="flex-1 bg-teal-600 hover:bg-teal-700"
                          data-testid="button-submit-doctor"
                        >
                          {isLoading ? 'Creating Account...' : 'Create Doctor Account'}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setLocation('/login-new')}
                  className="text-teal-600 hover:text-teal-500 font-medium"
                  data-testid="button-login-link"
                >
                  Sign in here
                </button>
              </p>
            </div>

            {/* Security Features Notice */}
            <Alert className="mt-4 border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-xs">
                <strong>Enhanced Security Features:</strong> Password strength validation, 
                email verification, secure JWT authentication, and optional two-factor authentication.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}