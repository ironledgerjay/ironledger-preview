import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Search, MapPin, Star, Calendar, Clock, DollarSign, Filter, 
  SortAsc, SortDesc, Video, Phone, Users, Award, Heart,
  Stethoscope, Brain, Eye, Bone, Baby
} from 'lucide-react';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  consultationFee: string;
  city: string;
  province: string;
  bio: string;
  experience: string;
  qualifications: string;
  practiceAddress: string;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  profileImageUrl?: string;
  availability: {
    nextAvailable: Date | null;
    slotsThisWeek: number;
  };
  consultationTypes: ('in-person' | 'video-call' | 'phone-call')[];
  languages: string[];
  medicalAidAccepted: string[];
}

interface SearchFilters {
  searchTerm: string;
  specialty: string;
  province: string;
  city: string;
  priceRange: [number, number];
  rating: number;
  availability: 'any' | 'today' | 'this-week' | 'next-available';
  consultationType: string;
  language: string;
  medicalAid: string;
  experience: string;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'experience' | 'availability';
}

const specialties = [
  { id: 'general-practice', label: 'General Practice', icon: Stethoscope },
  { id: 'cardiology', label: 'Cardiology', icon: Heart },
  { id: 'dermatology', label: 'Dermatology', icon: Eye },
  { id: 'neurology', label: 'Neurology', icon: Brain },
  { id: 'orthopedics', label: 'Orthopedics', icon: Bone },
  { id: 'pediatrics', label: 'Pediatrics', icon: Baby },
  { id: 'psychiatry', label: 'Psychiatry', icon: Brain },
  { id: 'radiology', label: 'Radiology', icon: Eye },
  { id: 'surgery', label: 'Surgery', icon: Stethoscope },
  { id: 'gynecology', label: 'Gynecology', icon: Heart },
];

const southAfricanProvinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

const languages = [
  'English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho', 'Tswana',
  'Venda', 'Tsonga', 'Ndebele', 'Swati', 'Portuguese', 'French'
];

const medicalAids = [
  'Discovery Health', 'Momentum Health', 'Bonitas', 'Medihelp',
  'Fedhealth', 'Gems', 'Keyhealth', 'Bestmed', 'Polmed', 'Samwumed'
];

