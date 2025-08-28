import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Log successful payment
    console.log('Payment successful!');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50" data-testid="section-payment-success">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Payment Successful!</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Thank you for your payment. Your transaction has been processed successfully.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto shadow-lg" data-testid="card-payment-confirmation">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <span>Payment Confirmation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold text-green-600">Successful</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-semibold">PayFast</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-semibold">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Your membership has been activated immediately</li>
                    <li>• You can now book appointments with reduced fees</li>
                    <li>• A confirmation email has been sent to your registered address</li>
                    <li>• Premium features are now available in your account</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <Button variant="outline" size="lg" data-testid="button-back-home">
                  Back to Home
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" data-testid="button-find-doctors">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Find Doctors Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}