import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewsletterSignup() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeToNewsletter = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/newsletter", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive notifications about new chapters and exclusive content.",
      });
      setEmail("");
    },
    onError: () => {
      toast({
        title: "Subscription failed",
        description: "Please check your email address and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      subscribeToNewsletter.mutate(email);
    } else {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-secondary/20 to-accent/20 border border-border rounded-xl p-12">
          <h2 className="font-display text-3xl font-bold text-primary mb-4" data-testid="text-newsletter-title">
            {t.joinTheJourney || 'Junte-se à jornada'}
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            {t.joinTheJourneyDesc || 'Assine para receber notificações quando novos capítulos forem publicados e conteúdo exclusivo dos bastidores.'}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t.enterYourEmail || 'Digite seu e-mail'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
              data-testid="input-email"
            />
            <Button 
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-3 font-semibold hover-glow"
              disabled={subscribeToNewsletter.isPending}
              data-testid="button-subscribe"
            >
              {subscribeToNewsletter.isPending ? (t.subscribing || 'Subscribing...') : (t.subscribe || 'Subscribe')}
            </Button>
          </form>
          <p className="text-muted-foreground text-sm mt-4">{t.noSpam || 'Sem spam, apenas conteúdo épico de fantasia.'}</p>
        </div>
      </div>
    </section>
  );
}