export default function EnhancedDoctorSearch() {
  const { logPageView, logUserAction } = useActivityLogger();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    specialty: '',
    province: '',
    city: '',
    priceRange: [0, 2000],
    rating: 0,
    availability: 'any',
    consultationType: '',
    language: '',
    medicalAid: '',
    experience: '',
    sortBy: 'relevance',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Log page view
  useEffect(() => {
    logPageView('enhanced_doctor_search', { searchMethod: 'enhanced_filters' });
  }, []);

  // Fetch doctors with real-time filtering
  const { data: doctors = [], isLoading, error } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors/search', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      // Add all filters to search params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'any') {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/doctors/search?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to search doctors');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    logUserAction('search_filter_changed', 'doctor_search', {
      filterType: key,
      filterValue: value,
      totalFiltersActive: Object.values({ ...filters, [key]: value }).filter(v => 
        v && v !== '' && v !== 'any' && (!Array.isArray(v) || v.length > 0)
      ).length
    });
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      specialty: '',
      province: '',
      city: '',
      priceRange: [0, 2000],
      rating: 0,
      availability: 'any',
      consultationType: '',
      language: '',
      medicalAid: '',
      experience: '',
      sortBy: 'relevance',
    });
    
    logUserAction('search_filters_cleared', 'doctor_search');
  };

  const getAvailabilityDisplay = (doctor: Doctor) => {
    if (!doctor.availability.nextAvailable) {
      return { text: 'No availability', color: 'text-gray-500' };
    }
    
    const nextAvailable = new Date(doctor.availability.nextAvailable);
    const today = new Date();
    const diffDays = Math.ceil((nextAvailable.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { text: 'Available today', color: 'text-green-600' };
    } else if (diffDays === 1) {
      return { text: 'Available tomorrow', color: 'text-green-500' };
    } else if (diffDays <= 7) {
      return { text: `Available in ${diffDays} days`, color: 'text-yellow-600' };
    } else {
      return { text: `Available in ${diffDays} days`, color: 'text-red-500' };
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    const specialtyConfig = specialties.find(s => 
      specialty.toLowerCase().includes(s.id.replace('-', ' '))
    );
    return specialtyConfig?.icon || Stethoscope;
  };

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'video-call': return Video;
      case 'phone-call': return Phone;
      default: return MapPin;
    }
  };

  const filteredAndSortedDoctors = doctors.sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return parseFloat(a.consultationFee) - parseFloat(b.consultationFee);
      case 'price-high':
        return parseFloat(b.consultationFee) - parseFloat(a.consultationFee);
      case 'rating':
        return b.averageRating - a.averageRating;
      case 'experience':
        return parseInt(b.experience) - parseInt(a.experience);
      case 'availability':
        if (!a.availability.nextAvailable && !b.availability.nextAvailable) return 0;
        if (!a.availability.nextAvailable) return 1;
        if (!b.availability.nextAvailable) return -1;
        return new Date(a.availability.nextAvailable).getTime() - new Date(b.availability.nextAvailable).getTime();
      default:
        return b.averageRating - a.averageRating; // Default to rating
    }
  });

  if (error) {
    toast({
      title: 'Search Error',
      description: 'Failed to load doctors. Please try again.',
      variant: 'destructive',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Doctor</h1>
          <p className="text-gray-600">Search and compare verified doctors across South Africa</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">Search by name, specialty, or location</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="e.g. Dr. Smith, Cardiology, Johannesburg"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
                data-testid="button-toggle-filters"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters && <Badge variant="secondary">On</Badge>}
              </Button>

              <div className="flex items-center gap-2">
                <Label className="text-sm">Sort by:</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="w-40" data-testid="select-sortBy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="experience">Most Experienced</SelectItem>
                    <SelectItem value="availability">Earliest Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Advanced Filters
              </CardTitle>
              <div className="flex justify-between">
                <CardDescription>Refine your search with detailed criteria</CardDescription>
                <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                  Clear all filters
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Specialty */}
                <div>
                  <Label>Medical Specialty</Label>
                  <Select value={filters.specialty} onValueChange={(value) => handleFilterChange('specialty', value)}>
                    <SelectTrigger data-testid="select-specialty">
                      <SelectValue placeholder="Any specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any specialty</SelectItem>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.label}>
                          {specialty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Province */}
                <div>
                  <Label>Province</Label>
                  <Select value={filters.province} onValueChange={(value) => handleFilterChange('province', value)}>
                    <SelectTrigger data-testid="select-province">
                      <SelectValue placeholder="Any province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any province</SelectItem>
                      {southAfricanProvinces.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Consultation Type */}
                <div>
                  <Label>Consultation Type</Label>
                  <Select value={filters.consultationType} onValueChange={(value) => handleFilterChange('consultationType', value)}>
                    <SelectTrigger data-testid="select-consultationType">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any type</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="video-call">Video Call</SelectItem>
                      <SelectItem value="phone-call">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div>
                  <Label>Language</Label>
                  <Select value={filters.language} onValueChange={(value) => handleFilterChange('language', value)}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue placeholder="Any language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any language</SelectItem>
                      {languages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Medical Aid */}
                <div>
                  <Label>Medical Aid</Label>
                  <Select value={filters.medicalAid} onValueChange={(value) => handleFilterChange('medicalAid', value)}>
                    <SelectTrigger data-testid="select-medicalAid">
                      <SelectValue placeholder="Any medical aid" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any medical aid</SelectItem>
                      {medicalAids.map((aid) => (
                        <SelectItem key={aid} value={aid}>
                          {aid}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability */}
                <div>
                  <Label>Availability</Label>
                  <Select value={filters.availability} onValueChange={(value) => handleFilterChange('availability', value)}>
                    <SelectTrigger data-testid="select-availability">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="today">Available today</SelectItem>
                      <SelectItem value="this-week">This week</SelectItem>
                      <SelectItem value="next-available">Next available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label>Consultation Fee Range</Label>
                <div className="px-3">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => handleFilterChange('priceRange', value)}
                    max={2000}
                    min={0}
                    step={50}
                    className="w-full"
                    data-testid="slider-priceRange"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>R{filters.priceRange[0]}</span>
                    <span>R{filters.priceRange[1]}+</span>
                  </div>
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-3">
                <Label>Minimum Rating</Label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.rating >= rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('rating', rating)}
                      className="flex items-center gap-1"
                      data-testid={`rating-${rating}`}
                    >
                      <Star className="w-3 h-3" />
                      {rating}+
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              {isLoading ? 'Searching...' : `${filteredAndSortedDoctors.length} doctors found`}
            </p>
            {filteredAndSortedDoctors.length > 0 && (
              <div className="text-sm text-gray-500">
                Price range: R{Math.min(...filteredAndSortedDoctors.map(d => parseFloat(d.consultationFee)))} - 
                R{Math.max(...filteredAndSortedDoctors.map(d => parseFloat(d.consultationFee)))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              data-testid="button-grid-view"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              data-testid="button-list-view"
            >
              List
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedDoctors.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or clearing some filters.
              </p>
              <Button onClick={clearFilters} data-testid="button-clear-filters-empty">
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredAndSortedDoctors.map((doctor) => {
              const SpecialtyIcon = getSpecialtyIcon(doctor.specialty);
              const availability = getAvailabilityDisplay(doctor);
              
              return (
                <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={doctor.profileImageUrl} />
                        <AvatarFallback className="text-lg">
                          {doctor.firstName[0]}{doctor.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg truncate">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mb-1">
                              <SpecialtyIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-600">{doctor.specialty}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{doctor.averageRating.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">({doctor.totalReviews})</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">R{doctor.consultationFee}</p>
                            <p className="text-xs text-gray-500">consultation</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{doctor.city}, {doctor.province}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={availability.color}>{availability.text}</span>
                      </div>
                    </div>

                    {/* Consultation Types */}
                    <div className="flex gap-1 mb-4">
                      {doctor.consultationTypes.map((type) => {
                        const Icon = getConsultationTypeIcon(type);
                        return (
                          <Badge key={type} variant="secondary" className="text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {type.replace('-', ' ')}
                          </Badge>
                        );
                      })}
                    </div>

                    {/* Languages */}
                    {doctor.languages.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Languages:</p>
                        <div className="flex flex-wrap gap-1">
                          {doctor.languages.slice(0, 3).map((language) => (
                            <Badge key={language} variant="outline" className="text-xs">
                              {language}
                            </Badge>
                          ))}
                          {doctor.languages.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{doctor.languages.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Link href={`/booking-wizard/${doctor.id}`} className="flex-1">
                        <Button className="w-full" data-testid={`button-book-${doctor.id}`}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Appointment
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          logUserAction('doctor_profile_view', 'doctor_search', { doctorId: doctor.id });
                          // Navigate to doctor profile
                        }}
                        data-testid={`button-profile-${doctor.id}`}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {filteredAndSortedDoctors.length > 0 && filteredAndSortedDoctors.length >= 12 && (
          <div className="text-center mt-8">
            <Button variant="outline" data-testid="button-load-more">
              Load More Doctors
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}