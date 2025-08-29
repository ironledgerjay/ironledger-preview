import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function VerificationPending() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

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

  // Manual verification option
  const handleManualVerification = () => {
    navigate('/verify-email');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <BackButton />
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Account Created Successfully!</span>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Your account has been created. To complete the setup, please verify your email address.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Didn't receive the email?</h3>
              
              <div className="space-y-2">
                <Label htmlFor="email">Enter your email to resend verification</Label>
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
                  'Resend Verification Email'
                )}
              </Button>
              
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={handleManualVerification}
                  className="w-full"
                  data-testid="button-manual-verification"
                >
                  I Have a Verification Link
                </Button>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Check your spam folder if you don't see the email in your inbox.
              </p>
              <p className="text-xs text-gray-500">
                Verification links expire after 24 hours for security.
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