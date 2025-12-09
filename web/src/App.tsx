import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchNews, Article, NewsResponse } from './lib/newsapi';
import { HeadlinesList } from './components/HeadlinesList';

const CATEGORIES = [
  'tech', 'general', 'science', 'sports', 'business', 
  'health', 'entertainment', 'politics', 'food', 'travel'
];

function App() {
  // State
  const [category, setCategory] = useState<string>('tech');
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState<number>(1);
  const [articleIndex, setArticleIndex] = useState<number>(0); // 0, 1, 2 on current page
  
  const [favorites, setFavorites] = useState<Article[]>(() => {
    const saved = localStorage.getItem('news_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('news_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Data Fetching
  const loadData = useCallback(async (pageNum: number, cat: string, query: string) => {
    // If showing favorites, do nothing
    if (showFavorites) return;

    try {
      const data = await fetchNews(pageNum, cat, query);
      return data.data;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, [showFavorites]);

  // Initial Load / Reset
  useEffect(() => {
    if (showFavorites) return;

    // Reset logic when context changes
    setLoading(true);
    setError(null);
    setArticles([]);
    setPage(1);
    setArticleIndex(0);

    const doFetch = async () => {
      const data = await loadData(1, category, search);
      if (data) setArticles(data);
      setLoading(false);
    };

    doFetch();
  }, [category, search, showFavorites]);

  // Prefetching Effect
  useEffect(() => {
    if (showFavorites) return;
    
    // Check if we need to prefetch NEXT page
    // Trigger when we hit index 1 (2nd item)
    if (articleIndex === 1) {
       // Prefetch page + 1
       fetchNews(page + 1, category, search);
    }
    
    // Prefetch PREV page if page > 1 and index is 0
    if (page > 1 && articleIndex === 0) {
      fetchNews(page - 1, category, search);
    }
  }, [articleIndex, page, category, search, showFavorites]);


  // Navigation Handlers
  const handleNext = async () => {
    if (showFavorites) {
        if (articleIndex < favorites.length - 1) {
            setArticleIndex(prev => prev + 1);
        }
        return;
    }

    if (articleIndex < articles.length - 1) {
      // Just move to next card in memory
      setArticleIndex(prev => prev + 1);
    } else {
      // Need next page
      setLoading(true); // Short loading state? Or seamless?
      // "Instant swap to prefetched page (no flashing old content)"
      // Ideally we already have it in cache.
      try {
        const nextPage = page + 1;
        const nextData = await loadData(nextPage, category, search);
        
        if (nextData && nextData.length > 0) {
          setArticles(nextData);
          setPage(nextPage);
          setArticleIndex(0);
        } else {
            // End of stream
            console.log("No more articles");
        }
      } catch (err) { }
      setLoading(false);
    }
  };

  const handlePrev = async () => {
    if (showFavorites) {
        if (articleIndex > 0) {
            setArticleIndex(prev => prev - 1);
        }
        return;
    }

    if (articleIndex > 0) {
      setArticleIndex(prev => prev - 1);
    } else if (page > 1) {
      // Go to previous page
      setLoading(true);
      const prevPage = page - 1;
      const prevData = await loadData(prevPage, category, search);
      if (prevData && prevData.length > 0) {
         setArticles(prevData);
         setPage(prevPage);
         setArticleIndex(prevData.length - 1); // Go to last item of prev page
      }
      setLoading(false);
    }
  };

  const toggleFavorite = (article: Article) => {
    const exists = favorites.find(f => f.uuid === article.uuid);
    if (exists) {
      setFavorites(prev => prev.filter(f => f.uuid !== article.uuid));
    } else {
      setFavorites(prev => [...prev, article]);
    }
  };

  const handleSearchCommit = (e: React.KeyboardEvent | React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
      if (searchInput) setCategory(''); // clear category logic
      setShowFavorites(false);
      setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleCategoryClick = (cat: string) => {
      setCategory(cat);
      setSearch(''); // clear search
      setSearchInput('');
      setShowFavorites(false);
      setSidebarOpen(false);
  };

  // Derived State
  const currentList = showFavorites ? favorites : articles;
  const currentArticle = currentList[articleIndex];
  const isCurrentFav = currentArticle && favorites.some(f => f.uuid === currentArticle.uuid);

  const canNext = showFavorites 
    ? articleIndex < favorites.length - 1 
    : (true /* Infinite scroll essentially, unless empty */); 
  
  const canPrev = showFavorites
    ? articleIndex > 0
    : (page > 1 || articleIndex > 0);

  return (
    <div className="app-container">
        {/* Mobile Toggle */}
        <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '✕' : '☰ Filter'}
        </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">FlipNews</div>
        
        <form onSubmit={handleSearchCommit}>
            <input 
            type="text" 
            className="search-input" 
            placeholder="Search news..." 
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            />
        </form>

        <div className="category-list">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`category-btn ${!search && category === cat && !showFavorites ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button 
            className={`favorites-toggle-view ${showFavorites ? 'active' : ''}`}
            onClick={() => {
                setShowFavorites(!showFavorites);
                setSidebarOpen(false);
                setArticleIndex(0);
            }}
        >
            {showFavorites ? '← Back to News' : '♥ Favorites'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {error && (
            <div className="error-message">
                <h3>Oops!</h3>
                <p>{error}</p>
                <button className="btn btn-secondary" onClick={() => window.location.reload()}>Retry</button>
            </div>
        )}

        {loading && !error && (
            <div className="loading-skeleton">
                Loading...
            </div>
        )}

        {!loading && !error && !currentArticle && (
            <div className="loading-skeleton">
                {showFavorites ? "No favorites saved yet." : "No articles found."}
            </div>
        )}

        {!loading && currentArticle && (
            <HeadlinesList 
                article={currentArticle}
                onNext={handleNext}
                onPrev={handlePrev}
                canNext={canNext}
                canPrev={canPrev}
                totalIndex={articleIndex}
                isFavorite={!!isCurrentFav}
                toggleFavorite={() => toggleFavorite(currentArticle)}
                page={page}
                limit={3}
            />
        )}
      </main>
    </div>
  );
}

export default App;
