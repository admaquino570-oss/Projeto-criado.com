import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { ContentRow } from '@/components/ContentRow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const [featuredContent, setFeaturedContent] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchContent();
    if (user) {
      fetchFavorites();
      fetchContinueWatching();
    }
  }, [user]);

  const fetchContent = async () => {
    const { data: featured } = await supabase
      .from('content')
      .select('*')
      .eq('is_featured', true)
      .limit(1)
      .single();
    setFeaturedContent(featured);

    const { data: moviesData } = await supabase
      .from('content')
      .select('*')
      .eq('type', 'movie')
      .order('created_at', { ascending: false });
    setMovies(moviesData || []);

    const { data: seriesData } = await supabase
      .from('content')
      .select('*')
      .eq('type', 'series')
      .order('created_at', { ascending: false });
    setSeries(seriesData || []);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('content_id')
      .eq('user_id', user.id);
    setFavorites(data?.map((f) => f.content_id) || []);
  };

  const fetchContinueWatching = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('watch_progress')
      .select('*, content(*)')
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('updated_at', { ascending: false })
      .limit(10);
    setContinueWatching(data?.map((p) => p.content).filter(Boolean) || []);
  };

  const toggleFavorite = async (contentId: string) => {
    if (!user) return;
    const isFavorite = favorites.includes(contentId);

    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('content_id', contentId);
      setFavorites((prev) => prev.filter((id) => id !== contentId));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, content_id: contentId });
      setFavorites((prev) => [...prev, contentId]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner content={featuredContent} />

      <div className="relative z-10 -mt-32 pb-20 space-y-8">
        {continueWatching.length > 0 && (
          <ContentRow
            title="Continuar Assistindo"
            contents={continueWatching}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {movies.length > 0 && (
          <ContentRow
            title="Filmes"
            contents={movies}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {series.length > 0 && (
          <ContentRow
            title="Séries"
            contents={series}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
