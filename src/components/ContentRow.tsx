import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCard } from './ContentCard';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Content {
  id: string;
  title: string;
  cover_url?: string;
  type: 'movie' | 'series';
  rating?: string;
  release_year?: number;
  duration?: number;
}

interface ContentRowProps {
  title: string;
  contents: Content[];
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

export const ContentRow = ({
  title,
  contents,
  favorites = [],
  onToggleFavorite,
  className,
}: ContentRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (contents.length === 0) return null;

  return (
    <div className={cn('relative group', className)}>
      <h2 className="text-xl md:text-2xl font-display mb-4 px-4 md:px-12">
        {title}
      </h2>

      <div className="relative">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full rounded-none bg-background/50 hover:bg-background/80 transition-opacity',
            showLeftArrow ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        {/* Content Scroll */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4"
        >
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              id={content.id}
              title={content.title}
              coverUrl={content.cover_url}
              type={content.type as 'movie' | 'series'}
              rating={content.rating}
              releaseYear={content.release_year}
              duration={content.duration}
              isFavorite={favorites.includes(content.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full rounded-none bg-background/50 hover:bg-background/80 transition-opacity',
            showRightArrow ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};
