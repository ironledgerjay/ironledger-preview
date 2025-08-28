import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, Users, Clock, Star } from 'lucide-react';

interface PlatformStats {
  totalDoctors: number;
  totalPatients: number;
  totalBookings: number;
  averageRating: number;
}

export default function StatsSection() {
  const { data: stats, isLoading } = useQuery<PlatformStats>({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-primary text-primary-foreground" data-testid="section-stats-loading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-lg mx-auto mb-4 animate-pulse" />
                <div className="w-20 h-6 bg-primary-foreground/20 rounded mx-auto mb-2 animate-pulse" />
                <div className="w-24 h-4 bg-primary-foreground/20 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const statsData = [
    {
      icon: Stethoscope,
      value: stats?.totalDoctors || 0,
      label: 'Verified Doctors',
      suffix: '+',
    },
    {
      icon: Users,
      value: stats?.totalPatients || 0,
      label: 'Happy Patients',
      suffix: '+',
    },
    {
      icon: Clock,
      value: stats?.totalBookings || 0,
      label: 'Appointments Booked',
      suffix: '+',
    },
    {
      icon: Star,
      value: stats?.averageRating || 0,
      label: 'Average Rating',
      suffix: '/5',
      decimal: true,
    },
  ];

  return (
    <section className="py-16 bg-primary text-primary-foreground" data-testid="section-stats">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">Trusted by Thousands Across South Africa</h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Join the growing community of patients who have found quality healthcare through IronLedger MedMap
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center" data-testid={`stat-${index}`}>
              <div className="w-16 h-16 bg-primary-foreground/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {stat.decimal ? stat.value.toFixed(1) : stat.value}{stat.suffix}
              </div>
              <p className="text-primary-foreground/80 text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-primary-foreground/60 text-sm">
            Statistics updated in real-time from our platform
          </p>
        </div>
      </div>
    </section>
  );
}