import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeroBannerProps {
  content?: {
    id: string;
    title: string;
    description?: string;
    cover_url?: string;
    type: string;
  };
}

export const HeroBanner = ({ content }: HeroBannerProps) => {
  const navigate = useNavigate();

  if (!content) {
    return (
      <div className="relative h-[70vh] md:h-[85vh] bg-gradient-to-b from-muted to-background flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-display mb-4">Bem-vindo ao STREAMIX</h1>
          <p className="text-muted-foreground text-lg">
            Adicione conteúdo para começar a assistir
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      {/* Background Image */}
      {content.cover_url ? (
        <img
          src={content.cover_url}
          alt={content.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 side-gradient" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-12">
          <div className="max-w-2xl animate-slide-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display mb-4 drop-shadow-lg">
              {content.title}
            </h1>
            {content.description && (
              <p className="text-sm md:text-lg text-foreground/90 line-clamp-3 mb-6 drop-shadow">
                {content.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 font-semibold"
                onClick={() => navigate(`/watch/${content.id}`)}
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                Assistir
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold"
                onClick={() => navigate(`/content/${content.id}`)}
              >
                <Info className="mr-2 h-5 w-5" />
                Mais Informações
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
