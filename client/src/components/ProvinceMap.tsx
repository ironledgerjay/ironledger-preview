import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';

const provinces = [
  {
    name: 'Western Cape',
    cities: 'Cape Town, Stellenbosch, George',
    doctorCount: 48,
    available: true,
    color: 'from-blue-50 to-blue-100 border-blue-200',
    textColor: 'text-blue-800',
    badgeColor: 'bg-blue-600',
  },
  {
    name: 'Gauteng',
    cities: 'Johannesburg, Pretoria, Sandton',
    doctorCount: 72,
    available: true,
    color: 'from-emerald-50 to-emerald-100 border-emerald-200',
    textColor: 'text-emerald-800',
    badgeColor: 'bg-emerald-600',
  },
  {
    name: 'KwaZulu-Natal',
    cities: 'Durban, Pietermaritzburg',
    doctorCount: 35,
    available: true,
    color: 'from-purple-50 to-purple-100 border-purple-200',
    textColor: 'text-purple-800',
    badgeColor: 'bg-purple-600',
  },
  {
    name: 'Eastern Cape',
    cities: 'Port Elizabeth, East London',
    doctorCount: 22,
    available: false,
    color: 'from-orange-50 to-orange-100 border-orange-200',
    textColor: 'text-orange-800',
    badgeColor: 'bg-orange-600',
  },
  {
    name: 'Limpopo',
    cities: 'Polokwane, Tzaneen',
    doctorCount: 18,
    available: true,
    color: 'from-teal-50 to-teal-100 border-teal-200',
    textColor: 'text-teal-800',
    badgeColor: 'bg-teal-600',
  },
  {
    name: 'Mpumalanga',
    cities: 'Nelspruit, Witbank',
    doctorCount: 15,
    available: true,
    color: 'from-indigo-50 to-indigo-100 border-indigo-200',
    textColor: 'text-indigo-800',
    badgeColor: 'bg-indigo-600',
  },
  {
    name: 'North West',
    cities: 'Potchefstroom, Klerksdorp',
    doctorCount: 12,
    available: true,
    color: 'from-rose-50 to-rose-100 border-rose-200',
    textColor: 'text-rose-800',
    badgeColor: 'bg-rose-600',
  },
  {
    name: 'Free State',
    cities: 'Bloemfontein, Welkom',
    doctorCount: 14,
    available: true,
    color: 'from-amber-50 to-amber-100 border-amber-200',
    textColor: 'text-amber-800',
    badgeColor: 'bg-amber-600',
  },
  {
    name: 'Northern Cape',
    cities: 'Kimberley, Upington',
    doctorCount: 8,
    available: false,
    color: 'from-cyan-50 to-cyan-100 border-cyan-200',
    textColor: 'text-cyan-800',
    badgeColor: 'bg-cyan-600',
  },
];

interface ProvinceMapProps {
  onProvinceSelect?: (province: string) => void;
}

export default function ProvinceMap({ onProvinceSelect }: ProvinceMapProps) {
  return (
    <section className="py-20 bg-card" data-testid="section-province-map">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Doctors Across All 9 Provinces
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Click on any province to discover verified medical professionals in your area
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {provinces.map((province) => (
            <Card
              key={province.name}
              className={`bg-gradient-to-br ${province.color} cursor-pointer transition-transform hover:scale-105 border`}
              onClick={() => onProvinceSelect?.(province.name)}
              data-testid={`card-province-${province.name.toLowerCase().replace(' ', '-')}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${province.textColor}`}>
                    {province.name}
                  </h3>
                  <Badge 
                    className={`${province.badgeColor} text-white`}
                    data-testid={`badge-doctor-count-${province.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {province.doctorCount}
                  </Badge>
                </div>
                <p className={`${province.textColor} opacity-80 text-sm mb-3`}>
                  {province.cities}
                </p>
                <div className="flex items-center text-sm">
                  {province.available ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Available Today</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Next Available Tomorrow</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="lg:col-span-3 mt-8 text-center">
            <button 
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              onClick={() => onProvinceSelect?.('all')}
              data-testid="button-view-all-provinces"
            >
              View All Provinces
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
