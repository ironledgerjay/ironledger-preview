import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar as CalendarIcon, Clock, MapPin, Phone, Video, Star, ArrowLeft, ArrowRight, User, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { usePayFast } from '@/hooks/usePayFast';
import { format, addDays, isSameDay, isToday, isTomorrow } from 'date-fns';

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
  profileImageUrl?: string;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  date: string;
}

interface BookingData {
  doctorId: string;
  appointmentDate: Date;
  consultationType: 'in-person' | 'video-call' | 'phone-call';
  reason: string;
  notes?: string;
  patientDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    medicalAidNumber?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
  };
  paymentMethod: 'payfast' | 'medical-aid';
  agreedToTerms: boolean;
}

const consultationTypes = [
  {
    id: 'in-person',
    label: 'In-Person Consultation',
    description: 'Visit the doctor\'s practice',
    icon: MapPin,
    price: 'Consultation fee applies'
  },
  {
    id: 'video-call',
    label: 'Video Consultation',
    description: 'Online video call',
    icon: Video,
    price: 'Consultation fee + R10 convenience fee'
  },
  {
    id: 'phone-call',
    label: 'Phone Consultation',
    description: 'Phone call consultation',
    icon: Phone,
    price: 'Consultation fee + R10 convenience fee'
  }
];

const reasonOptions = [
  'General Consultation',
  'Follow-up Appointment',
  'Health Check-up',
  'Vaccination',
  'Prescription Renewal',
  'Test Results Review',
  'Chronic Disease Management',
  'Mental Health Consultation',
  'Other (specify in notes)'
];

