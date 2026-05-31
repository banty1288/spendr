import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Newspaper, Lightbulb, TrendingUp, RefreshCw, AlertCircle, TrendingDown, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useDailyHubContent } from "../../hooks/useDailyHubContent";
import { PageShell } from "../components/ui/PageShell";

export function Daily() {
  const { t } = useTranslation();
  const { data, isLoading, isFetching, isError, refresh } = useDailyHubContent();

  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <PageShell orbs={[{ color: "var(--primary)", position: "top-left" }, { color: "var(--accent)", position: "bottom-right" }]}>
      <div className="min-h-[100dvh] pb-safe-nav bg-background px-4 md:px-8 lg:px-12 pt-12 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-black text-foreground">Daily Hub</h1>
            <p className="text-muted-foreground mt-1 font-medium text-sm">
              {format(new Date(), "EEEE, MMMM do")}
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isRefreshing || isLoading ? "animate-spin" : ""} />
          </button>
        </motion.div>

        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-center gap-3 mb-6">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">Failed to load today's insights. Please try again.</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading && !data ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Top skeleton tip */}
              <div className="h-32 bg-card/50 rounded-3xl animate-pulse" />
              {/* Market skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-card/50 rounded-2xl animate-pulse" />)}
              </div>
              {/* News skeleton */}
              <div className="space-y-3">
                <div className="h-6 w-32 bg-card/50 rounded animate-pulse" />
                {[1,2,3].map(i => <div key={i} className="h-24 bg-card/50 rounded-2xl animate-pulse" />)}
              </div>
            </motion.div>
          ) : data ? (
            <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
              
              {/* AI Money Tip */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-3xl p-6 relative overflow-hidden shadow-lg group">
                <div className="absolute -top-10 -right-10 text-primary opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <Sparkles size={120} />
                </div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-primary" />
                  Your Smart Suggestion
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium relative z-10">
                  {data.aiMoneyTip}
                </p>
              </div>

              {/* Market Snapshot */}
              {data.market && data.market.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <TrendingUp size={16} /> Market Snapshot
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {data.market.map((m, idx) => (
                      <div key={idx} className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                        <p className="text-xs text-muted-foreground font-semibold mb-2">{m.label}</p>
                        <div className="flex items-end justify-between">
                          <p className="text-sm font-black text-foreground">{m.value}</p>
                          <div className={`flex items-center text-[10px] font-bold ${m.trend === 'up' ? 'text-primary' : m.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {m.trend === 'up' ? <TrendingUp size={12} className="mr-0.5" /> : m.trend === 'down' ? <TrendingDown size={12} className="mr-0.5" /> : <Minus size={12} className="mr-0.5" />}
                            {m.percentChange}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saving Tip */}
              <div className="bg-card border border-border rounded-3xl p-5 flex items-start gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                <div className="bg-accent/10 p-3 rounded-2xl text-accent shrink-0">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">Today's Saving Tip</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{data.savingTip}</p>
                </div>
              </div>

              {/* Financial News */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                  <Newspaper size={16} /> Latest Financial News
                </h3>
                <div className="space-y-3">
                  {data.news.map((item, idx) => (
                    <motion.a
                      href={item.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      className="block bg-card border border-border p-4 rounded-2xl shadow-sm hover:border-primary/50 transition-colors"
                    >
                      <h4 className="text-sm font-bold text-foreground leading-snug mb-2">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        <span>{item.source}</span>
                        <span>{item.time}</span>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                  <TrendingUp size={16} /> Trending Topics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.trendingTopics.map((topic, idx) => (
                    <div key={idx} className="bg-card/50 border border-border/50 p-4 rounded-2xl hover:bg-card transition-colors">
                      <h4 className="text-sm font-bold text-foreground mb-1">#{topic.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{topic.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}
