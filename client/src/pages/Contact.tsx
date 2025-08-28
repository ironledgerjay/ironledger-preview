import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const { toast } = useToast();

  const submitContactForm = useMutation({
    mutationFn: async (data: ContactForm) => {
      return apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you within 24 hours.",
      });
      setForm({ name: '', email: '', subject: '', message: '' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    submitContactForm.mutate(form);
  };

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+27 11 123 4567', '+27 21 456 7890'],
      description: 'Mon-Fri: 8:00 AM - 6:00 PM',
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['support@ironledgermedmap.co.za', 'doctors@ironledgermedmap.co.za'],
      description: 'We respond within 24 hours',
    },
    {
      icon: MapPin,
      title: 'Head Office',
      details: ['123 Medical Street', 'Cape Town, 8000', 'Western Cape, South Africa'],
      description: 'Mon-Fri: 9:00 AM - 5:00 PM',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5" data-testid="section-contact-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have questions about our platform? Need help finding a doctor? We're here to help 
              you navigate South Africa's healthcare landscape.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-20 bg-card" data-testid="section-contact-form">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-contact">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Your full name"
                        required
                        data-testid="input-name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="What is this regarding?"
                      required
                      data-testid="input-subject"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Please provide details about your inquiry..."
                      className="min-h-[120px]"
                      required
                      data-testid="textarea-message"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitContactForm.isPending}
                    data-testid="button-submit-contact"
                  >
                    {submitContactForm.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
                <p className="text-muted-foreground mb-8">
                  Choose the best way to reach us. Our support team is available Monday through Friday 
                  to help with any questions about our platform or services.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="shadow-lg" data-testid={`card-contact-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <info.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                          <div className="space-y-1">
                            {info.details.map((detail, idx) => (
                              <p key={idx} className="text-muted-foreground">
                                {detail}
                              </p>
                            ))}
                          </div>
                          <p className="text-sm text-primary mt-2">{info.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/30 to-accent/20" data-testid="section-faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions about IronLedger MedMap
            </p>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  How do I know the doctors are legitimate?
                </h3>
                <p className="text-muted-foreground">
                  All doctors on our platform are HPCSA (Health Professions Council of South Africa) 
                  verified. We conduct thorough background checks and verify qualifications before 
                  any doctor can join our network.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  What payment methods do you accept?
                </h3>
                <p className="text-muted-foreground">
                  We use PayFast, South Africa's leading payment gateway. You can pay using credit 
                  cards, EFT, and other secure payment methods supported by PayFast.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Is the Premium membership worth it?
                </h3>
                <p className="text-muted-foreground">
                  Premium membership at R39 per quarter includes 5 free bookings, saving you R50 
                  compared to paying per booking. It also includes priority support and advanced 
                  search features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
