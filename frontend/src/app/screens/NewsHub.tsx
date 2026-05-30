import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Share2, ArrowLeft, ExternalLink, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { useNews } from "../../hooks/useNews";
import { FeedItem } from "../../types/news";
import { shareContent } from "../../services/share/shareService";
import { formatRelativeTime } from "../../lib/transactions/format";
import { PageShell } from "../components/ui/PageShell";

export function NewsHub() {
  const navigate = useNavigate();
  const { data: feed, isLoading, toggleLike, checkLike } = useNews();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <PageShell>
      <div className="absolute inset-0 z-50 pointer-events-none p-6 pt-12 flex justify-between items-start">
        <button 
          onClick={() => navigate(-1)}
          className="pointer-events-auto p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="pointer-events-auto bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm tracking-widest uppercase">
          Spendr Daily
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
          <p className="text-white/60 font-medium animate-pulse">Loading feed...</p>
        </div>
      ) : (
        <div 
          ref={containerRef}
          className="w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black relative"
          style={{ scrollBehavior: 'smooth' }}
        >
          {feed?.map((item, index) => (
            <FeedCard 
              key={item.id} 
              item={item} 
              toggleLike={toggleLike} 
              checkLike={checkLike} 
            />
          ))}
          {(!feed || feed.length === 0) && (
            <div className="w-full h-[100dvh] flex items-center justify-center text-white/40">
              No news available.
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}

function FeedCard({ 
  item, 
  toggleLike, 
  checkLike 
}: { 
  item: FeedItem, 
  toggleLike: any, 
  checkLike: any 
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    checkLike(item.id).then((liked: boolean) => setIsLiked(liked));
  }, [item.id, checkLike]);

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toggleLike({ itemId: item.id, type: item.type });
  };

  const handleShare = async () => {
    await shareContent({
      title: item.title,
      text: item.description,
      url: item.url || window.location.href,
    });
  };

  return (
    <div 
      className="w-full h-[100dvh] snap-start snap-always relative overflow-hidden flex items-center justify-center bg-black"
      onDoubleClick={handleDoubleTap}
    >
      {/* Background Image / Overlay */}
      {item.imageUrl ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-110"
            style={{ backgroundImage: `url(${item.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-black to-purple-900/40" />
      )}

      {/* Main Content Area */}
      <div className="absolute inset-x-0 bottom-[120px] p-6 z-10 flex gap-4 items-end">
        
        {/* Text Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
              item.type === 'tip' ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-[#00d9ff]/20 text-[#00d9ff]'
            }`}>
              {item.type === 'tip' ? 'Financial Tip' : 'News'}
            </span>
            <span className="text-white/60 text-xs">
              {item.source || "Spendr AI"} • {formatRelativeTime(item.publishedAt)}
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-md leading-tight">
            {item.title}
          </h2>
          
          <p className="text-white/80 text-sm line-clamp-3 mb-4 drop-shadow">
            {item.description}
          </p>

          {item.url && (
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-white text-sm font-medium transition-colors backdrop-blur-md"
            >
              Read full article <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Action Buttons (Right side vertical) */}
        <div className="flex flex-col gap-6 items-center shrink-0 mb-4">
          <button 
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`p-3 rounded-full backdrop-blur-md transition-colors ${
              isLiked ? 'bg-red-500/20' : 'bg-white/10 group-hover:bg-white/20'
            }`}>
              <Heart 
                size={28} 
                className={isLiked ? "fill-red-500 text-red-500" : "text-white"} 
              />
            </div>
            <span className="text-white text-xs font-bold drop-shadow">{item.likesCount + (isLiked ? 1 : 0)}</span>
          </button>

          <button 
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 backdrop-blur-md transition-colors">
              <Share2 size={28} className="text-white" />
            </div>
            <span className="text-white text-xs font-bold drop-shadow">Share</span>
          </button>

          {item.type === 'tip' && (
            <div className="flex flex-col items-center gap-1">
              <div className="p-3 rounded-full bg-gradient-to-br from-[#ffd60a] to-[#ff9500] shadow-[0_0_15px_rgba(255,214,10,0.5)]">
                <Zap size={28} className="text-black" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -15 }}
            animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute z-50 pointer-events-none"
          >
            <Heart size={120} className="fill-red-500 text-red-500 drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
