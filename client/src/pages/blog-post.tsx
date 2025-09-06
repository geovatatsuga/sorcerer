import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import type { BlogPost } from '@shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BlogPostProfile() {
  const params = useParams() as Record<string, string | undefined>;
  const slug = params.slug as string | undefined;
  const { t } = useLanguage();
  const { data: post } = useQuery<BlogPost | null>({ 
    queryKey: ['/api/blog', slug], 
    queryFn: async () => {
      if (!slug) return null;
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) return null;
      return res.json();
    }
  });

  // Translation disabled: always use primary fields
  const title = post?.title ?? null;
  const content = post?.content ?? null;
  const excerpt = post?.excerpt ?? null;

  const timeAgo = (date: Date | string) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - publishedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 dia atrás";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 14) return "1 semana atrás";
    if (diffDays < 21) return "2 semanas atrás";
    return "3 semanas atrás";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "update":
        return "bg-primary/20 text-primary";
      case "world-building":
        return "bg-accent/20 text-accent";
      case "behind-scenes":
        return "bg-secondary/20 text-secondary-foreground";
      case "research":
        return "bg-muted/20 text-muted-foreground";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "update":
        return "Atualização";
      case "world-building":
        return "Construção de Mundo";
      case "behind-scenes":
        return "Bastidores";
      case "research":
        return "Pesquisa";
      default:
        return category;
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="p-8 text-center">Post do blog não encontrado</CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {post.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={title ?? post.title} 
              className="w-full h-64 object-cover" 
            />
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
              {getCategoryName(post.category)}
            </span>
            <span className="text-muted-foreground text-sm">
              {timeAgo(post.publishedAt)}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{title ?? post.title}</h1>
          {excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content ?? post.content }} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Informações do Post</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria:</span>
                <span className="capitalize">{getCategoryName(post.category)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Publicado em:</span>
                <span>{new Date(post.publishedAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug:</span>
                <span className="font-mono text-sm">{post.slug}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button asChild>
            <a href="/blog">← Voltar ao Blog</a>
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
