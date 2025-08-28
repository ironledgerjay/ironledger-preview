import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, Mail, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { usePageTracking } from '@/hooks/useActivityLogger';

export default function VerificationPending() {
  usePageTracking('Verification Pending');

  const verificationSteps = [
    {
      step: 1,
      title: "Application Submitted",
      description: "Your doctor registration has been received",
      status: "completed",
      icon: CheckCircle,
    },
    {
      step: 2,
      title: "Document Review",
      description: "Our team is reviewing your HPCSA credentials",
      status: "in_progress",
      icon: Shield,
    },
    {
      step: 3,
      title: "Profile Verification",
      description: "Final verification and profile activation",
      status: "pending",
      icon: Clock,
    },
    {
      step: 4,
      title: "Account Activated",
      description: "You'll receive an email confirmation when approved",
      status: "pending",
      icon: Mail,
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12" data-testid="page-verification-pending">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Verification in Progress
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Thank you for registering as a healthcare professional. Your account is currently under review for verification.
          </p>
        </div>

        {/* Status Alert */}
        <Alert className="mb-8 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Verification typically takes 1-3 business days.</strong> You'll receive an email notification once your account is approved and ready for use.
          </AlertDescription>
        </Alert>

        {/* Verification Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationSteps.map((step) => {
                const StatusIcon = step.icon;
                return (
                  <div key={step.step} className="flex items-start gap-4 p-4 rounded-lg border">
                    <div className={`rounded-full p-2 ${
                      step.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900/20' 
                        : step.status === 'in_progress'
                        ? 'bg-amber-100 dark:bg-amber-900/20'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <StatusIcon className={`h-5 w-5 ${
                        step.status === 'completed' 
                          ? 'text-green-600' 
                          : step.status === 'in_progress'
                          ? 'text-amber-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Step {step.step}: {step.title}</span>
                        <Badge variant={
                          step.status === 'completed' 
                            ? 'default' 
                            : step.status === 'in_progress'
                            ? 'secondary'
                            : 'outline'
                        }>
                          {step.status === 'completed' ? 'Complete' : 
                           step.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium">Email Notification</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email at your registered address once verification is complete.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Account Activation</h3>
                <p className="text-sm text-muted-foreground">
                  Upon approval, you can log in and start accepting patient appointments.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <h3 className="font-medium">Profile Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Complete your profile with consultation fees, availability, and additional details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have questions about the verification process or need to update your information, 
              please don't hesitate to contact our support team.
            </p>
            <div className="flex gap-4">
              <Link href="/contact">
                <Button variant="outline" data-testid="button-contact-support">
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" asChild>
                <a href="mailto:support@ironledgermedmap.co.za" data-testid="button-email-support">
                  Email Us
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}