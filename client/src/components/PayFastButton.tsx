import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePayFast } from '@/hooks/usePayFast';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard } from 'lucide-react';

interface PayFastButtonProps {
  amount: number;
  itemName: string;
  itemDescription: string;
  type: 'membership' | 'booking';
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PayFastButton({
  amount,
  itemName,
  itemDescription,
  type,
  className,
  children,
  onSuccess,
  onError,
}: PayFastButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { processPayment, loading } = usePayFast();
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a payment.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processPayment({
        amount,
        itemName,
        itemDescription,
        customStr1: type,
      });

      if (result.success) {
        toast({
          title: "Redirecting to Payment",
          description: "You will be redirected to PayFast to complete your payment.",
        });
        onSuccess?.();
      } else {
        const errorMessage = result.error || "Payment processing failed";
        toast({
          title: "Payment Failed",
          description: errorMessage,
          variant: "destructive",
        });
        onError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = loading || isProcessing;

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={className}
      data-testid={`button-payfast-${type}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          {children || `Pay R${amount.toFixed(2)} with PayFast`}
        </>
      )}
    </Button>
  );
}