export default function BookingWizard() {
  const { doctorId } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { logUserAction } = useActivityLogger();
  const { generatePaymentUrl } = usePayFast();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    doctorId,
    consultationType: 'in-person',
    reason: '',
    notes: '',
    patientDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      medicalAidNumber: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    },
    paymentMethod: 'payfast',
    agreedToTerms: false,
  });

  // Fetch doctor details
  const { data: doctor, isLoading: doctorLoading } = useQuery<Doctor>({
    queryKey: [`/api/doctors/${doctorId}`],
    enabled: !!doctorId,
  });

  // Fetch available time slots for selected date
  const { data: timeSlots = [], isLoading: slotsLoading } = useQuery<TimeSlot[]>({
    queryKey: [`/api/doctors/${doctorId}/availability`, selectedDate?.toISOString()],
    enabled: !!doctorId && !!selectedDate,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingData) => {
      return apiRequest('POST', '/api/bookings', data);
    },
    onSuccess: async (booking) => {
      logUserAction('booking_created', 'booking_wizard', {
        doctorId,
        consultationType: bookingData.consultationType,
        paymentMethod: bookingData.paymentMethod,
      });

      // Generate payment URL if needed
      if (bookingData.paymentMethod === 'payfast') {
        const convenienceFee = bookingData.consultationType === 'in-person' ? 0 : 10;
        const totalAmount = parseFloat(doctor?.consultationFee || '0') + convenienceFee;
        
        const paymentUrl = await generatePaymentUrl({
          amount: totalAmount,
          item_name: `Consultation with Dr. ${doctor?.firstName} ${doctor?.lastName}`,
          custom_str1: 'booking',
          custom_str2: booking.id,
        });
        
        window.location.href = paymentUrl;
      } else {
        navigate('/booking-success');
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Generate available dates (next 30 days excluding weekends)
  useEffect(() => {
    const dates: Date[] = [];
    for (let i = 1; i <= 30; i++) {
      const date = addDays(new Date(), i);
      const dayOfWeek = date.getDay();
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(date);
      }
    }
    setAvailableDates(dates);
  }, []);

  // Auto-fill patient details if user is logged in
  useEffect(() => {
    if (user && user.role === 'patient') {
      // Fetch patient profile and auto-fill
      // This would be implemented with actual patient data
    }
  }, [user]);

  const handleStepChange = (step: number) => {
    if (step > currentStep) {
      // Validate current step before proceeding
      if (currentStep === 1 && (!selectedDate || !selectedTime || !bookingData.consultationType)) {
        toast({
          title: 'Please Complete Step',
          description: 'Please select a date, time, and consultation type.',
          variant: 'destructive',
        });
        return;
      }
      if (currentStep === 2 && !bookingData.reason) {
        toast({
          title: 'Please Complete Step',
          description: 'Please select a reason for your visit.',
          variant: 'destructive',
        });
        return;
      }
      if (currentStep === 3) {
        const { patientDetails } = bookingData;
        if (!patientDetails?.firstName || !patientDetails?.lastName || !patientDetails?.email || !patientDetails?.phone) {
          toast({
            title: 'Please Complete Step',
            description: 'Please fill in all required patient details.',
            variant: 'destructive',
          });
          return;
        }
      }
    }
    setCurrentStep(step);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingData.reason || !bookingData.agreedToTerms) {
      toast({
        title: 'Please Complete All Fields',
        description: 'Please ensure all required fields are filled and terms are accepted.',
        variant: 'destructive',
      });
      return;
    }

    const appointmentDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));

    const completeBookingData: BookingData = {
      ...bookingData as BookingData,
      appointmentDate,
    };

    logUserAction('booking_submit_attempt', 'booking_wizard', {
      doctorId,
      step: currentStep,
    });

    createBookingMutation.mutate(completeBookingData);
  };

  const getDateDisplayName = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE');
  };

  const calculateTotalFee = () => {
    const consultationFee = parseFloat(doctor?.consultationFee || '0');
    const convenienceFee = bookingData.consultationType === 'in-person' ? 0 : 10;
    return consultationFee + convenienceFee;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to book an appointment</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Link href="/login">
              <Button className="w-full">Log In</Button>
            </Link>
            <Link href="/patient-signup">
              <Button variant="outline" className="w-full">Sign Up as Patient</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (doctorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Doctor Not Found</CardTitle>
            <CardDescription>The doctor you're looking for could not be found</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/doctors">
              <Button>Browse Doctors</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/doctors" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Doctors
          </Link>
          
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            <Avatar className="w-16 h-16">
              <AvatarImage src={doctor.profileImageUrl} />
              <AvatarFallback className="text-lg">
                {doctor.firstName[0]}{doctor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Book Appointment with Dr. {doctor.firstName} {doctor.lastName}
              </h1>
              <p className="text-gray-600">{doctor.specialty}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">{doctor.averageRating?.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({doctor.totalReviews} reviews)</span>
                </div>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-600">{doctor.city}, {doctor.province}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">R{doctor.consultationFee}</p>
              <p className="text-sm text-gray-500">Consultation Fee</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step 1: Date, Time & Consultation Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
                  <p className="text-gray-600">Choose your preferred appointment date and consultation type</p>
                </div>

                {/* Date Selection */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Select Date</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {availableDates.slice(0, 8).map((date) => (
                      <Button
                        key={date.toISOString()}
                        variant={selectedDate && isSameDay(date, selectedDate) ? "default" : "outline"}
                        className="p-4 h-auto flex flex-col"
                        onClick={() => setSelectedDate(date)}
                        data-testid={`date-${format(date, 'yyyy-MM-dd')}`}
                      >
                        <span className="text-sm font-medium">{getDateDisplayName(date)}</span>
                        <span className="text-lg font-bold">{format(date, 'd')}</span>
                        <span className="text-xs">{format(date, 'MMM')}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">Select Time</Label>
                    {slotsLoading ? (
                      <div className="text-center py-4">Loading available times...</div>
                    ) : timeSlots.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">No available times for this date</p>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            disabled={!slot.isAvailable}
                            onClick={() => setSelectedTime(slot.time)}
                            data-testid={`time-${slot.time}`}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Consultation Type */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Consultation Type</Label>
                  <div className="space-y-3">
                    {consultationTypes.map((type) => (
                      <div 
                        key={type.id} 
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          bookingData.consultationType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setBookingData(prev => ({ ...prev, consultationType: type.id as any }))}
                        data-testid={`consultation-${type.id}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          bookingData.consultationType === type.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {bookingData.consultationType === type.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <type.icon className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <Label className="font-medium cursor-pointer">
                              {type.label}
                            </Label>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{type.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Reason for Visit */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Reason for Visit</h2>
                  <p className="text-gray-600">Help the doctor prepare for your consultation</p>
                </div>

                <div>
                  <Label htmlFor="reason" className="text-lg font-semibold mb-4 block">
                    What's the main reason for your visit?
                  </Label>
                  <Select onValueChange={(value) => setBookingData(prev => ({ ...prev, reason: value }))}>
                    <SelectTrigger data-testid="select-reason">
                      <SelectValue placeholder="Select reason for visit" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasonOptions.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-lg font-semibold mb-4 block">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Provide any additional details about your symptoms, concerns, or questions for the doctor..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    data-testid="textarea-notes"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Patient Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Patient Information</h2>
                  <p className="text-gray-600">Please provide your contact and medical details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={bookingData.patientDetails?.firstName || ''}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        patientDetails: { ...prev.patientDetails!, firstName: e.target.value }
                      }))}
                      data-testid="input-patient-firstName"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={bookingData.patientDetails?.lastName || ''}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        patientDetails: { ...prev.patientDetails!, lastName: e.target.value }
                      }))}
                      data-testid="input-patient-lastName"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingData.patientDetails?.email || ''}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        patientDetails: { ...prev.patientDetails!, email: e.target.value }
                      }))}
                      data-testid="input-patient-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={bookingData.patientDetails?.phone || ''}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        patientDetails: { ...prev.patientDetails!, phone: e.target.value }
                      }))}
                      data-testid="input-patient-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={bookingData.patientDetails?.dateOfBirth || ''}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        patientDetails: { ...prev.patientDetails!, dateOfBirth: e.target.value }
                      }))}
                      data-testid="input-patient-dateOfBirth"
                    />
                  </div>

                  <div>
                    <Label htmlFor="medicalAidNumber">Medical Aid Number</Label>
                    <Input
                      id="medicalAidNumber"
                      value={bookingData.patientDetails?.medicalAidNumber || ''}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        patientDetails: { ...prev.patientDetails!, medicalAidNumber: e.target.value }
                      }))}
                      data-testid="input-patient-medicalAidNumber"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={bookingData.patientDetails?.emergencyContactName || ''}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        patientDetails: { ...prev.patientDetails!, emergencyContactName: e.target.value }
                      }))}
                      data-testid="input-patient-emergencyContactName"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={bookingData.patientDetails?.emergencyContactPhone || ''}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        patientDetails: { ...prev.patientDetails!, emergencyContactPhone: e.target.value }
                      }))}
                      data-testid="input-patient-emergencyContactPhone"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment & Confirmation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Payment & Confirmation</h2>
                  <p className="text-gray-600">Review your appointment details and complete payment</p>
                </div>

                {/* Appointment Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4">Appointment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Doctor:</span>
                      <span className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{selectedDate && format(selectedDate, 'PPP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium capitalize">
                        {bookingData.consultationType?.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reason:</span>
                      <span className="font-medium">{bookingData.reason}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total Fee:</span>
                      <span>R{calculateTotalFee().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Payment Method</Label>
                  <div className="space-y-3">
                    <div 
                      className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        bookingData.paymentMethod === 'payfast' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'payfast' }))}
                      data-testid="payment-payfast"
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        bookingData.paymentMethod === 'payfast' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {bookingData.paymentMethod === 'payfast' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        <div>
                          <Label className="font-medium cursor-pointer">PayFast</Label>
                          <p className="text-sm text-gray-600">Secure online payment with card or EFT</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-4 border rounded-lg opacity-50">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                      <div className="flex items-center gap-3 flex-1">
                        <User className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label className="font-medium">Medical Aid</Label>
                          <p className="text-sm text-gray-600">Submit to medical aid (Coming soon)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={bookingData.agreedToTerms}
                    onCheckedChange={(checked) => setBookingData(prev => ({ ...prev, agreedToTerms: !!checked }))}
                    data-testid="checkbox-terms"
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => handleStepChange(currentStep - 1)}
                  data-testid="button-previous"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}

              {currentStep < 4 ? (
                <Button
                  onClick={() => handleStepChange(currentStep + 1)}
                  className="ml-auto"
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleBooking}
                  disabled={createBookingMutation.isPending || !bookingData.agreedToTerms}
                  className="ml-auto"
                  data-testid="button-book-appointment"
                >
                  {createBookingMutation.isPending ? 'Processing...' : 'Book Appointment'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}