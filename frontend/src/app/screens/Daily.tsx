import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Newspaper, Lightbulb, TrendingUp, RefreshCw, AlertCircle, TrendingDown, Minus, ChevronDown, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useDailyHubContent } from "../../hooks/useDailyHubContent";
import { PageShell } from "../components/ui/PageShell";
import { ReelSlide } from "../components/daily/ReelSlide";

export function Daily() {
  const { t } = useTranslation();
  const { data, isLoading, isFetching, isError, refresh } = useDailyHubContent();

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    await refresh();
  };

  const slides = [];

  if (data) {
    // 1. Welcome & Market Slide
    slides.push(
      <ReelSlide key="market" bgGradient="bg-gradient-to-br from-primary/30 to-background">
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-2">Daily Hub</h1>
            <p className="text-muted-foreground font-medium text-lg">
              {format(new Date(), "EEEE, MMMM do")}
            </p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-md border border-border p-6 rounded-3xl shadow-xl">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <TrendingUp size={16} /> Market Snapshot
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {data.market?.map((m, idx) => (
                <div key={idx} className="bg-background/50 p-4 rounded-2xl flex flex-col justify-between">
                  <p className="text-xs text-muted-foreground font-semibold mb-2">{m.label}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-lg font-black text-foreground">{m.value}</p>
                    <div className={`flex items-center text-xs font-bold ${m.trend === 'up' ? 'text-primary' : m.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {m.trend === 'up' ? <TrendingUp size={14} className="mr-0.5" /> : m.trend === 'down' ? <TrendingDown size={14} className="mr-0.5" /> : <Minus size={14} className="mr-0.5" />}
                      {m.percentChange}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center animate-bounce pt-8">
            <div className="bg-background/50 backdrop-blur text-muted-foreground p-3 rounded-full border border-border">
              <ChevronDown size={24} />
            </div>
          </div>
        </div>
      </ReelSlide>
    );

    // Combine News and Tips so we alternate between them
    let newsIndex = 0;

    // 2. First News
    if (data.news && data.news[newsIndex]) {
      const item = data.news[newsIndex];
      slides.push(
        <ReelSlide key={`news-${newsIndex}`} bgGradient="bg-gradient-to-tr from-accent/20 via-background to-card">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Newspaper size={16} /> Breaking News
            </div>
            <h2 className="text-3xl font-black text-foreground leading-tight">{item.title}</h2>
            {item.description && (
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">{item.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground pt-4">
              <span>{item.source}</span>
              <span>•</span>
              <span>{item.time}</span>
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                Read Full Article <ExternalLink size={18} />
              </a>
            )}
          </div>
        </ReelSlide>
      );
      newsIndex++;
    }

    // 3. AI Money Tip
    if (data.aiMoneyTip) {
      slides.push(
        <ReelSlide key="aiTip" bgGradient="bg-gradient-to-bl from-primary/30 via-background to-background">
          <div className="relative z-10 space-y-6">
            <div className="absolute -top-20 -right-10 text-primary opacity-20">
              <Sparkles size={180} />
            </div>
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={16} /> Smart Suggestion
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight drop-shadow-md">
              {data.aiMoneyTip}
            </h2>
          </div>
        </ReelSlide>
      );
    }

    // 4. Second News
    if (data.news && data.news[newsIndex]) {
      const item = data.news[newsIndex];
      slides.push(
        <ReelSlide key={`news-${newsIndex}`} bgGradient="bg-gradient-to-br from-card via-background to-accent/20">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Newspaper size={16} /> Top Story
            </div>
            <h2 className="text-3xl font-black text-foreground leading-tight">{item.title}</h2>
            {item.description && (
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">{item.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground pt-4">
              <span>{item.source}</span>
              <span>•</span>
              <span>{item.time}</span>
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                Read Full Article <ExternalLink size={18} />
              </a>
            )}
          </div>
        </ReelSlide>
      );
      newsIndex++;
    }

    // 5. Saving Tip
    if (data.savingTip) {
      slides.push(
        <ReelSlide key="savingTip" bgGradient="bg-gradient-to-tr from-green-500/20 via-background to-background">
          <div className="relative z-10 space-y-6">
            <div className="absolute -top-16 -left-10 text-green-500 opacity-20">
              <Lightbulb size={150} />
            </div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Lightbulb size={16} /> Today's Saving Tip
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground leading-tight drop-shadow-md">
              {data.savingTip}
            </h2>
          </div>
        </ReelSlide>
      );
    }

    // 6. Remaining News
    while (data.news && newsIndex < data.news.length) {
      const item = data.news[newsIndex];
      slides.push(
        <ReelSlide key={`news-${newsIndex}`} bgGradient="bg-gradient-to-r from-background via-card to-background">
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <Newspaper size={16} /> Financial News
            </div>
            <h2 className="text-3xl font-black text-foreground leading-tight">{item.title}</h2>
            {item.description && (
              <p className="text-lg text-muted-foreground font-medium leading-relaxed">{item.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground pt-4">
              <span>{item.source}</span>
              <span>•</span>
              <span>{item.time}</span>
            </div>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                Read Full Article <ExternalLink size={18} />
              </a>
            )}
          </div>
        </ReelSlide>
      );
      newsIndex++;
    }
    
    // 7. Trending Topics
    if (data.trendingTopics && data.trendingTopics.length > 0) {
      slides.push(
        <ReelSlide key="trending" bgGradient="bg-gradient-to-b from-background to-primary/20">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <TrendingUp size={16} /> Trending Topics
            </div>
            <div className="space-y-4">
              {data.trendingTopics.map((topic, idx) => (
                <div key={idx} className="bg-card/60 backdrop-blur-sm border border-border/50 p-5 rounded-2xl">
                  <h4 className="text-lg font-black text-foreground mb-1">#{topic.title}</h4>
                  <p className="text-sm text-muted-foreground font-medium">{topic.description}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm font-bold text-muted-foreground pt-8 pb-12">
              You're all caught up for today!
            </p>
          </div>
        </ReelSlide>
      );
    }
  }

  return (
    <PageShell className="h-[100dvh] overflow-hidden !pb-0">
      <div className="fixed inset-0 bg-background flex flex-col pointer-events-none">
        {/* We need a wrapper that allows scrolling but prevents standard page layout overlapping */}
      </div>

      <button 
        onClick={handleRefresh}
        disabled={isRefreshing || isLoading}
        className="fixed top-safe-top right-4 md:right-8 lg:right-12 mt-4 z-50 w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground hover:text-primary transition-colors disabled:opacity-50 shadow-lg"
      >
        <RefreshCw size={20} className={isRefreshing || isLoading ? "animate-spin" : ""} />
      </button>

      {isError && (
        <div className="fixed top-safe-top left-1/2 -translate-x-1/2 mt-4 z-50 bg-destructive/90 backdrop-blur text-destructive-foreground px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">Failed to load insights. Please try again.</p>
        </div>
      )}

      {isLoading && !data ? (
        <div className="h-[100dvh] w-full flex items-center justify-center bg-background">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-lg font-bold text-muted-foreground animate-pulse">Curating your daily feed...</p>
          </motion.div>
        </div>
      ) : (
        <div className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar relative z-10 pb-16">
          {slides}
        </div>
      )}
    </PageShell>
  );
}
