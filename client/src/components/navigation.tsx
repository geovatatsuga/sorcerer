import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Settings, LogOut, LogIn, User as UserIcon, ShieldCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { authHeaders } from "@/lib/authHeaders";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const navigationItems = [
    { name: t.home, href: "/" },
    { name: t.chapters, href: "/chapters" },
    { name: t.characters, href: "/characters" },
    { name: t.world, href: "/mundo" },
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#04080e]/72 backdrop-blur-[18px] border-b border-primary/12 h-[56px]">
      <div className="w-full px-4 sm:px-6 lg:pl-24 lg:pr-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" data-testid="link-home" className="flex flex-col select-none group">
              <span className="text-[9px] tracking-[0.3em] font-sans font-semibold text-muted-foreground uppercase leading-none mb-1.5 group-hover:text-primary transition-colors">
                O RETORNO DO
              </span>
              <span className="font-display text-[15px] sm:text-base font-bold text-primary uppercase tracking-wider leading-none group-hover:text-primary-light transition-colors">
                PRIMEIRO FEITICEIRO
              </span>
            </Link>
          </div>
          
          {/* Central Menu */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-10">
              {navigationItems.map((item) => {
                const displayName = item.name ?? "";
                const safeId = displayName
                  ? `link-${displayName.toLowerCase().replace(/\s+/g, "-")}`
                  : `link-${item.href.replace(/\//g, "-")}`;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={safeId}
                    className={`text-[11px] tracking-[0.22em] font-display uppercase font-semibold transition-all duration-300 relative py-2 ${
                      isActive
                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:shadow-[0_0_8px_rgba(216,170,92,0.6)]"
                        : "text-foreground/75 hover:text-primary"
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    data-active={isActive ? 'true' : 'false'}
                    onClick={async () => {
                      try {
                        console.debug('[nav] click', item.href, 'current', location);
                        try { await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] }); } catch(e) {}
                        setLocation(item.href);
                        setTimeout(() => {
                          try {
                            if (window.location.pathname !== item.href) {
                              window.location.href = item.href;
                            }
                          } catch (err) {}
                        }, 100);
                      } catch (err) {}
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Admin Icon */}
              {isAdmin && (
                <Link
                  href="/admin"
                  data-testid="link-admin"
                  aria-label="Admin"
                  className={`text-[11px] tracking-[0.22em] font-display uppercase font-semibold transition-colors duration-200 ${
                    location === "/admin" ? "text-primary" : "text-foreground/75 hover:text-primary"
                  }`}
                  aria-current={location === '/admin' ? 'page' : undefined}
                  data-active={location === '/admin' ? 'true' : 'false'}
                >
                  <Settings className="h-4 w-4 inline mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          {/* Actions Menu */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Search Button */}
            <button className="text-foreground/75 hover:text-primary p-2 transition-colors duration-200" aria-label="Pesquisar">
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Settings Button */}
            <button 
              onClick={() => setLocation('/settings')}
              className="text-foreground/75 hover:text-primary p-2 transition-colors duration-200" 
              aria-label="Configurações"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>

            {/* Language Selector BR */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[11px] font-display font-semibold text-foreground/75 hover:text-primary flex items-center gap-1 transition-colors duration-200 px-2 py-1 uppercase tracking-wider">
                  BR <span className="text-[9px] text-primary/70">▼</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#050a0f] border-primary/20">
                <DropdownMenuItem className="text-[11px] font-display tracking-wider text-primary cursor-pointer hover:bg-primary/10">
                  🇧🇷 PT-BR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Authentication / User Avatar */}
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded bg-muted" aria-hidden />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="h-6 w-6 border border-primary/20">
                      <AvatarImage src={(user as any)?.profileImageUrl || ''} alt={user?.firstName || user?.email || 'User'} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {(user?.firstName || user?.email || 'U')?.slice(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] uppercase tracking-wider font-display font-semibold">{user?.firstName || user?.email || 'Usuário'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#050a0f] border-primary/20">
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer w-full text-xs font-display tracking-wider hover:bg-primary/10">
                      <UserIcon className="h-4 w-4 mr-2 text-primary" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer w-full text-xs font-display tracking-wider hover:bg-primary/10">
                        <Settings className="h-4 w-4 mr-2 text-primary" />
                        Painel Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-primary/10" />
                  <DropdownMenuItem onSelect={async () => {
                    try { await fetch('/api/logout', { method: 'POST', credentials: 'include', headers: authHeaders() }); } catch {}
                    try { localStorage.removeItem('devToken'); } catch (e) {}
                    try { await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] }); } catch (e) {}
                    window.location.reload();
                  }} className="text-destructive cursor-pointer text-xs font-display tracking-wider hover:bg-destructive/10">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="bg-[#04080e] border border-primary/45 hover:border-primary text-primary hover:text-[#04080e] hover:bg-primary transition-all duration-300 rounded px-4 py-2 font-display text-[11px] uppercase tracking-widest font-semibold flex items-center gap-2"
              >
                <Link href="/login" data-testid="button-login">
                  Entrar <span className="text-[12px] font-bold">→</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile responsive toggle */}
          <div className="flex items-center md:hidden space-x-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary"
                aria-label="Admin"
                onClick={() => setLocation('/admin')}
                data-testid="button-mobile-admin"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary"
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
                  className={`nav-link block px-3 py-2 rounded-md font-medium transition-colors ${
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
                aria-label="Admin"
                className={`nav-link flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
                  location === "/admin"
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:text-primary hover:bg-muted"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Admin</span>
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
                    onClick={async (e) => {
                      e.preventDefault();
                      try { await fetch('/api/logout', { method: 'POST', credentials: 'include', headers: authHeaders() }); } catch (err) {}
                      try { localStorage.removeItem('devToken'); } catch (e) {}
                      try { await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] }); } catch (e) {}
                      window.location.reload();
                    }}
                    className="nav-link flex items-center px-3 py-2 rounded-md font-medium transition-colors text-foreground hover:text-primary hover:bg-muted cursor-pointer"
                    data-testid="mobile-button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </a>
                </>
              ) : (
                <a
                  href="/login"
                  className="flex items-center px-3 py-2 rounded-md font-medium transition-colors text-foreground hover:text-primary hover:bg-muted"
                  data-testid="mobile-button-login"
                  onClick={(e) => { e.preventDefault(); setLocation('/login'); }}
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
