import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Stethoscope, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await signIn(email, password);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Stethoscope className="text-primary-foreground h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-primary">IronLedger MedMap</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Sign In</h1>
            <p className="mt-2 text-muted-foreground">
              Access your healthcare network
            </p>
          </div>

          {/* Login Form */}
          <Card className="shadow-lg" data-testid="card-login-form">
            <CardHeader>
              <CardTitle className="text-center text-xl">Welcome Back</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-login">
                {error && (
                  <Alert variant="destructive" data-testid="alert-login-error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="pl-10"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      data-testid="input-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="button-sign-in"
                >
                  {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6">
                <Separator className="mb-6" />
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link href="/signup" className="font-medium text-primary hover:underline" data-testid="link-signup">
                    Sign up here
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>HPCSA Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>Secure Platform</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
