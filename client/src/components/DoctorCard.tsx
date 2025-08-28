import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle, Calendar, MapPin } from 'lucide-react';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  province: string;
  city: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  availableToday: boolean;
  imageUrl?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment?: (doctorId: string) => void;
}

export default function DoctorCard({ doctor, onBookAppointment }: DoctorCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-500/50 text-yellow-500" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  const initials = `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`;

  return (
    <Card 
      className="hover:shadow-xl transition-shadow duration-300"
      data-testid={`card-doctor-${doctor.id}`}
    >
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Doctor Avatar */}
          <Avatar className="w-20 h-20 mx-auto">
            <AvatarImage 
              src={doctor.imageUrl} 
              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} 
            />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Doctor Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <p className="text-primary font-medium">{doctor.specialty}</p>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{doctor.city}, {doctor.province}</span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(doctor.rating)}
            </div>
            <span className="text-sm text-muted-foreground">
              ({doctor.reviewCount} reviews)
            </span>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center justify-center space-x-4 text-sm">
            {doctor.isVerified && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>HPCSA Verified</span>
              </div>
            )}
            <div className={`flex items-center space-x-1 ${
              doctor.availableToday ? 'text-blue-600' : 'text-orange-600'
            }`}>
              <Calendar className="h-4 w-4" />
              <span>{doctor.availableToday ? 'Available Today' : 'Next: Tomorrow'}</span>
            </div>
          </div>
          
          {/* Book Appointment Button */}
          <Button 
            className="w-full"
            onClick={() => onBookAppointment?.(doctor.id)}
            data-testid={`button-book-appointment-${doctor.id}`}
          >
            Book Appointment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
