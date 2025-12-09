// src/lib/newsapi.ts
export interface Article {
  uuid: string;
  title: string;
  description: string;
  keywords: string;
  snippet: string;
  url: string;
  image_url: string;
  language: string;
  published_at: string;
  source: string;
  categories: string[];
}

export interface NewsResponse {
  meta: {
    found: number;
    returned: number;
    limit: number;
    page: number;
  };
  data: Article[];
}

const CACHE_KEY_PREFIX = 'news_cache_';

// Simple in-memory cache for the session
const memoryCache = new Map<string, NewsResponse>();

export async function fetchNews(page: number, categories?: string, search?: string): Promise<NewsResponse> {
  // Construct a cache key
  const queryKey = search ? `search:${search}` : `cat:${categories || 'tech'}`;
  const cacheKey = `${CACHE_KEY_PREFIX}${queryKey}_p${page}`;

  if (memoryCache.has(cacheKey)) {
    console.log(`[Cache Hit] ${cacheKey}`);
    return memoryCache.get(cacheKey)!;
  }

  const params = new URLSearchParams({
    page: page.toString(),
    limit: '3',
  });

  if (search) {
    params.set('search', search);
  } else if (categories) {
    // If multiple categories are needed, they should be comma separated.
    // The prompt says "Categories: tech (default), ..." which implies single selection or multi?
    // "Categories:... Categories vs Search Rule... "
    // We'll assume the UI passes a single string or comma-separated string.
    params.set('categories', categories);
  } else {
    params.set('categories', 'tech');
  }

  try {
    const res = await fetch(`/api/news/all?${params.toString()}`);

    if (!res.ok) {
      // Parse error body if possible
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `API Error: ${res.status}`);
    }

    const data: NewsResponse = await res.json();

    // Cache the successful result
    memoryCache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
