import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Users, Star, MapPin, Clock, Award, Target } from 'lucide-react';
import founderImage from "@assets/WhatsApp Image 2025-03-12 at 11.57.10_b6d3b63c_1756414367652.jpg";
import BackButton from '@/components/BackButton';
import { usePageTracking } from '@/hooks/useActivityLogger';

export default function About() {
  usePageTracking('About');
  const stats = [
    { icon: Users, label: "Verified Doctors", value: "500+" },
    { icon: MapPin, label: "Provinces Covered", value: "9" },
    { icon: Clock, label: "Average Response", value: "15 mins" },
    { icon: Star, label: "Patient Satisfaction", value: "4.8/5" },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All doctors are HPCSA verified and background checked for your safety and peace of mind."
    },
    {
      icon: Heart,
      title: "Quality Healthcare",
      description: "Connect with top-rated medical professionals across all specialties and provinces."
    },
    {
      icon: Users,
      title: "Personalized Care",
      description: "Find doctors who understand your specific needs and cultural background."
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12" data-testid="page-about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton fallbackPath="/" />
        </div>
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About IronLedger MedMap
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A proudly South African healthcare platform connecting patients with trusted medical professionals 
            across all nine provinces. Your health is our priority, and quality care is our commitment.
          </p>
        </div>

        {/* Founder Section */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">Our Leadership</h2>
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={founderImage}
                        alt="Ofentse Mashau - Founder & CEO"
                        className="w-48 h-48 rounded-full object-cover border-4 border-primary/20"
                        data-testid="img-founder"
                      />
                      <div className="absolute -bottom-2 -right-2">
                        <Badge className="bg-primary text-primary-foreground">
                          <Award className="h-3 w-3 mr-1" />
                          Founder & CEO
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-foreground mb-2" data-testid="text-founder-name">
                      Ofentse Mashau
                    </h3>
                    <p className="text-lg text-primary font-semibold mb-4">Founder & Chief Executive Officer</p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      As the visionary founder and CEO of IronLedger MedMap, Ofentse Mashau is committed to 
                      transforming healthcare accessibility across South Africa. Under his leadership, our 
                      platform has become a trusted bridge connecting patients with verified medical professionals 
                      throughout all nine provinces.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Ofentse's passion for healthcare innovation and his deep understanding of South African 
                      healthcare challenges drives our mission to make quality medical care accessible to every 
                      South African, regardless of their location or circumstances.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Target className="h-6 w-6" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To revolutionize healthcare accessibility in South Africa by creating a seamless digital bridge 
                between patients and verified medical professionals. We believe every South African deserves 
                convenient access to quality healthcare, regardless of their location or background.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                <Heart className="h-6 w-6" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To become South Africa's leading healthcare platform, where every citizen can easily find, 
                connect with, and receive care from trusted medical professionals. We envision a future where 
                geographic and economic barriers no longer limit access to quality healthcare.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 100% South African Ownership */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-950/20 dark:to-yellow-950/20 border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-600 rounded-full p-3">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2" data-testid="text-ownership">
                100% South African Owned
              </h3>
              <p className="text-lg text-muted-foreground">
                Proudly built by South Africans, for South Africans. We understand the unique healthcare 
                challenges and cultural nuances of our diverse nation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Trust</Badge>
              <p className="text-sm text-muted-foreground">
                Building confidence through verified professionals and transparent processes.
              </p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Accessibility</Badge>
              <p className="text-sm text-muted-foreground">
                Making healthcare available to all South Africans, everywhere.
              </p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Quality</Badge>
              <p className="text-sm text-muted-foreground">
                Ensuring the highest standards of medical care and service.
              </p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Innovation</Badge>
              <p className="text-sm text-muted-foreground">
                Using technology to improve healthcare delivery and experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}