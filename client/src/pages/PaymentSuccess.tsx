import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';

export default function PaymentSuccess() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Payment Successful!",
      description: "Your membership has been upgraded successfully.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <BackButton />
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
            <CardDescription>
              Congratulations! Your membership has been upgraded to Premium.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Premium Benefits Activated
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-center">
                  <Gift className="h-4 w-4 mr-2" />
                  5 free bookings per quarter
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  No booking fees for free bookings
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Priority customer support
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Advanced search filters
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
                data-testid="button-home"
              >
                Go to Homepage
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/membership')}
                className="w-full"
                data-testid="button-membership"
              >
                View Membership Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}