import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(val => parseInt(val) || 5000),
  DATABASE_URL: z.string().url('DATABASE_URL is required'),
  
  // PayFast Configuration
  VITE_PAYFAST_MERCHANT_ID: z.string().min(1, 'PayFast Merchant ID is required'),
  VITE_PAYFAST_MERCHANT_KEY: z.string().min(1, 'PayFast Merchant Key is required'),
  VITE_PAYFAST_PASSPHRASE: z.string().min(1, 'PayFast Passphrase is required'),
  
  // Supabase Configuration (optional for direct DB access)
  VITE_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Security
  JWT_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  
  // External Services
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(val => parseInt(val) || 587).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Feature Flags
  MAINTENANCE_MODE: z.string().transform(val => val === 'true').default('false'),
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val) || 15 * 60 * 1000).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val) || 100).default('100'),
});

type Environment = z.infer<typeof envSchema>;

let env: Environment;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Environment validation failed:');
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
  process.exit(1);
}

export { env };

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Configuration objects
export const dbConfig = {
  url: env.DATABASE_URL,
  ssl: isProduction,
};

export const payfastConfig = {
  merchantId: env.VITE_PAYFAST_MERCHANT_ID,
  merchantKey: env.VITE_PAYFAST_MERCHANT_KEY,
  passphrase: env.VITE_PAYFAST_PASSPHRASE,
  sandbox: isDevelopment,
};

export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
};

export const corsConfig = {
  origin: isProduction 
    ? ['https://ironledgermedmap.com', 'https://www.ironledgermedmap.com']
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
};

export const securityConfig = {
  jwtSecret: env.JWT_SECRET || 'fallback-secret-for-development',
  encryptionKey: env.ENCRYPTION_KEY || 'fallback-encryption-key-dev',
  bcryptRounds: isProduction ? 12 : 10,
};