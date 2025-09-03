import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe, Settings, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import type { Language } from "@/lib/translations";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  const navigationItems = [
    { name: t.home, href: "/" },
    { name: t.chapters, href: "/chapters" },
    { name: t.characters, href: "/characters" },
    { name: t.world, href: "/world" },
    { name: t.codex, href: "/codex" },
    { name: t.blog, href: "/blog" },
  ];

  useEffect(() => {
    const smoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.href?.includes('#')) {
        e.preventDefault();
        const id = target.href.split('#')[1];
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    document.addEventListener('click', smoothScroll);
    return () => document.removeEventListener('click', smoothScroll);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" data-testid="link-home">
              <h1 className="font-display text-xl font-bold text-primary">
                {t.heroTitle}
              </h1>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigationItems.map((item) => {
                const displayName = item.name ?? "";
                const safeId = displayName
                  ? `link-${displayName.toLowerCase().replace(/\s+/g, "-")}`
                  : `link-${item.href.replace(/\//g, "-")}`;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={safeId}
                    className={`font-medium transition-colors duration-200 ${
                      location === item.href
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Admin link for admins */}
              {isAdmin && (
                <Link
                  href="/admin"
                  data-testid="link-admin"
                  className={`font-medium transition-colors duration-200 ${
                    location === "/admin"
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  <Settings className="h-4 w-4 inline mr-1" />
                  Admin
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-foreground hover:text-primary transition-colors"
                    data-testid="button-language-selector"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    {languages.find(l => l.code === language)?.flag}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`cursor-pointer ${language === lang.code ? 'bg-muted' : ''}`}
                      data-testid={`language-option-${lang.code}`}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Authentication */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-foreground hover:text-primary transition-colors"
                      data-testid="button-user-menu"
                    >
                      {user?.firstName || user?.email || 'Usuário'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="cursor-pointer w-full">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild variant="ghost" size="sm">
                  <a
                    href="/api/login"
                    data-testid="button-login"
                    onClick={async (e) => {
                      // Prevent SPA router interception
                      e.preventDefault();
                      try {
                        // Try development helper first
                        const resp = await fetch('/api/dev/login', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ id: 'dev-admin', isAdmin: true }) });
                        if (resp.ok) {
                          window.location.reload();
                          return;
                        }
                      } catch (err) {
                        // ignore and fallback to server login
                      }
                      // Fallback to server OIDC login
                      window.location.href = '/api/login';
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    Entrar
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="md:hidden text-foreground hover:text-primary transition-colors"
                  data-testid="button-mobile-language-selector"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {languages.find(l => l.code === language)?.flag}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`cursor-pointer ${language === lang.code ? 'bg-muted' : ''}`}
                    data-testid={`mobile-language-option-${lang.code}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground hover:text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const displayName = item.name ?? "";
              const safeId = displayName
                ? `mobile-link-${displayName.toLowerCase().replace(/\s+/g, "-")}`
                : `mobile-link-${item.href.replace(/\//g, "-")}`;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={safeId}
                  className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                    location === item.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground hover:text-primary hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Admin link for mobile */}
            {isAdmin && (
              <Link
                href="/admin"
                data-testid="mobile-link-admin"
                className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                  location === "/admin"
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-muted"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Link>
            )}
            
            {/* Authentication for mobile */}
            <div className="border-t border-border mt-3 pt-3">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {user?.firstName || user?.email || 'Usuário'}
                  </div>
                  <a
                    href="/api/logout"
                    className="flex items-center px-3 py-2 rounded-md font-medium transition-colors text-foreground hover:text-primary hover:bg-muted"
                    data-testid="mobile-button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </a>
                </>
              ) : (
                <a
                  href="/api/login"
                  className="flex items-center px-3 py-2 rounded-md font-medium transition-colors text-foreground hover:text-primary hover:bg-muted"
                  data-testid="mobile-button-login"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const resp = await fetch('/api/dev/login', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ id: 'dev-admin', isAdmin: true }) });
                      if (resp.ok) { window.location.reload(); return; }
                    } catch (err) {}
                    window.location.href = '/api/login';
                  }}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
