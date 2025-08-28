import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BackButton from '@/components/BackButton';
import { usePageTracking, useActivityLogger } from '@/hooks/useActivityLogger';
import { 
  AlertTriangle, 
  Phone, 
  Clock, 
  MapPin, 
  Star, 
  Heart,
  Ambulance,
  Shield
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DoctorCard from "@/components/DoctorCard";

export default function Emergency() {
  usePageTracking('Emergency');
  const { logUserAction } = useActivityLogger();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: emergencyDoctors, isLoading, error } = useQuery({
    queryKey: ["/api/doctors/emergency"],
    queryFn: () => {
      // Filter doctors available for emergency appointments
      return fetch('/api/doctors').then(res => {
        if (!res.ok) throw new Error('Failed to fetch emergency doctors');
        return res.json();
      }).then(doctors => 
        doctors.filter(doctor => doctor.isVerified) // Only verified doctors for emergencies
      );
    },
  });

  const emergencyContacts = [
    { service: "Emergency Medical Services", number: "10177", icon: Ambulance },
    { service: "Police Emergency", number: "10111", icon: Shield },
    { service: "Fire Department", number: "10177", icon: AlertTriangle },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-950/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="text-red-800 dark:text-red-200">Loading emergency doctors...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 dark:bg-red-950/20 py-12" data-testid="page-emergency">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton fallbackPath="/" className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/50" />
        </div>
        
        {/* Emergency Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-600 rounded-full p-4 animate-pulse">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-red-800 dark:text-red-200 mb-2">
            Emergency Medical Care
          </h1>
          <p className="text-lg text-red-700 dark:text-red-300 mb-4">
            Immediate medical assistance when you need it most
          </p>
          <div className="flex items-center justify-center text-sm text-red-600 dark:text-red-400">
            <Clock className="h-4 w-4 mr-1" />
            Current time: {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Critical Emergency Alert */}
        <Alert className="mb-8 border-red-200 bg-red-100 dark:bg-red-900/50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Life-threatening emergency?</strong> Call emergency services immediately at the numbers below.
            This service is for urgent but non-life-threatening medical consultations.
          </AlertDescription>
        </Alert>

        {/* Emergency Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {emergencyContacts.map((contact, index) => (
            <Card key={index} className="border-red-200 bg-red-100 dark:bg-red-900/30">
              <CardContent className="flex items-center space-x-3 p-4">
                <contact.icon className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">{contact.service}</p>
                  <p className="text-lg font-bold text-red-600">{contact.number}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Emergency Doctors */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">
              Available Emergency Doctors
            </h2>
            <Badge variant="destructive" className="animate-pulse">
              {emergencyDoctors?.length || 0} Available Now
            </Badge>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Unable to load emergency doctors. Please try calling our emergency line or refresh the page.
              </AlertDescription>
            </Alert>
          ) : emergencyDoctors && emergencyDoctors.length > 0 ? (
            <>
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Emergency consultations are prioritized. Average response time: 5-15 minutes.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {emergencyDoctors.map((doctor) => (
                  <div key={doctor.id} className="relative">
                    <DoctorCard doctor={doctor} />
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="destructive" className="animate-pulse">
                        Emergency Available
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto max-w-md">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-lg font-medium text-red-800 dark:text-red-200">
                  No Emergency Doctors Available
                </h3>
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 mb-4">
                  All emergency doctors are currently busy. Please call emergency services if this is life-threatening.
                </p>
                <div className="space-y-2">
                  <Button variant="destructive" size="lg" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Emergency Services: 10177
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Clock className="h-4 w-4 mr-2" />
                    Check Regular Doctors
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Guidelines */}
        <Card className="mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200">
              When to Use Emergency Services
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-700 dark:text-red-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Call Emergency Services (10177) for:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Chest pain or heart attack symptoms</li>
                  <li>• Difficulty breathing</li>
                  <li>• Severe injuries or bleeding</li>
                  <li>• Loss of consciousness</li>
                  <li>• Stroke symptoms</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Use Emergency Doctors for:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Urgent but non-life-threatening conditions</li>
                  <li>• Sudden severe pain</li>
                  <li>• High fever with concerning symptoms</li>
                  <li>• Urgent medication needs</li>
                  <li>• Immediate medical advice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}