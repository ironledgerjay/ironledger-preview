import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, twoFactorToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  generate2FA: () => Promise<{ secret: string; qrCode: string }>;
  enable2FA: (token: string) => Promise<void>;
  disable2FA: (token: string) => Promise<void>;
  token: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'patient' | 'doctor';
  firstName: string;
  lastName: string;
  phone?: string;
  province?: string;
  city?: string;
  specialty?: string;
  hpcsaNumber?: string;
  practiceAddress?: string;
  qualifications?: string;
  experience?: string;
  consultationFee?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up API request interceptor for authentication
  useEffect(() => {
    const originalApiRequest = apiRequest;
    
    // Override apiRequest to include auth header
    (window as any).apiRequest = async (method: string, url: string, data?: any) => {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include', // Include cookies for refresh tokens
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return response;
    };

    return () => {
      (window as any).apiRequest = originalApiRequest;
    };
  }, [token]);

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, twoFactorToken }: { 
      email: string; 
      password: string; 
      twoFactorToken?: string;
    }) => {
      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        password,
        twoFactorToken,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Login Successful",
        description: `Welcome back${data.user.role === 'doctor' ? ', Dr.' : ''}!`,
      });
    },
    onError: (error: any) => {
      if (error.message.includes('EMAIL_NOT_VERIFIED')) {
        toast({
          title: "Email Verification Required",
          description: "Please check your email and verify your account before logging in.",
          variant: "destructive",
        });
      } else if (error.message.includes('2FA_REQUIRED')) {
        toast({
          title: "Two-Factor Authentication Required",
          description: "Please enter your 2FA code to complete login.",
          variant: "default",
        });
      } else if (error.message.includes('locked')) {
        toast({
          title: "Account Locked",
          description: "Your account has been temporarily locked due to too many failed attempts.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      setToken(null);
      localStorage.removeItem('accessToken');
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    },
    onError: () => {
      // Clear local state even if API call fails
      setToken(null);
      localStorage.removeItem('accessToken');
      queryClient.clear();
    },
  });

  // Email verification mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/verify-email', { token });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified. You can now log in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Email verification failed.",
        variant: "destructive",
      });
    },
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/auth/resend-verification', { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "A new verification email has been sent to your inbox.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Email",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/auth/forgot-password', { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Email Sent",
        description: "If an account with that email exists, a password reset link has been sent.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Password reset request failed.",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/reset-password', { token, password });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Password reset failed.",
        variant: "destructive",
      });
    },
  });

  // 2FA mutations
  const generate2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/2fa/generate');
      return response.json();
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/2fa/enable', { token });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "2FA Setup Failed",
        description: error.message || "Failed to enable two-factor authentication.",
        variant: "destructive",
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/2fa/disable', { token });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "2FA Disable Failed",
        description: error.message || "Failed to disable two-factor authentication.",
        variant: "destructive",
      });
    },
  });

  const value: AuthContextType = {
    user: user?.user || null,
    isLoading,
    isAuthenticated: !!user?.user && !!token,
    token,
    login: async (email: string, password: string, twoFactorToken?: string) => {
      await loginMutation.mutateAsync({ email, password, twoFactorToken });
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    register: async (userData: RegisterData) => {
      await registerMutation.mutateAsync(userData);
    },
    verifyEmail: async (token: string) => {
      await verifyEmailMutation.mutateAsync(token);
    },
    resendVerification: async (email: string) => {
      await resendVerificationMutation.mutateAsync(email);
    },
    forgotPassword: async (email: string) => {
      await forgotPasswordMutation.mutateAsync(email);
    },
    resetPassword: async (token: string, password: string) => {
      await resetPasswordMutation.mutateAsync({ token, password });
    },
    generate2FA: async () => {
      const result = await generate2FAMutation.mutateAsync();
      return result;
    },
    enable2FA: async (token: string) => {
      await enable2FAMutation.mutateAsync(token);
    },
    disable2FA: async (token: string) => {
      await disable2FAMutation.mutateAsync(token);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthNew() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthNew must be used within an AuthProvider');
  }
  return context;
}

export default useAuthNew;