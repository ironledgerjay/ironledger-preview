import { Link } from 'wouter';
import { Stethoscope, Facebook, Twitter, Linkedin, Phone, Mail, MapPin, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Stethoscope className="text-primary-foreground h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-primary">IronLedger MedMap</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Connecting South Africans with trusted, verified medical professionals across all 9 provinces.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-social-facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-social-twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-social-linkedin"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-primary transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="text-muted-foreground hover:text-primary transition-colors">
                  Emergency Care
                </Link>
              </li>
              <li>
                <Link href="/membership" className="text-muted-foreground hover:text-primary transition-colors">
                  Membership Plans
                </Link>
              </li>
              <li>
                <Link href="/doctor-registration" className="text-muted-foreground hover:text-primary transition-colors">
                  Doctor Registration
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+27 11 123 4567</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@ironledgermedmap.co.za</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Cape Town, South Africa</span>
              </div>
            </div>
            
            {/* Payment Security */}
            <div className="pt-4">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Payments secured by PayFast</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 IronLedger MedMap. All rights reserved. | HPCSA Registered Platform</p>
        </div>
      </div>
    </footer>
  );
}
