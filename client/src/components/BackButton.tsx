import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
}

export default function BackButton({ fallbackPath = '/', className = '' }: BackButtonProps) {
  const [location, navigate] = useLocation();

  const handleBack = () => {
    // Try to go back in browser history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to specified path or home
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 ${className}`}
      data-testid="button-back"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}