import { Heart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function EmergencyButton() {
  const [, setLocation] = useLocation();

  const handleEmergencyClick = () => {
    setLocation("/emergency");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleEmergencyClick}
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-white shadow-2xl animate-pulse rounded-full p-4 h-16 w-16 flex items-center justify-center"
        data-testid="button-emergency-floating"
      >
        <div className="flex flex-col items-center">
          <Heart className="h-6 w-6 mb-1" />
          <span className="text-xs font-bold">SOS</span>
        </div>
      </Button>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20"></div>
      <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-10 animation-delay-1000"></div>
    </div>
  );
}