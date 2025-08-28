import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, MapPin, Award, Clock, Heart } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: Users, label: 'Registered Doctors', value: '2,500+' },
    { icon: MapPin, label: 'Provinces Covered', value: '9/9' },
    { icon: Clock, label: 'Average Response Time', value: '< 24 hours' },
    { icon: Heart, label: 'Patient Satisfaction', value: '4.8/5' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'All our doctors are HPCSA verified and go through rigorous background checks.',
    },
    {
      icon: Users,
      title: 'Accessibility',
      description: 'Making quality healthcare accessible to all South Africans, regardless of location.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We partner only with the best medical professionals across the country.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5" data-testid="section-about-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              About <span className="text-primary">IronLedger MedMap</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're on a mission to revolutionize healthcare access in South Africa by connecting 
              patients with trusted, verified medical professionals across all nine provinces.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-card" data-testid="section-our-story">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  IronLedger MedMap was born from a simple yet powerful vision: every South African 
                  should have easy access to quality healthcare, regardless of where they live.
                </p>
                <p>
                  Founded in 2024, we recognized the challenges many face in finding trusted medical 
                  professionals, especially in rural areas and smaller towns. Our platform bridges 
                  this gap by creating a comprehensive network of HPCSA-verified doctors across all 
                  nine provinces.
                </p>
                <p>
                  With secure PayFast integration and affordable membership options, we're making 
                  healthcare more accessible, transparent, and convenient for millions of South Africans.
                </p>
              </div>
            </div>
            <div className="lg:pl-8">
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&w=600&h=400&fit=crop"
                alt="Healthcare in South Africa"
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/30 to-accent/20" data-testid="section-statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Impact</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Building trust through transparency and results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-lg" data-testid={`card-stat-${index}`}>
                <CardContent className="p-8">
                  <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-card" data-testid="section-values">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="shadow-lg" data-testid={`card-value-${index}`}>
                <CardContent className="p-8 text-center">
                  <value.icon className="h-16 w-16 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-primary text-primary-foreground" data-testid="section-mission">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">Our Mission</h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              To democratize healthcare access in South Africa by creating a trusted, transparent, 
              and technology-driven platform that connects patients with verified medical professionals, 
              making quality healthcare accessible to every South African, from Cape Town to Limpopo.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
