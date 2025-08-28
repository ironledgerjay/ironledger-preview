import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Star, DollarSign, Calendar } from 'lucide-react';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  province: string;
  city: string;
  zipCode?: string;
  practiceAddress: string;
  phone: string;
  rating: string;
  reviewCount: number;
  consultationFee: string;
  isVerified: boolean;
}

const provinces = [
  'Eastern Cape',
  'Free State', 
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape'
];

const specialties = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery'
];

export default function DoctorSearch() {
  useActivityLogger('doctor_search');
  
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    specialty: '',
    province: '',
    city: '',
    zipCode: ''
  });

  const { data: doctors = [], isLoading } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors', searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchFilters.name) params.set('name', searchFilters.name);
      if (searchFilters.specialty) params.set('specialty', searchFilters.specialty);
      if (searchFilters.province) params.set('province', searchFilters.province);
      if (searchFilters.city) params.set('city', searchFilters.city);
      if (searchFilters.zipCode) params.set('zipCode', searchFilters.zipCode);
      
      const response = await fetch(`/api/doctors?${params.toString()}`);
      return response.json();
    }
  });

  const handleBookAppointment = (doctorId: string) => {
    // Navigate to booking page with doctor ID
    window.location.href = `/book/${doctorId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
          <p className="text-gray-600">Search and book appointments with verified medical professionals across South Africa</p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
            <CardDescription>Find doctors by name, specialty, province, city, or zip code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <Input
                placeholder="Doctor name..."
                value={searchFilters.name}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, name: e.target.value }))}
                data-testid="input-doctor-name"
              />
              
              <Select value={searchFilters.specialty} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, specialty: value }))}>
                <SelectTrigger data-testid="select-specialty">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={searchFilters.province} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, province: value }))}>
                <SelectTrigger data-testid="select-province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Provinces</SelectItem>
                  {provinces.map(province => (
                    <SelectItem key={province} value={province}>{province}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="City..."
                value={searchFilters.city}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, city: e.target.value }))}
                data-testid="input-city"
              />

              <Input
                placeholder="Zip/Postal code..."
                value={searchFilters.zipCode}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, zipCode: e.target.value }))}
                data-testid="input-zip-code"
                className="border-blue-200 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow" data-testid={`card-doctor-${doctor.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Badge variant="secondary">{doctor.specialty}</Badge>
                          {doctor.isVerified && (
                            <Badge variant="default">Verified</Badge>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                        <span className="text-sm text-gray-500">({doctor.reviewCount})</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{doctor.city}, {doctor.province} {doctor.zipCode && `(${doctor.zipCode})`}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{doctor.phone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>R{doctor.consultationFee} consultation fee</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {doctor.practiceAddress}
                      </p>
                      
                      <Button 
                        className="w-full" 
                        onClick={() => handleBookAppointment(doctor.id)}
                        data-testid={`button-book-${doctor.id}`}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No doctors found</h3>
                  <p>Try adjusting your search filters to find available doctors in your area.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}