import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProvinceMap from '@/components/ProvinceMap';
import MembershipPlans from '@/components/MembershipPlans';
import DoctorCard from '@/components/DoctorCard';

import { 
  Search, 
  Shield, 
  Lock, 
  Star, 
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Users,
  Clock
} from 'lucide-react';

// Mock featured doctors data
const featuredDoctors = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Mthembu',
    specialty: 'Cardiologist',
    province: 'Gauteng',
    city: 'Johannesburg',
    rating: 5.0,
    reviewCount: 127,
    isVerified: true,
    availableToday: true,
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&w=300&h=300&fit=crop',
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Van Der Merwe',
    specialty: 'General Practitioner',
    province: 'Western Cape',
    city: 'Cape Town',
    rating: 4.5,
    reviewCount: 89,
    isVerified: true,
    availableToday: true,
    imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&w=300&h=300&fit=crop',
  },
  {
    id: '3',
    firstName: 'Nomsa',
    lastName: 'Dlamini',
    specialty: 'Pediatrician',
    province: 'KwaZulu-Natal',
    city: 'Durban',
    rating: 5.0,
    reviewCount: 156,
    isVerified: true,
    availableToday: false,
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&w=300&h=300&fit=crop',
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Thabo Molefi',
    location: 'Johannesburg',
    rating: 5,
    comment: 'Finding a trusted cardiologist in Johannesburg was so easy with IronLedger MedMap. The PayFast payment was seamless, and Dr. Mthembu was amazing!',
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&w=100&h=100&fit=crop',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    location: 'Cape Town',
    rating: 5,
    comment: 'As a Premium member, I love having 5 free bookings per quarter. The platform made finding a pediatrician in Cape Town effortless.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b93011da?ixlib=rb-4.0.3&w=100&h=100&fit=crop',
  },
  {
    id: 3,
    name: 'Mandla Ndlovu',
    location: 'Durban',
    rating: 5,
    comment: 'The emergency doctor feature saved me during a weekend emergency in Durban. Quick, reliable, and all HPCSA verified doctors.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=100&h=100&fit=crop',
  },
];

const provinces = [
  'Western Cape',
  'Gauteng',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Free State',
  'Northern Cape',
];

const specialties = [
  'General Practice',
  'Cardiology',
  'Pediatrics',
  'Gynecology',
  'Emergency Medicine',
  'Dermatology',
  'Neurology',
  'Psychiatry',
];

export default function Index() {
  const [, setLocation] = useLocation();
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const handleQuickSearch = () => {
    const searchParams = new URLSearchParams();
    if (selectedProvince) searchParams.set('province', selectedProvince);
    if (selectedSpecialty) searchParams.set('specialty', selectedSpecialty);
    
    setLocation(`/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  };

  const handleProvinceSelect = (province: string) => {
    setLocation(`/search?province=${encodeURIComponent(province)}`);
  };

  const handleBookAppointment = (doctorId: string) => {
    setLocation(`/book-appointment?doctor=${doctorId}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20" data-testid="section-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Find Trusted <span className="text-primary">Medical Care</span> Across South Africa
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Connect with verified doctors in all 9 provinces. Book appointments instantly with PayFast secure payments.
                </p>
              </div>
              
              {/* Quick Search */}
              <Card className="shadow-lg border border-border" data-testid="card-quick-search">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Doctor Search</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger data-testid="select-province">
                        <SelectValue placeholder="Select Province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger data-testid="select-specialty">
                        <SelectValue placeholder="Specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleQuickSearch}
                    data-testid="button-find-doctors"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find Doctors
                  </Button>
                </CardContent>
              </Card>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>HPCSA Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <span>PayFast Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span>4.8/5 Rating</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="animate-fade-in" data-testid="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="South African healthcare professionals" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Province Map Section */}
      <ProvinceMap onProvinceSelect={handleProvinceSelect} />

      {/* Membership Plans Section */}
      <MembershipPlans />

      {/* Featured Doctors Section */}
      <section className="py-20 bg-card" data-testid="section-featured-doctors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Featured Medical Professionals
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet some of our top-rated, HPCSA-verified doctors across South Africa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBookAppointment={handleBookAppointment}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5" data-testid="section-testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              What Our Patients Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real stories from South Africans who found trusted medical care through IronLedger MedMap
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="shadow-lg border border-border" data-testid={`card-testimonial-${testimonial.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-primary-foreground" data-testid="section-cta">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold">Ready to Find Your Doctor?</h2>
              <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                Join thousands of South Africans who trust IronLedger MedMap for their healthcare needs. 
                Start with our free plan or get Premium for just R39 per quarter.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100"
                  data-testid="button-start-free-account"
                >
                  Start Free Account
                </Button>
              </Link>
              <Link href="/membership">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  data-testid="button-get-premium"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Get Premium - R39
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-primary-foreground/70 pt-8">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>HPCSA Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>PayFast Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>10,000+ Happy Patients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
