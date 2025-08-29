import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthNew } from '@/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, User, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface LoginForm {
  email: string;
  password: string;
  twoFactorToken?: string;
}

export default function LoginNew() {
  useActivityLogger('enhanced_login_page');
  
  const [, setLocation] = useLocation();
  const { login, forgotPassword } = useAuthNew();
  const [activeTab, setActiveTab] = useState('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    twoFactorToken: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const role = params.get('role');
    if (accessToken) {
      try { localStorage.setItem('accessToken', accessToken); } catch {}
      if (role === 'doctor') {
        setLocation('/doctor-portal');
      } else {
        setLocation('/');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      await login(formData.email, formData.password, formData.twoFactorToken);
      
      // Redirect based on role
      if (activeTab === 'doctor') {
        setLocation('/doctor-portal');
      } else {
        setLocation('/');
      }
    } catch (error: any) {
      if (error.message.includes('2FA_REQUIRED')) {
        setShow2FA(true);
      }
      // Other errors handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert('Please enter your email address first');
      return;
    }
    
    try {
      await forgotPassword(formData.email);
    } catch (error) {
      // Error handled by the hook
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'dr.johnson@example.com',
      password: 'TempPass123!',
      twoFactorToken: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sign In to Your Account
            </CardTitle>
            <CardDescription>
              Access your medical platform dashboard securely
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="doctor" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </TabsTrigger>
                <TabsTrigger value="patient" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="doctor">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button asChild variant="outline">
                    <a href="/api/auth/google">Continue with Google</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/api/auth/facebook">Continue with Facebook</a>
                  </Button>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
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
                        data-testid="input-doctor-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        data-testid="input-doctor-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {show2FA && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Two-Factor Authentication Code
                      </label>
                      <Input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-lg font-mono"
                        value={formData.twoFactorToken}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          twoFactorToken: e.target.value.replace(/\D/g, '').slice(0, 6)
                        }))}
                        data-testid="input-2fa-token"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-teal-600 hover:text-teal-500"
                      data-testid="button-forgot-password"
                    >
                      Forgot password?
                    </button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={fillDemoCredentials}
                      className="text-xs text-blue-600 hover:text-blue-500"
                      data-testid="button-demo-credentials"
                    >
                      Use Demo Credentials
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    data-testid="button-doctor-login"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In as Doctor'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="patient">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button asChild variant="outline">
                    <a href="/api/auth/google">Continue with Google</a>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/api/auth/facebook">Continue with Facebook</a>
                  </Button>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
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
                        data-testid="input-patient-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        data-testid="input-patient-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {show2FA && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Two-Factor Authentication Code
                      </label>
                      <Input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-lg font-mono"
                        value={formData.twoFactorToken}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          twoFactorToken: e.target.value.replace(/\D/g, '').slice(0, 6)
                        }))}
                        data-testid="input-2fa-token"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Enter the 6-digit code from your authenticator app
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-teal-600 hover:text-teal-500"
                      data-testid="button-forgot-password"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-patient-login"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In as Patient'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setLocation(activeTab === 'doctor' ? '/doctor-signup' : '/signup')}
                  className="text-teal-600 hover:text-teal-500 font-medium"
                  data-testid="button-signup-link"
                >
                  Sign up here
                </button>
              </p>
            </div>

            {/* Security Notice */}
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                <strong>Enhanced Security:</strong> This platform now features JWT authentication, 
                email verification, password strength validation, and optional two-factor authentication 
                for maximum account protection.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
