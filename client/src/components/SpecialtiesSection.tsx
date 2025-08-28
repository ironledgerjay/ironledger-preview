import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Brain, 
  Eye, 
  Bone,
  Baby,
  Zap,
  Stethoscope,
  Scissors
} from 'lucide-react';

const specialties = [
  {
    name: 'Cardiology',
    description: 'Heart and cardiovascular specialists',
    icon: Heart,
    doctorCount: 45,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    name: 'Neurology',
    description: 'Brain and nervous system experts',
    icon: Brain,
    doctorCount: 32,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    name: 'Ophthalmology',
    description: 'Eye care and vision specialists',
    icon: Eye,
    doctorCount: 28,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'Orthopedics',
    description: 'Bone and joint specialists',
    icon: Bone,
    doctorCount: 41,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    name: 'Pediatrics',
    description: "Children's health specialists",
    icon: Baby,
    doctorCount: 38,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
  },
  {
    name: 'Emergency Medicine',
    description: 'Urgent care specialists',
    icon: Zap,
    doctorCount: 52,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    name: 'General Practice',
    description: 'Family medicine doctors',
    icon: Stethoscope,
    doctorCount: 89,
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
  },
  {
    name: 'Dermatology',
    description: 'Skin and cosmetic specialists',
    icon: Scissors,
    doctorCount: 25,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
];

interface SpecialtiesSectionProps {
  onSpecialtySelect?: (specialty: string) => void;
}

export default function SpecialtiesSection({ onSpecialtySelect }: SpecialtiesSectionProps) {
  return (
    <section className="py-20 bg-white" data-testid="section-specialties">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">
            Medical Specialties
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Find Specialists in <span className="text-teal-600">Every Field</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our comprehensive network of medical specialists across South Africa. From 
            general practitioners to highly specialized consultants.
          </p>
        </div>
        
        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {specialties.map((specialty, index) => (
            <Card
              key={index}
              className="group cursor-pointer border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
              onClick={() => onSpecialtySelect?.(specialty.name)}
              data-testid={`card-specialty-${specialty.name.toLowerCase().replace(' ', '-')}`}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${specialty.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <specialty.icon className={`w-8 h-8 ${specialty.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {specialty.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {specialty.description}
                </p>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-medium text-teal-600">
                    {specialty.doctorCount}+ doctors
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Can't Find Section */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">
              50+ Medical Specialties
            </Badge>
            <h3 className="text-2xl font-bold text-gray-900">
              Can't Find Your Specialty?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We have comprehensive coverage across all medical fields in South Africa
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              View All Specialties →
            </button>
            <button className="border border-teal-600 text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-lg font-medium transition-colors">
              Request New Specialty
            </button>
          </div>
          
          {/* Bottom Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">500+</div>
              <div className="text-gray-600 mt-1">Active Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">24/7</div>
              <div className="text-gray-600 mt-1">Booking Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">9</div>
              <div className="text-gray-600 mt-1">Provinces Covered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}