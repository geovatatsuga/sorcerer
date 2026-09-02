import React, { useMemo, useState } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Wand2, Crown, Sparkles, BookOpen, Layers } from "lucide-react";
import type { CodexEntry } from "@shared/schema";
import { useLanguage } from '@/contexts/LanguageContext';

export default function Codex() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: codexEntries = [], isLoading } = useQuery<CodexEntry[]>({
    queryKey: ['/api/codex'],
  });

  const { t } = useLanguage();

  const categories = [
    { key: "all", label: "Todas", icon: Layers },
    { key: "magic", label: t.magic || "Magia", icon: Wand2 },
    { key: "creatures", label: t.creatures || "Criaturas", icon: Crown },
    { key: "items", label: "Itens & Relíquias", icon: Sparkles },
    { key: "other", label: "Mundo & Outros", icon: BookOpen },
  ];

  const filteredEntries = useMemo(() => {
    if (selectedCategory === "all") return codexEntries;
    return codexEntries.filter(e => {
      const cat = (e.category || '').toLowerCase();
      if (selectedCategory === "other") {
        return cat === "other" || (!["magic", "creatures", "items"].includes(cat));
      }
      return cat === selectedCategory;
    });
  }, [codexEntries, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "magic":
        return <Wand2 className="h-4 w-4 text-primary" />;
      case "creatures":
        return <Crown className="h-4 w-4 text-amber-400" />;
      case "items":
        return <Sparkles className="h-4 w-4 text-primary" />;
      default:
        return <BookOpen className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#02070d] text-foreground pl-0 xl:pl-[68px] overflow-x-hidden">
      <Navigation />
      
      <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100vh-56px)]">
        {/* Header Hero Banner */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[11px] tracking-[0.28em] font-sans font-bold text-primary uppercase block mb-2">
            Arquivo Arcano
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-wider text-foreground mb-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]" data-testid="text-codex-title">
            {t.codexPageTitle || 'O Códex'}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {t.codexPageDesc || 'Navegue pelas entradas do lore oficial sobre magia antiga, bestiário de criaturas, itens lendários e registros do reino.'}
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const active = selectedCategory === cat.key;
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ${
                  active
                    ? "bg-primary text-black shadow-[0_0_20px_rgba(216,170,92,0.5)] scale-105"
                    : "bg-[#060c16]/80 text-muted-foreground border border-primary/25 hover:border-primary hover:text-foreground hover:bg-primary/10 backdrop-blur-md"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? "text-black" : "text-primary/70"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Entries Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#060c16]/80 border border-primary/20 rounded-lg h-64 animate-pulse shadow-lg" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#060c16]/60 border border-primary/20 rounded-xl backdrop-blur-md max-w-lg mx-auto shadow-2xl">
            <BookOpen className="h-10 w-10 text-primary/50 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-foreground mb-1">Nenhuma entrada encontrada</h3>
            <p className="text-muted-foreground text-sm">
              {selectedCategory === "all" ? "O Códex ainda não possui registros cadastrados." : "Sem registros disponíveis para esta categoria no momento."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/codex/${entry.id}`}
                className="group relative flex flex-col justify-between bg-[#060c16]/80 border border-primary/35 rounded-xl overflow-hidden backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-primary hover:shadow-[0_0_24px_rgba(216,170,92,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {/* Optional Cover Image */}
                {entry.imageUrl ? (
                  <div className="relative w-full h-44 overflow-hidden bg-black/50 border-b border-primary/20">
                    <img
                      src={entry.imageUrl}
                      alt={entry.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060c16] via-transparent to-transparent opacity-90" />
                  </div>
                ) : (
                  <div className="h-3 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                )}

                {/* Content body */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-full border border-primary/40 bg-primary/15 flex items-center justify-center">
                        {getCategoryIcon(entry.category || 'other')}
                      </div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-primary/80">
                        {entry.category === 'magic' ? 'Magia' : entry.category === 'creatures' ? 'Criatura' : entry.category === 'items' ? 'Item' : 'Registro'}
                      </span>
                    </div>

                    <h2 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                      {entry.title}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                      {entry.description || "Nenhuma descrição detalhada disponível."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-primary/15 flex items-center justify-between text-[12px] text-primary/80 font-semibold tracking-wider uppercase group-hover:text-primary transition-colors">
                    <span>Ler registro</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
