import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from '../../shared/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...');
    
    await migrate(db, { migrationsFolder: './migrations' });
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

export async function createInitialData() {
  try {
    console.log('🌱 Creating initial data...');

    // Check if we already have data
    const existingDoctors = await db.select().from(schema.doctors).limit(1);
    if (existingDoctors.length > 0) {
      console.log('📊 Initial data already exists, skipping...');
      return;
    }

    // Create sample doctors for each province
    const provinces = [
      'Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State',
      'KwaZulu-Natal', 'North West', 'Gauteng', 'Mpumalanga', 'Limpopo'
    ];

    const specialties = [
      'General Practice', 'Cardiology', 'Dermatology', 'Neurology',
      'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology'
    ];

    for (let i = 0; i < 25; i++) {
      const doctorData = {
        name: `Dr. ${['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa'][i % 6]} ${['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson'][i % 5]}`,
        specialty: specialties[i % specialties.length],
        qualifications: ['MBChB', 'MMed', 'FC', 'PhD'][Math.floor(i / 7) % 4],
        experience: Math.floor(Math.random() * 20) + 5,
        location: provinces[i % provinces.length],
        rating: 4 + Math.random(),
        consultationFee: 500 + Math.floor(Math.random() * 1000),
        bio: `Experienced ${specialties[i % specialties.length].toLowerCase()} specialist with ${Math.floor(Math.random() * 20) + 5} years of practice.`,
        availableSlots: [
          '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
        ],
        isVerified: true
      };

      await db.insert(schema.doctors).values(doctorData);
    }

    console.log('✅ Initial data created successfully');
  } catch (error) {
    console.error('❌ Failed to create initial data:', error);
  }
}

// Run migrations and initial data if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => createInitialData())
    .then(() => {
      console.log('🎉 Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}