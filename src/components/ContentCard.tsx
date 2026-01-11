import { Play, Plus, ThumbsUp, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ContentCardProps {
  id: string;
  title: string;
  coverUrl?: string;
  type: 'movie' | 'series';
  rating?: string;
  releaseYear?: number;
  duration?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

export const ContentCard = ({
  id,
  title,
  coverUrl,
  type,
  rating,
  releaseYear,
  duration,
  isFavorite = false,
  onToggleFavorite,
  className,
}: ContentCardProps) => {
  const navigate = useNavigate();

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${id}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(id);
  };

  return (
    <div
      className={cn(
        'content-card group relative aspect-[2/3] min-w-[150px] md:min-w-[200px]',
        className
      )}
      onClick={() => navigate(`/content/${id}`)}
    >
      {/* Cover Image */}
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover rounded-md"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Sem capa</span>
        </div>
      )}

      {/* Overlay */}
      <div className="card-overlay rounded-md p-3 flex flex-col justify-end">
        <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-2">{title}</h3>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mb-2">
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/90"
            onClick={handlePlay}
          >
            <Play className="h-4 w-4 fill-current" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full border-foreground/50"
            onClick={handleToggleFavorite}
          >
            {isFavorite ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full border-foreground/50"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {rating && (
            <span className="text-green-500 font-medium">{rating}</span>
          )}
          {releaseYear && <span>{releaseYear}</span>}
          {duration && <span>{formatDuration(duration)}</span>}
          <span className="capitalize text-foreground/70">{type === 'movie' ? 'Filme' : 'Série'}</span>
        </div>
      </div>
    </div>
  );
};
