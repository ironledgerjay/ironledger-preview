import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Menu, X, Stethoscope } from 'lucide-react';

export default function Header() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Find Doctors', href: '/search' },
    { name: 'Emergency', href: '/emergency' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50" data-testid="header-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-logo">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="text-primary-foreground h-4 w-4" />
            </div>
            <span className="text-xl font-bold text-primary">IronLedger MedMap</span>
          </Link>
          
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigation.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <Link 
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.href
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                    data-testid={`link-nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {item.name}
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  data-testid="button-signout"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" data-testid="button-signup">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border" data-testid="nav-mobile-menu">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-${item.name.toLowerCase().replace(' ', '-')}`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
