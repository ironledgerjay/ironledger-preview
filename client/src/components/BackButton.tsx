import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export default function BackButton({ fallbackPath = '/', className }: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Try to go back in browser history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to specified path
      setLocation(fallbackPath);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`text-gray-600 hover:text-gray-800 p-0 h-auto ${className}`}
      data-testid="back-button"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );
}