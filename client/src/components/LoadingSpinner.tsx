import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <h2 className="text-lg font-semibold text-gray-900">Loading...</h2>
        <p className="text-gray-600">Please wait while we prepare your content</p>
      </div>
    </div>
  );
}

export function CardLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" text="Loading content..." />
    </div>
  );
}