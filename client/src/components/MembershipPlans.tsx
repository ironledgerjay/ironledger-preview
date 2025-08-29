import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2 } from 'lucide-react';
import { usePayFast } from '@/hooks/usePayFast';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface MembershipPlansProps {
  onSelectPlan?: (plan: 'basic' | 'premium') => void;
}

export default function MembershipPlans({ onSelectPlan }: MembershipPlansProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Create payment mutation
  const createPayment = useMutation({
    mutationFn: async ({ membershipType }: { membershipType: string }) => {
      if (!user?.id) throw new Error('User not logged in');
      
      const response = await apiRequest('POST', '/api/membership/payment', {
        userId: user.id,
        membershipType
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to PayFast payment URL
      window.location.href = data.paymentUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePremiumUpgrade = (membershipType: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to upgrade your membership.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    createPayment.mutate({ membershipType });
  };

  const basicFeatures = [
    { text: 'Access to doctor directory', included: true },
    { text: 'Basic search filters', included: true },
    { text: 'View doctor profiles', included: true },
    { text: 'R10 convenience fee per booking', included: false, warning: true },
  ];

  const premiumFeatures = [
    { text: 'Everything in Basic plan', included: true },
    { text: '5 FREE bookings per quarter', included: true, highlight: true },
    { text: 'Priority customer support', included: true },
    { text: 'Advanced search filters', included: true },
    { text: 'Appointment reminders', included: true },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-secondary/30 to-accent/20" data-testid="section-membership-plans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Choose Your Membership Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Affordable healthcare access with PayFast secure payment processing
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <Card className="shadow-lg border border-border" data-testid="card-plan-basic">
            <CardHeader>
              <div className="text-center space-y-4">
                <CardTitle className="text-2xl font-bold text-foreground">Basic Plan</CardTitle>
                <div className="space-y-2">
                  <span className="text-4xl font-bold text-primary">FREE</span>
                  <p className="text-muted-foreground">Forever</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                {basicFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <span className={feature.warning ? 'text-muted-foreground' : ''}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => onSelectPlan?.('basic')}
                data-testid="button-select-basic-plan"
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>
          
          {/* Premium Plan */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl border-2 border-primary relative" data-testid="card-plan-premium">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-2">
                Most Popular
              </Badge>
            </div>
            
            <CardHeader>
              <div className="text-center space-y-4">
                <CardTitle className="text-2xl font-bold text-foreground">Premium Plan</CardTitle>
                <div className="space-y-2">
                  <span className="text-4xl font-bold text-primary">R39</span>
                  <p className="text-muted-foreground">Per Quarter</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-4">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className={feature.highlight ? 'font-semibold' : ''}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => handlePremiumUpgrade('premium')}
                  disabled={createPayment.isPending}
                  data-testid="button-select-premium-quarterly"
                >
                  {createPayment.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upgrade - R39 Quarterly'
                  )}
                </Button>
                
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => handlePremiumUpgrade('annual')}
                  disabled={createPayment.isPending}
                  data-testid="button-select-premium-annual"
                >
                  {createPayment.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upgrade - R149 Annual (Save 24%)'
                  )}
                </Button>
              </div>
              
              {/* PayFast Trust Badge */}
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secured by PayFast</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
