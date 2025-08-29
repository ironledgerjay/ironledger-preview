import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DoctorCard from '@/components/DoctorCard';
import BackButton from '@/components/BackButton';
import { usePageTracking, useActivityLogger } from '@/hooks/useActivityLogger';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Filter, Users } from 'lucide-react';

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
  'Orthopedics',
  'Ophthalmology',
];

// Real doctors will be fetched from API

export default function SearchResults() {
  usePageTracking('Search Results');
  const { logUserAction } = useActivityLogger();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Fetch all doctors from API
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['/api/doctors'],
    retry: 1,
  });

  // Convert doctors to proper format
  const allDoctors = (doctors || []).map((doctor: any) => ({
    ...doctor,
    rating: parseFloat(doctor.rating) || 5.0,
    availableToday: true,
  }));

  // Get search params from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const province = urlParams.get('province');
    const specialty = urlParams.get('specialty');
    
    if (province) setSelectedProvince(province);
    if (specialty) setSelectedSpecialty(specialty);
  }, []);

  // Filter doctors based on search criteria
  useEffect(() => {
    let filtered = allDoctors;

    if (searchQuery) {
      filtered = filtered.filter(doctor => 
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedProvince && selectedProvince !== 'all') {
      filtered = filtered.filter(doctor => doctor.province === selectedProvince);
    }

    if (selectedSpecialty && selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, selectedProvince, selectedSpecialty, allDoctors]);

  const handleBookAppointment = (doctorId: string) => {
    logUserAction('book_appointment_click', 'Search Results', { doctorId });
    setLocation(`/book-appointment/${doctorId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProvince('all');
    setSelectedSpecialty('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Header */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border" data-testid="section-search-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton fallbackPath="/" />
          </div>
          
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                Find Your Doctor
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Search through our network of verified medical professionals across South Africa
              </p>
            </div>

            {/* Search Filters */}
            <Card className="shadow-lg border border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search doctors, specialties, cities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-doctors"
                    />
                  </div>
                  
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger data-testid="select-filter-province">
                      <SelectValue placeholder="All Provinces" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Provinces</SelectItem>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger data-testid="select-filter-specialty">
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="w-full"
                    data-testid="button-clear-filters"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Filters */}
            {(selectedProvince && selectedProvince !== 'all') || (selectedSpecialty && selectedSpecialty !== 'all') ? (
              <div className="flex flex-wrap gap-2" data-testid="active-filters">
                {selectedProvince && selectedProvince !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedProvince}
                  </Badge>
                )}
                {selectedSpecialty && selectedSpecialty !== 'all' && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {selectedSpecialty}
                  </Badge>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="py-12 bg-card" data-testid="section-search-results">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium text-foreground">
                {filteredDoctors.length} doctors found
              </span>
            </div>
          </div>

          {/* Results Grid */}
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onBookAppointment={handleBookAppointment}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16" data-testid="no-results">
              <div className="space-y-4">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No doctors found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your search criteria or clear the filters to see all available doctors.
                </p>
                <Button onClick={clearFilters} data-testid="button-clear-filters-no-results">
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Load More Button (for pagination in real app) */}
          {filteredDoctors.length > 0 && filteredDoctors.length >= 6 && (
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                data-testid="button-load-more"
              >
                Load More Doctors
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
