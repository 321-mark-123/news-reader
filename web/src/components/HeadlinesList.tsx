import React from 'react';
import { Article } from '../lib/newsapi';

interface HeadlinesListProps {
  article: Article;
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
  totalIndex: number; // 0, 1, 2...
  isFavorite: boolean;
  toggleFavorite: () => void;
  page: number;
  limit: number;
}

export const HeadlinesList: React.FC<HeadlinesListProps> = ({
  article,
  onNext,
  onPrev,
  canNext,
  canPrev,
  totalIndex,
  isFavorite,
  toggleFavorite,
  page,
  limit
}) => {
  if (!article) return null;

  const bgImage = article.image_url || '/placeholder.png'; // Fallback

  return (
    <div className="article-card">
      <div 
        className="article-image" 
        style={{ backgroundImage: `url(${bgImage})` }}
        role="img"
        aria-label={article.title}
      />
      
      <div className="article-overlay">
        <h2 className="article-title">{article.title}</h2>
        <p className="article-desc">{article.description}</p>
        
        <div className="article-actions">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
          >
            Read Full Article
          </a>
          <button 
            className={`btn btn-fav ${isFavorite ? 'is-fav' : ''}`} 
            onClick={toggleFavorite}
          >
            {isFavorite ? '♥ Saved' : '♡ Save'}
          </button>
        </div>
      </div>

      <div className="pager">
        <button 
          className="pager-btn" 
          onClick={onPrev} 
          disabled={!canPrev && page === 1 && totalIndex === 0} 
          title="Previous"
        >
          ‹
        </button>
        
        <div className="pager-dots">
             {[0, 1, 2].map(i => {
                // Calculate absolute item number: (page - 1) * limit + (i + 1)
                const absNum = ((page - 1) * limit) + i + 1;
                return (
                    <div 
                      key={i} 
                      className={`dot ${totalIndex === i ? 'active' : ''}`}
                      title={`Article ${absNum}`}
                    />
                )
             })}
        </div>
        
        <button 
          className="pager-btn" 
          onClick={onNext} 
          disabled={!canNext} 
          title="Next"
        >
          ›
        </button>
        
        <div style={{ marginLeft: '1rem', color: '#aaa', fontSize: '0.8rem' }}>
          Page {page}
        </div>
      </div>
    </div>
  );
};
