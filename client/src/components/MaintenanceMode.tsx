import { Wrench, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MaintenanceModeProps {
  estimatedDuration?: string;
  message?: string;
  contactEmail?: string;
}

export default function MaintenanceMode({
  estimatedDuration = "2 hours",
  message = "We're currently performing scheduled maintenance to improve your experience.",
  contactEmail = "support@ironledgermedmap.com"
}: MaintenanceModeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-teal-600" />
          </div>
          <Badge className="mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Maintenance In Progress
          </Badge>
          <CardTitle className="text-3xl font-bold text-gray-900">
            IronLedger MedMap
          </CardTitle>
          <p className="text-xl text-gray-600 mt-2">
            Temporarily Unavailable
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <p className="text-gray-700 text-lg">
              {message}
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>Estimated Duration: {estimatedDuration}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              What we're improving:
            </h3>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• Enhanced security measures</li>
              <li>• Improved booking performance</li>
              <li>• Updated payment processing</li>
              <li>• General stability improvements</li>
            </ul>
          </div>
          
          <div className="border-t pt-6">
            <p className="text-gray-600 text-sm">
              Need urgent medical assistance? Please contact your local emergency services.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              For non-urgent inquiries, email us at{' '}
              <a 
                href={`mailto:${contactEmail}`}
                className="text-teal-600 hover:text-teal-700 underline"
              >
                {contactEmail}
              </a>
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            We'll be back online shortly. Thank you for your patience.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}