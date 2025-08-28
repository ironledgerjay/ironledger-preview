import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MembershipPlans from '@/components/MembershipPlans';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Check, X, Star, Shield, CreditCard, Users } from 'lucide-react';

export default function Membership() {
  const { user } = useAuth();
  
  // Mock user membership data - in real app, this would come from the API
  const { data: membershipData } = useQuery({
    queryKey: ['/api/membership', user?.id],
    enabled: !!user,
    // Mock data for now
    queryFn: () => Promise.resolve({
      type: 'basic',
      freeBookingsRemaining: 0,
      membershipExpiresAt: null,
    }),
  });

  const benefits = [
    {
      category: 'Access & Search',
      items: [
        { feature: 'Doctor directory access', basic: true, premium: true },
        { feature: 'Basic search filters', basic: true, premium: true },
        { feature: 'Advanced search filters', basic: false, premium: true },
        { feature: 'Province-wide search', basic: true, premium: true },
        { feature: 'Specialty filtering', basic: true, premium: true },
      ]
    },
    {
      category: 'Bookings & Payments',
      items: [
        { feature: 'Unlimited doctor browsing', basic: true, premium: true },
        { feature: 'Appointment booking', basic: true, premium: true },
        { feature: 'Convenience fee per booking', basic: 'R10', premium: 'R0 (first 5/quarter)' },
        { feature: 'PayFast secure payments', basic: true, premium: true },
        { feature: 'Booking history', basic: true, premium: true },
      ]
    },
    {
      category: 'Support & Features',
      items: [
        { feature: 'Email support', basic: true, premium: true },
        { feature: 'Priority support', basic: false, premium: true },
        { feature: 'Appointment reminders', basic: false, premium: true },
        { feature: 'Doctor reviews access', basic: true, premium: true },
        { feature: 'Emergency doctor finder', basic: true, premium: true },
      ]
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Family Physician, Cape Town',
      content: 'IronLedger MedMap has significantly improved my patient reach across the Western Cape.',
      rating: 5,
    },
    {
      name: 'Thabo Mthembu',
      role: 'Premium Member, Johannesburg',
      content: 'The 5 free bookings per quarter have saved me money and the platform is incredibly reliable.',
      rating: 5,
    },
    {
      name: 'Dr. Nomsa Dlamini',
      role: 'Pediatrician, Durban',
      content: 'Professional platform that connects me with patients who really need quality care.',
      rating: 5,
    },
  ];

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <X className="h-5 w-5 text-red-500" />
      );
    }
    return <span className="text-sm text-muted-foreground">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5" data-testid="section-membership-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              Choose Your <span className="text-primary">Membership</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get access to South Africa's most comprehensive medical professional network. 
              Start free or save with our Premium quarterly plan.
            </p>
            
            {/* Current Membership Status */}
            {user && membershipData && (
              <Card className="max-w-md mx-auto bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Current Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {membershipData.type === 'premium' ? 'Premium' : 'Basic (Free)'}
                      </p>
                    </div>
                    <Badge variant={membershipData.type === 'premium' ? 'default' : 'secondary'}>
                      {membershipData.type === 'premium' ? 'Premium' : 'Basic'}
                    </Badge>
                  </div>
                  {membershipData.type === 'premium' && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Free bookings remaining: <span className="font-semibold text-primary">
                          {membershipData.freeBookingsRemaining}
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Membership Plans Section */}
      <MembershipPlans />

      {/* Detailed Comparison Table */}
      <section className="py-20 bg-card" data-testid="section-comparison-table">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Detailed Feature Comparison</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="space-y-12">
            {benefits.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-xl font-semibold text-foreground mb-6 border-b border-border pb-3">
                  {category.category}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <h4 className="font-medium text-muted-foreground mb-4">Features</h4>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-muted-foreground mb-4">Basic Plan</h4>
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-muted-foreground mb-4">Premium Plan</h4>
                  </div>
                </div>
                
                {category.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 border-b border-border/50 last:border-b-0"
                    data-testid={`comparison-row-${categoryIndex}-${itemIndex}`}
                  >
                    <div className="lg:col-span-1">
                      <p className="text-foreground">{item.feature}</p>
                    </div>
                    <div className="text-center">
                      {renderFeatureValue(item.basic)}
                    </div>
                    <div className="text-center">
                      {renderFeatureValue(item.premium)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Premium Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/30 to-accent/20" data-testid="section-why-premium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Premium?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Premium membership pays for itself with just 4 bookings per quarter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg">
              <CardContent className="p-8">
                <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Save Money</h3>
                <p className="text-muted-foreground text-sm">
                  R39 quarterly vs R50+ in booking fees
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Priority Support</h3>
                <p className="text-muted-foreground text-sm">
                  Get help faster when you need it most
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="p-8">
                <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Advanced Features</h3>
                <p className="text-muted-foreground text-sm">
                  Better search and appointment reminders
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardContent className="p-8">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Community</h3>
                <p className="text-muted-foreground text-sm">
                  Join thousands of satisfied Premium members
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card" data-testid="section-membership-testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Community Says</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from doctors and patients who trust IronLedger MedMap
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg" data-testid={`testimonial-card-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
