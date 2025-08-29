import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function PaymentCancelled() {
  const [location, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <BackButton />
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-800">Payment Cancelled</CardTitle>
            <CardDescription>
              Your payment was cancelled. No charges have been made to your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">What happened?</h3>
              <p className="text-sm text-blue-700">
                The payment process was cancelled before completion. You can try again or contact support if you experienced any issues.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/membership')}
                className="w-full"
                data-testid="button-try-again"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Try Payment Again
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
                data-testid="button-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => navigate('/contact')}
                className="w-full"
                data-testid="button-contact"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}