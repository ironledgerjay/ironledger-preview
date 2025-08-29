import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket(userType: 'doctor' | 'patient' | 'admin', userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Register connection based on user type
      const registrationMessage = {
        type: `register_${userType}`,
        [`${userType}Id`]: userId,
        timestamp: new Date().toISOString()
      };
      
      ws.send(JSON.stringify(registrationMessage));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        setLastMessage(message);
        
        // Handle different message types
        switch (message.type) {
          case 'booking_update':
            // Invalidate booking-related queries
            queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
            queryClient.invalidateQueries({ queryKey: ['/api/doctor/bookings'] });
            break;
            
          case 'schedule_update':
            // Invalidate schedule and availability queries
            queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
            queryClient.invalidateQueries({ predicate: query => 
              Array.isArray(query.queryKey) && 
              query.queryKey.some(key => 
                typeof key === 'string' && 
                (key.includes('/available-slots') || key.includes('/schedule'))
              )
            });
            break;
            
          case 'doctor_verification':
            // Invalidate doctor lists and profiles
            queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
            queryClient.invalidateQueries({ queryKey: ['/api/crm/doctors'] });
            break;
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [userType, userId, queryClient]);

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage
  };
}