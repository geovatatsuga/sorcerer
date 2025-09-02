import { Link } from "wouter";
import { Twitter, Instagram, MessageCircle } from "lucide-react";

const quickLinks = [
  { name: "Latest Chapters", href: "/chapters" },
  { name: "Character Gallery", href: "/characters" },
  { name: "World Map", href: "/world" },
  { name: "The Codex", href: "/codex" },
];

const supportLinks = [
  { name: "FAQ", href: "#" },
  { name: "Contact Author", href: "#" },
  { name: "Patreon", href: "#" },
  { name: "Ko-fi", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="font-display text-xl font-bold text-primary mb-4" data-testid="text-footer-title">
              The Return of the First Sorcerer
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              An epic fantasy webnovel exploring themes of power, redemption, and the eternal struggle between light and darkness.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-discord"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-card-foreground mb-4" data-testid="text-quick-links">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`link-footer-${link.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-card-foreground mb-4" data-testid="text-support">
              Support
            </h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`link-support-${link.name.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground" data-testid="text-copyright">
            © 2024 The Return of the First Sorcerer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
