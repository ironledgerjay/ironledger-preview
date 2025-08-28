import { useState } from 'react';
import { useAuthNew } from '@/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Shield, QrCode, CheckCircle, AlertTriangle } from 'lucide-react';

interface TwoFactorSetupProps {
  user: {
    isTwoFactorEnabled: boolean;
  };
  onComplete?: () => void;
}

export default function TwoFactorSetup({ user, onComplete }: TwoFactorSetupProps) {
  const { generate2FA, enable2FA, disable2FA } = useAuthNew();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'setup' | 'verify' | 'disable'>('setup');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate2FA = async () => {
    setIsLoading(true);
    try {
      const result = await generate2FA();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setStep('verify');
    } catch (error) {
      // Error handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      await enable2FA(token);
      setStep('setup');
      setQrCode(null);
      setSecret(null);
      setToken('');
      onComplete?.();
    } catch (error) {
      // Error handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      await disable2FA(token);
      setStep('setup');
      setToken('');
      onComplete?.();
    } catch (error) {
      // Error handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  if (user.isTwoFactorEnabled) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            </div>
          </div>
          <CardDescription>
            Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when logging in.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'disable' ? (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Warning:</strong> Disabling 2FA will make your account less secure. Enter your current 2FA code to confirm.
                </AlertDescription>
              </Alert>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Current 2FA Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg font-mono"
                  data-testid="input-2fa-disable-token"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleDisable2FA}
                  disabled={isLoading || token.length !== 6}
                  variant="destructive"
                  className="flex-1"
                  data-testid="button-confirm-disable-2fa"
                >
                  {isLoading ? 'Disabling...' : 'Disable 2FA'}
                </Button>
                <Button
                  onClick={() => {
                    setStep('setup');
                    setToken('');
                  }}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-cancel-disable-2fa"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button
                onClick={() => setStep('disable')}
                variant="destructive"
                className="flex-1"
                data-testid="button-disable-2fa"
              >
                Disable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
          <Badge variant="outline" className="text-gray-600">
            Disabled
          </Badge>
        </div>
        <CardDescription>
          Add an extra layer of security to your account with two-factor authentication.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {step === 'setup' && (
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">What you'll need:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>• Your smartphone or tablet</li>
                <li>• A few minutes to set up</li>
              </ul>
            </div>
            
            <Button
              onClick={handleGenerate2FA}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              data-testid="button-setup-2fa"
            >
              {isLoading ? 'Generating...' : 'Set Up 2FA'}
            </Button>
          </div>
        )}
        
        {step === 'verify' && qrCode && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-2">Scan QR Code</h4>
              <p className="text-sm text-gray-600 mb-4">
                Open your authenticator app and scan this QR code to add your account.
              </p>
              
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            </div>
            
            {secret && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Manual Entry Code:</h5>
                <p className="text-sm text-gray-600 mb-2">
                  If you can't scan the QR code, enter this code manually:
                </p>
                <code className="text-xs bg-white px-2 py-1 rounded border font-mono break-all">
                  {secret}
                </code>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Verification Code
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Enter the 6-digit code from your authenticator app:
              </p>
              <Input
                type="text"
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg font-mono"
                data-testid="input-2fa-verification-code"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleEnable2FA}
                disabled={isLoading || token.length !== 6}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="button-verify-2fa"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button
                onClick={() => {
                  setStep('setup');
                  setQrCode(null);
                  setSecret(null);
                  setToken('');
                }}
                variant="outline"
                className="flex-1"
                data-testid="button-cancel-2fa-setup"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}