import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaymentCancelled() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20 bg-gradient-to-br from-red-50 to-pink-50" data-testid="section-payment-cancelled">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Payment Cancelled</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your payment was cancelled. No charges have been made to your account.
              </p>
            </div>
            
            <Card className="max-w-2xl mx-auto shadow-lg" data-testid="card-payment-cancelled">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                  <span>Payment Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-red-600 font-semibold">Transaction Cancelled</p>
                  <p className="text-muted-foreground">
                    You cancelled the payment process or there was an issue processing your payment.
                  </p>
                </div>
                
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-foreground mb-4">What can you do now?</h3>
                  <ul className="space-y-2 text-muted-foreground text-left">
                    <li>• Try the payment process again</li>
                    <li>• Check your payment method details</li>
                    <li>• Contact support if you continue to experience issues</li>
                    <li>• Use the free Basic plan to explore the platform</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/">
                <Button variant="outline" size="lg" data-testid="button-back-home">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/membership">
                <Button size="lg" data-testid="button-try-again">
                  Try Payment Again
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