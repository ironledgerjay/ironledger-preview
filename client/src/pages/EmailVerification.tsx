import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle, Mail, AlertCircle, Loader2 } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function EmailVerification() {
  const [location, navigate] = useLocation();
  const [match, params] = useRoute('/verify-email');
  const { toast } = useToast();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  
  // Get token from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setError('');
    
    try {
      const response = await apiRequest('POST', '/api/auth/verify-email', {
        token: verificationToken
      });
      
      setIsVerified(true);
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified. Redirecting to home page...",
      });
      
      // Redirect to home page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Email verification error:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify email');
      toast({
        title: "Verification Failed",
        description: "There was an error verifying your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsResending(true);
    setError('');
    
    try {
      await apiRequest('POST', '/api/auth/resend-verification', {
        email: email
      });
      
      toast({
        title: "Email Sent!",
        description: "Verification email has been sent. Please check your inbox.",
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      setError(error instanceof Error ? error.message : 'Failed to resend verification email');
      toast({
        title: "Failed to Send",
        description: "There was an error sending the verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Verifying Your Email</h2>
              <p className="text-sm text-gray-600 text-center">
                Please wait while we verify your email address...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-sm text-gray-600 text-center">
                Your email has been successfully verified. You now have full access to IronLedger MedMap.
              </p>
              <p className="text-xs text-gray-500 text-center">
                Redirecting to home page in a few seconds...
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Home Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <BackButton />
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              {token 
                ? "We're processing your verification..." 
                : "Enter your email to receive a new verification link"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!token && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    data-testid="input-email"
                  />
                </div>
                
                <Button 
                  onClick={resendVerificationEmail}
                  disabled={isResending || !email}
                  className="w-full"
                  data-testid="button-resend-verification"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Verification Email'
                  )}
                </Button>
              </>
            )}
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Check your email for a verification link from IronLedger MedMap
              </p>
              <p className="text-xs text-gray-500">
                Didn't receive an email? Check your spam folder or request a new one.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}