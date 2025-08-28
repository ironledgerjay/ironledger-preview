import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function BackButton({ 
  fallbackPath = '/', 
  className = '',
  children = 'Back'
}: BackButtonProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    // Try to go back in browser history first
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to specified path or home
      setLocation(fallbackPath);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className={`flex items-center gap-2 ${className}`}
      data-testid="button-back"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
}