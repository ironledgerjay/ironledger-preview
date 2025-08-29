// Dynamic Doctor Generation Service
// Creates realistic doctor profiles in real-time for any requested doctor ID

interface GeneratedDoctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  hpcsaNumber: string;
  phone: string;
  province: string;
  city: string;
  zipCode: string;
  practiceAddress: string;
  isVerified: boolean;
  rating: string;
  reviewCount: number;
  consultationFee: string;
}

// South African doctor name pools
const firstNames = {
  male: ['Michael', 'David', 'John', 'James', 'Robert', 'Sipho', 'Thabo', 'Mandla', 'Johan', 'Pieter', 'Ahmed', 'Rajesh', 'Ryan', 'Bradley', 'Gareth'],
  female: ['Sarah', 'Nomsa', 'Thandiwe', 'Michelle', 'Andrea', 'Lerato', 'Palesa', 'Susan', 'Jennifer', 'Catherine', 'Fatima', 'Priya', 'Nicole', 'Candice', 'Samantha']
};

const surnames = [
  'Mthembu', 'Van Der Merwe', 'Dlamini', 'Johnson', 'Smith', 'Nkomo', 'Coetzee', 'Steyn', 'Mbeki', 'Botha',
  'Ndlovu', 'Williams', 'Brown', 'Van Wyk', 'Pretorius', 'Mahlangu', 'Molefe', 'Khumalo', 'Sithole', 'Mokoena',
  'Patel', 'Khan', 'Hassan', 'Reddy', 'Naidoo', 'Pillay', 'Singh', 'Maharaj', 'Desai', 'Sharma'
];

const specialties = [
  'General Practice', 'Cardiology', 'Pediatrics', 'Gynecology', 'Orthopedics', 'Dermatology', 
  'Neurology', 'Psychiatry', 'Emergency Medicine', 'Radiology', 'Anesthesiology', 'Oncology',
  'Ophthalmology', 'ENT', 'Urology', 'Gastroenterology', 'Pulmonology', 'Endocrinology',
  'Rheumatology', 'Infectious Diseases', 'Nephrology', 'Plastic Surgery', 'Pathology'
];

const provinces = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 
  'Mpumalanga', 'North West', 'Free State', 'Northern Cape'
];

const cityMap: Record<string, string[]> = {
  'Gauteng': ['Johannesburg', 'Pretoria', 'Sandton', 'Roodepoort', 'Germiston', 'Benoni', 'Boksburg'],
  'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Worcester', 'Hermanus'],
  'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Newcastle', 'Ladysmith'],
  'Eastern Cape': ['Port Elizabeth', 'East London', 'Uitenhage', 'King Williams Town', 'Grahamstown'],
  'Limpopo': ['Polokwane', 'Tzaneen', 'Thohoyandou', 'Giyani', 'Mokopane'],
  'Mpumalanga': ['Nelspruit', 'Witbank', 'Secunda', 'Standerton', 'Middelburg'],
  'North West': ['Rustenburg', 'Klerksdorp', 'Potchefstroom', 'Mafikeng', 'Brits'],
  'Free State': ['Bloemfontein', 'Welkom', 'Kroonstad', 'Bethlehem', 'Sasolburg'],
  'Northern Cape': ['Kimberley', 'Upington', 'Springbok', 'De Aar', 'Kuruman']
};

// Seeded random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export class DoctorGenerator {
  // Generate consistent doctor profile from doctor ID
  static generateDoctor(doctorId: string): GeneratedDoctor {
    const random = new SeededRandom(doctorId);
    
    // Determine gender and select names
    const isMale = random.next() > 0.5;
    const firstName = random.choice(isMale ? firstNames.male : firstNames.female);
    const lastName = random.choice(surnames);
    
    // Select location
    const province = random.choice(provinces);
    const city = random.choice(cityMap[province]);
    
    // Generate specialty and other details
    const specialty = random.choice(specialties);
    const rating = (4.0 + random.next() * 1.0).toFixed(1); // 4.0 - 5.0
    const reviewCount = random.range(15, 250);
    const consultationFee = random.range(450, 1200);
    
    // Generate HPCSA number (format: MP + 6 digits)
    const hpcsaNumber = `MP${random.range(100000, 999999)}`;
    
    // Generate phone number (South African format)
    const areaCode = random.choice(['011', '021', '031', '041', '051', '012']);
    const phoneNumber = `+27 ${areaCode} ${random.range(100, 999)} ${random.range(1000, 9999)}`;
    
    // Generate postal code based on province
    const postalCodes: Record<string, [number, number]> = {
      'Gauteng': [1000, 2999],
      'Western Cape': [7000, 8999],
      'KwaZulu-Natal': [3000, 4999],
      'Eastern Cape': [5000, 6999],
      'Limpopo': [700, 999],
      'Mpumalanga': [1000, 1999],
      'North West': [2500, 2999],
      'Free State': [9000, 9999],
      'Northern Cape': [8000, 8999]
    };
    
    const [minZip, maxZip] = postalCodes[province];
    const zipCode = random.range(minZip, maxZip).toString();
    
    // Generate practice address
    const streetNumbers = random.range(1, 999);
    const streetNames = [
      'Medical Centre', 'Healthcare Plaza', 'Wellness Centre', 'Professional Centre',
      'Medical Complex', 'Health Hub', 'Medical Park', 'Specialist Centre'
    ];
    const streetName = random.choice(streetNames);
    const practiceAddress = `${streetNumbers} ${streetName}, ${city}`;
    
    return {
      id: doctorId,
      userId: `user-${doctorId.replace('doctor-', '')}`,
      firstName,
      lastName,
      specialty,
      hpcsaNumber,
      phone: phoneNumber,
      province,
      city,
      zipCode,
      practiceAddress,
      isVerified: true, // All generated doctors are verified
      rating,
      reviewCount,
      consultationFee: consultationFee.toString() + '.00'
    };
  }

  // Generate available time slots for any doctor
  static generateAvailableSlots(doctorId: string, date: string): Array<{time: string, available: boolean, datetime: string}> {
    const random = new SeededRandom(`${doctorId}-${date}`);
    const slots = [];
    
    // Standard working hours: 9:00 AM to 4:30 PM (30-minute slots)
    const startHour = 9;
    const endHour = 16;
    const slotDuration = 30; // minutes
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        if (hour === endHour && minute >= 30) break; // Stop at 4:30 PM
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const datetime = `${date}T${timeString}:00.000Z`;
        
        // Randomly make some slots unavailable (20% chance)
        const available = random.next() > 0.2;
        
        slots.push({
          time: timeString,
          available,
          datetime
        });
      }
    }
    
    return slots;
  }

  // Generate a list of random doctors for browsing
  static generateDoctorList(count: number, seedPrefix: string = 'list'): GeneratedDoctor[] {
    const doctors: GeneratedDoctor[] = [];
    
    for (let i = 1; i <= count; i++) {
      const doctorId = `doctor-generated-${seedPrefix}-${i}`;
      doctors.push(this.generateDoctor(doctorId));
    }
    
    return doctors;
  }

  // Check if a doctor ID follows the expected pattern
  static isValidDoctorId(doctorId: string): boolean {
    return /^doctor-[a-z0-9-]+$/.test(doctorId);
  }
}