import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Something went wrong
              </CardTitle>
              <p className="text-gray-600 mt-2">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-gray-800 mb-2">Error Details:</h4>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center space-x-2"
                  data-testid="button-retry"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center space-x-2"
                  data-testid="button-home"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>If this problem persists, please contact our support team.</p>
                <p className="mt-1">
                  <a 
                    href="mailto:support@ironledgermedmap.com" 
                    className="text-teal-600 hover:text-teal-700 underline"
                  >
                    support@ironledgermedmap.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;