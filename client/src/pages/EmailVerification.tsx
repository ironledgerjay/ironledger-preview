import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthNew } from '@/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function EmailVerification() {
  const [, setLocation] = useLocation();
  const { verifyEmail, resendVerification } = useAuthNew();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resend'>('loading');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      verifyEmail(token)
        .then(() => {
          setStatus('success');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            setLocation('/login');
          }, 3000);
        })
        .catch(() => {
          setStatus('error');
        });
    } else {
      setStatus('resend');
    }
  }, [verifyEmail, setLocation]);

  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await resendVerification(email);
      setStatus('loading');
    } catch (error) {
      // Error handled by the hook
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full" />
            </div>
            <CardTitle className="text-2xl">Verifying Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now log in to your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Redirecting to login page in 3 seconds...
            </p>
            <Button 
              onClick={() => setLocation('/login')}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Verification Failed</CardTitle>
            <CardDescription>
              The verification link is invalid or has expired. Please request a new verification email.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>
            
            <Button
              onClick={handleResendVerification}
              disabled={!email || isResending}
              className="w-full bg-teal-600 hover:bg-teal-700"
              data-testid="button-resend-verification"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/login')}
                className="text-gray-600"
                data-testid="button-back-to-login"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resend verification form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            Enter your email address to receive a new verification link.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="input-email"
            />
          </div>
          
          <Button
            onClick={handleResendVerification}
            disabled={!email || isResending}
            className="w-full bg-teal-600 hover:bg-teal-700"
            data-testid="button-resend-verification"
          >
            {isResending ? 'Sending...' : 'Send Verification Email'}
          </Button>
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/login')}
              className="text-gray-600"
              data-testid="button-back-to-login"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}