import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePayFast } from '@/hooks/usePayFast';
import { apiRequest } from '@/lib/queryClient';
import { Calendar, Clock, MapPin, Star, Phone, DollarSign } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface Doctor {
  id: string;
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

interface BookingForm {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  consultationType: 'in-person' | 'virtual';
  membershipType?: string;
}

export default function BookAppointment() {
  useActivityLogger('book_appointment');
  
  const params = useParams<{ doctorId: string }>();
  const doctorId = params.doctorId;
  
  console.log('BookAppointment - doctorId from params:', doctorId);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { generatePaymentURL } = usePayFast();

  const [bookingForm, setBookingForm] = useState<BookingForm>({
    patientName: '',
    patientEmail: user?.email || '',
    patientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    consultationType: 'in-person'
  });

  // Fetch doctor details
  const { data: doctor, isLoading: doctorLoading, error: doctorError } = useQuery<Doctor>({
    queryKey: [`/api/doctor/${doctorId}`],
    enabled: !!doctorId,
    retry: 1,
    staleTime: 0,
  });
  
  console.log('BookAppointment - doctor data:', doctor);
  console.log('BookAppointment - doctorLoading:', doctorLoading);
  console.log('BookAppointment - doctorError:', doctorError);

  // Show error if doctor not found
  if (doctorError) {
    console.error('Doctor error:', doctorError);
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Doctor</h1>
            <p className="text-gray-600 mb-4">There was an error loading the doctor information. Please try again.</p>
            <p className="text-xs text-gray-500 mb-4">Doctor ID: {doctorId}</p>
            <BackButton fallbackPath="/doctors">Return to Doctor Search</BackButton>
          </div>
        </div>
      </div>
    );
  }

  // Fetch user membership info
  const { data: membership } = useQuery({
    queryKey: ['/api/user/membership'],
    enabled: !!user,
  });

  // Fetch available time slots for the selected date
  const { data: availableSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: [`/api/doctor/availability/${doctorId}/${bookingForm.appointmentDate}`],
    enabled: !!doctorId && !!bookingForm.appointmentDate,
    refetchOnMount: true,
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Request Submitted",
        description: "Your appointment request has been sent to the doctor for approval.",
      });
      
      // Redirect to booking confirmation page
      window.location.href = `/booking-confirmation/${data.bookingId}`;
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment.",
        variant: "destructive",
      });
      window.location.href = '/login';
      return;
    }

    if (!doctor) return;

    // Check if payment is needed (R10 booking fee for basic users)
    const isBasicUser = !membership || membership.type === 'basic';
    const bookingFee = isBasicUser ? 10.00 : 0;

    const bookingData = {
      ...bookingForm,
      doctorId,
      patientId: user.id,
      appointmentDateTime: `${bookingForm.appointmentDate} ${bookingForm.appointmentTime}`,
      bookingFee,
    };

    if (bookingFee > 0) {
      // Generate PayFast payment for booking fee
      try {
        const paymentURL = generatePaymentURL({
          amount: bookingFee,
          itemName: `Appointment Booking Fee - Dr. ${doctor.firstName} ${doctor.lastName}`,
          itemDescription: `Booking fee for ${bookingForm.appointmentDate} ${bookingForm.appointmentTime}`,
          returnUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancelled`,
          customStr1: JSON.stringify(bookingData), // Pass booking data for processing after payment
        });
        
        window.location.href = paymentURL;
      } catch (error) {
        toast({
          title: "Payment Error",
          description: "Failed to generate payment URL. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Free booking for premium users
      bookingMutation.mutate(bookingData);
    }
  };

  // Get available time slots based on doctor's schedule
  const getAvailableTimeSlots = () => {
    if (!availableSlots || availableSlots.length === 0) {
      return [];
    }
    return availableSlots.filter(slot => slot.isAvailable);
  };

  const availableTimeSlots = getAvailableTimeSlots();

  if (doctorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Doctor Not Found</h2>
              <p className="text-gray-600">The requested doctor could not be found.</p>
              <BackButton className="mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <BackButton />
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Book Appointment</h1>
          <p className="text-gray-600">Schedule your appointment with Dr. {doctor.firstName} {doctor.lastName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Information */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
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
              
              <CardContent className="space-y-4">
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
                  <span>Consultation: R{doctor.consultationFee}</span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Practice Address</h4>
                  <p className="text-sm text-gray-600">{doctor.practiceAddress}</p>
                </div>

                {/* Booking Fee Notice */}
                <div className="border-t pt-4">
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <h4 className="font-medium text-teal-800 mb-1">Booking Fee</h4>
                    {membership?.type === 'premium' ? (
                      <p className="text-sm text-teal-700">
                        ✅ Premium Member - No booking fees!
                      </p>
                    ) : (
                      <p className="text-sm text-teal-700">
                        R10 booking fee applies for Basic members
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Please provide your information and preferred appointment time</CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {/* Patient Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Full Name *
                      </label>
                      <Input
                        required
                        placeholder="Your full name"
                        value={bookingForm.patientName}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, patientName: e.target.value }))}
                        data-testid="input-patient-name"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Email Address *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="your.email@example.com"
                        value={bookingForm.patientEmail}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, patientEmail: e.target.value }))}
                        data-testid="input-patient-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number *
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="+27 XX XXX XXXX"
                      value={bookingForm.patientPhone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, patientPhone: e.target.value }))}
                      data-testid="input-patient-phone"
                    />
                  </div>

                  {/* Appointment Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Preferred Date *
                      </label>
                      <Input
                        required
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingForm.appointmentDate}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                        data-testid="input-appointment-date"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Preferred Time *
                      </label>
                      <Select 
                        value={bookingForm.appointmentTime} 
                        onValueChange={(value) => setBookingForm(prev => ({ ...prev, appointmentTime: value }))}
                        disabled={!bookingForm.appointmentDate || slotsLoading}
                      >
                        <SelectTrigger data-testid="select-appointment-time">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {bookingForm.appointmentDate ? (
                            slotsLoading ? (
                              <SelectItem value="loading" disabled>Loading available times...</SelectItem>
                            ) : availableTimeSlots.length > 0 ? (
                              availableTimeSlots.map(slot => (
                                <SelectItem key={slot.time} value={slot.time}>
                                  {slot.time} (Available)
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-slots" disabled>No available slots for this date</SelectItem>
                            )
                          ) : (
                            <SelectItem value="select-date" disabled>Please select a date first</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Consultation Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Consultation Type *
                    </label>
                    <Select 
                      value={bookingForm.consultationType} 
                      onValueChange={(value: 'in-person' | 'virtual') => setBookingForm(prev => ({ ...prev, consultationType: value }))}
                    >
                      <SelectTrigger data-testid="select-consultation-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-person">In-Person Consultation</SelectItem>
                        <SelectItem value="virtual">Virtual Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reason for Visit */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Reason for Visit *
                    </label>
                    <Textarea
                      required
                      placeholder="Please describe the reason for your appointment (symptoms, concerns, etc.)"
                      rows={4}
                      value={bookingForm.reason}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, reason: e.target.value }))}
                      data-testid="textarea-appointment-reason"
                    />
                  </div>

                  {/* Available Slots Preview */}
                  {bookingForm.appointmentDate && availableSlots.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Available Times for {new Date(bookingForm.appointmentDate).toLocaleDateString()}</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {availableSlots.filter(slot => slot.isAvailable).slice(0, 8).map(slot => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setBookingForm(prev => ({ ...prev, appointmentTime: slot.time }))}
                            className={`text-xs px-2 py-1 rounded border ${
                              bookingForm.appointmentTime === slot.time 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                      {availableSlots.filter(slot => slot.isAvailable).length > 8 && (
                        <p className="text-xs text-blue-600 mt-2">+{availableSlots.filter(slot => slot.isAvailable).length - 8} more times available</p>
                      )}
                    </div>
                  )}

                  {/* Booking Summary */}
                  {bookingForm.appointmentDate && bookingForm.appointmentTime && doctor && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <h4 className="font-medium text-teal-800 mb-2">Booking Summary</h4>
                      <div className="space-y-1 text-sm text-teal-700">
                        <p><strong>Doctor:</strong> Dr. {doctor.firstName} {doctor.lastName}</p>
                        <p><strong>Date:</strong> {new Date(bookingForm.appointmentDate).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {bookingForm.appointmentTime}</p>
                        <p><strong>Type:</strong> {bookingForm.consultationType === 'in-person' ? 'In-Person' : 'Virtual'}</p>
                        <p><strong>Fee:</strong> {membership?.type === 'premium' ? 'FREE (Premium Member)' : 'R10 Booking Fee'}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6 border-t">
                    <BackButton />
                    <Button
                      type="submit"
                      disabled={bookingMutation.isPending || !bookingForm.appointmentDate || !bookingForm.appointmentTime || slotsLoading}
                      className="bg-teal-600 hover:bg-teal-700 flex-1"
                      data-testid="button-submit-booking"
                    >
                      {bookingMutation.isPending ? 'Processing...' : 
                       !bookingForm.appointmentDate || !bookingForm.appointmentTime ? 'Select Date & Time' :
                       membership?.type === 'premium' ? 'Book Appointment (Free)' : 'Proceed to Payment (R10)'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}