import { useState, useMemo, useEffect } from "react";
import { useListQuestions, useGetBookmarks, useAddBookmark, useRemoveBookmark, customFetch, getGetBookmarksQueryKey } from "@roadify/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ChevronDown, CheckCircle2, ArrowLeft, Info, WifiOff, Sparkles, Trophy as TrophyIcon, Share2, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch } from "wouter";
import { getOfflineQuestions, syncOfflineData, getOfflineSigns } from "@/lib/offline";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { speak, stopSpeaking, prepareTextForSpeech } from "@/lib/voice";
import { useQueryClient } from "@tanstack/react-query";

export default function Questions() {
  const queryClient = useQueryClient();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const isDaily = searchParams.get("daily") === "true";

  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const { toast } = useToast();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showDailyResult, setShowDailyResult] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  const toggleVoice = (q: any) => {
    if (speakingId === q.id) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      stopSpeaking();
      const speechText = prepareTextForSpeech(q.text, q.options);
      speak(speechText);
      setSpeakingId(q.id);
    }
  };

  const { data: onlineQuestions, isLoading, error, refetch } = useListQuestions({
    category: category !== "all" ? category : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
    limit: 100, // Reduced from 500 to prevent DB timeouts
  }, { query: { retry: false } as any });

  const questions = useMemo(() => {
    const local = getOfflineQuestions() as any[];

    // 1. If we have online data, use it
    if (onlineQuestions && onlineQuestions.length > 0) return onlineQuestions;

    // 2. If we are loading but have local data, use local data to prevent empty screen
    if (isLoading && local.length > 0) return local;

    // 3. If offline or error, use local data
    if (!navigator.onLine || error) {
      if (!local.length) return [];

      return local.filter(q => {
        const matchesCategory = category === "all" || q.category.toLowerCase().includes(category.toLowerCase());
        const matchesDifficulty = difficulty === "all" || q.difficulty === difficulty;
        return matchesCategory && matchesDifficulty;
      });
    }

    return onlineQuestions || [];
  }, [onlineQuestions, error, isLoading, category, difficulty]);

  // Update offline cache if we got new online data
  useEffect(() => {
    if (onlineQuestions && onlineQuestions.length > 0) {
      syncOfflineData(onlineQuestions, getOfflineSigns());
    }
  }, [onlineQuestions]);

  const { data: bookmarks } = useGetBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const bookmarkedIds = new Set(bookmarks?.map(q => q.id) || []);

  const dailyQuestion = useMemo(() => {
    if (!isDaily || !questions.length) return null;

    // Deterministic selection based on date (YYYYMMDD)
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = dateSeed % questions.length;
    return questions[index];
  }, [isDaily, questions]);

  const handleDailySubmit = async (idx: number) => {
    if (showDailyResult) return;
    setSelectedAnswer(idx);
    setShowDailyResult(true);

    if (idx === dailyQuestion?.correctAnswer) {
      // Award XP via API
      try {
        await customFetch(`/api/progress/daily-challenge/complete`, {
          method: "POST",
        });

        toast({
          title: "Daily Challenge Complete!",
          description: "You've earned +50 XP bonus for today's correct answer.",
        });
      } catch (e) {
        console.error("Failed to award daily XP", e);
      }
    } else {
      toast({
        title: "Not quite!",
        description: "Review the explanation below to master this topic.",
        variant: "destructive"
      });
    }
  };

  const handleBookmarkToggle = (questionId: number) => {
    if (bookmarkedIds.has(questionId)) {
      removeBookmark.mutate(
        { questionId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetBookmarksQueryKey() });
            toast({ title: "Removed from bookmarks" });
          }
        }
      );
    } else {
      addBookmark.mutate(
        { data: { questionId } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetBookmarksQueryKey() });
            toast({ title: "Added to bookmarks" });
          }
        }
      );
    }
  };

  if (isDaily && dailyQuestion) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 pb-24">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight">Question of the Day</h1>
        </div>

        <Card className="border-0 shadow-2xl ring-1 ring-border overflow-hidden bg-gradient-to-b from-card to-muted/20">
          <div className="h-2 bg-primary w-full" />
          <CardContent className="p-6 md:p-10 space-y-8">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="uppercase font-black tracking-widest text-[10px]">
                {dailyQuestion.category}
              </Badge>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 gap-2 font-black uppercase text-[10px] tracking-widest rounded-full", speakingId === dailyQuestion.id ? "bg-primary/10 text-primary" : "text-slate-400")}
                  onClick={() => toggleVoice(dailyQuestion)}
                >
                  {speakingId === dailyQuestion.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {speakingId === dailyQuestion.id ? "Stop" : "Narrate"}
                </Button>
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>

            <h2 className="text-lg md:text-xl font-bold leading-tight text-slate-900">
              {dailyQuestion.text}
            </h2>

            {dailyQuestion.imageUrl && (
               <div className="rounded-2xl border bg-white p-4 shadow-inner overflow-hidden">
                 <img src={dailyQuestion.imageUrl} className="max-h-64 mx-auto object-contain" />
               </div>
            )}

            <div className="space-y-3">
              {(dailyQuestion as any).options.map((opt: string, idx: number) => {
                const isCorrect = idx === dailyQuestion.correctAnswer;
                const isSelected = idx === selectedAnswer;

                let style = "border-slate-200 hover:border-primary/50 hover:bg-primary/5";
                if (showDailyResult) {
                  if (isCorrect) style = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20";
                  else if (isSelected) style = "border-destructive bg-destructive/5 text-destructive-foreground opacity-80";
                  else style = "opacity-40 border-slate-100";
                }

                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: 1,
                      x: showDailyResult && isSelected && !isCorrect ? [0, -10, 10, -10, 10, 0] : 0,
                      scale: showDailyResult && isCorrect ? [1, 1.02, 1] : 1
                    }}
                    transition={{
                      delay: idx * 0.1,
                      duration: showDailyResult ? 0.3 : 0.2
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={showDailyResult}
                    onClick={() => handleDailySubmit(idx)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 font-bold text-xs md:text-sm relative overflow-hidden group",
                      style
                    )}
                  >
                    {showDailyResult && isCorrect && (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-2 -right-2 w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500"
                      >
                         <Sparkles size={20} className="animate-pulse" />
                      </motion.div>
                    )}

                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 relative z-10",
                      showDailyResult && isCorrect ? "bg-emerald-500 border-emerald-500 text-white" :
                      showDailyResult && isSelected ? "bg-destructive border-destructive text-white" :
                      isSelected ? "bg-primary border-primary text-white" : "border-slate-300 group-hover:border-primary/50"
                    )}>
                      {showDailyResult && isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className="relative z-10">{opt}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showDailyResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-6 border-t"
                >
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                    <h4 className="font-black text-xs uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Explanation
                    </h4>
                    <p className="text-sm md:text-base leading-relaxed text-slate-700 font-medium">
                      {dailyQuestion.explanation}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard" className="flex-1">
                      <Button className="w-full h-14 font-black gap-2 shadow-lg shadow-primary/20 rounded-2xl">
                        Return to Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" className="h-14 font-bold gap-2 rounded-2xl">
                      <Share2 className="w-4 h-4" /> Share Challenge
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {showDailyResult && selectedAnswer === dailyQuestion.correctAnswer && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-500 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-lg">Streak Maintained!</p>
                <p className="text-white/80 text-sm font-bold">Come back tomorrow for +50 XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">+50</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">XP Reward</p>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Question Bank</h1>
          <p className="text-muted-foreground mt-1 text-xs font-medium">Browse and study all official curriculum questions.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 bg-white"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
            refetch();
          }}
          disabled={isLoading}
        >
          <RefreshCw size={14} className={cn(isLoading && "animate-spin")} />
          {isLoading ? "Syncing..." : "Force Sync"}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Rules">General Rules</SelectItem>
              <SelectItem value="Signs">Road Signs</SelectItem>
              <SelectItem value="Intersections">Intersections</SelectItem>
              <SelectItem value="Emergency">Emergencies</SelectItem>
              <SelectItem value="Road Markings">Road Markings</SelectItem>
              <SelectItem value="Parking">Parking</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
             <Loader2 className="w-5 h-5 text-primary animate-spin" />
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Synchronizing Master curriculum bank...</p>
          </div>
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden border-slate-100 shadow-sm ring-1 ring-slate-100/60 rounded-2xl">
               <CardContent className="p-6 space-y-6 relative overflow-hidden">
                  {/* Shimmer Effect */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 -skew-x-12 pointer-events-none"
                  />

                  <div className="flex justify-between items-center">
                     <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-md" />
                        <Skeleton className="h-5 w-16 rounded-md" />
                     </div>
                     <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 rounded-md" />
                    <Skeleton className="h-6 w-1/2 rounded-md" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <Skeleton className="h-14 rounded-xl" />
                     <Skeleton className="h-14 rounded-xl" />
                     <Skeleton className="h-14 rounded-xl" />
                     <Skeleton className="h-14 rounded-xl" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg" />
               </CardContent>
            </Card>
          ))}
        </div>
      ) : !questions || questions.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-xl">
          <h3 className="text-xl font-bold mb-2">No questions found</h3>
          <p className="text-muted-foreground">Adjust your filters to see more results.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(questions as any[]).map((q: any, qIdx: number) => {
            const isBookmarked = bookmarkedIds.has(q.id);
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(qIdx * 0.05, 0.5) }}
              >
                <Card className="overflow-hidden border-slate-100 shadow-sm ring-1 ring-slate-100/60 rounded-xl hover:shadow-md hover:ring-primary/20 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="p-4 md:p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="uppercase text-[7px] font-black tracking-widest px-2 py-0 h-4 bg-slate-100 text-slate-500 border-0">{q.category}</Badge>
                          <Badge className={cn(
                            "uppercase text-[7px] font-black tracking-widest py-0 h-4 border-0",
                            q.difficulty === 'hard' ? 'bg-red-500 text-white' : q.difficulty === 'medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                          )}>
                            {q.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleVoice(q)}
                            className={cn("h-7 w-7 rounded-md transition-all active:scale-75", speakingId === q.id ? "text-primary bg-primary/5" : "text-slate-300")}
                          >
                            {speakingId === q.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleBookmarkToggle(q.id)}
                            className={cn("h-7 w-7 rounded-md transition-all active:scale-75", isBookmarked ? "text-primary" : "text-slate-300")}
                            disabled={addBookmark.isPending || removeBookmark.isPending}
                          >
                            {isBookmarked ? <BookmarkCheck size={14} className="fill-current" /> : <Bookmark size={14} />}
                          </Button>
                        </div>
                      </div>

                      <h3 className="text-sm md:text-base font-black text-slate-900 leading-snug mb-4">{q.text}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {(q.options as string[]).map((opt: string, idx: number) => (
                          <div
                            key={idx}
                            className={cn(
                              "p-2.5 rounded-lg border text-xs flex items-start gap-3 transition-all",
                              idx === q.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'bg-slate-50/50 border-slate-100 opacity-60'
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-black",
                              idx === q.correctAnswer ? "bg-emerald-500 text-white shadow-md" : "bg-slate-200 text-slate-400"
                            )}>
                              {idx === q.correctAnswer ? <CheckCircle2 size={12} /> : idx + 1}
                            </div>
                            <span className="leading-tight pt-0.5">{opt}</span>
                          </div>
                        ))}
                      </div>

                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between h-9 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 group">
                            <span>SADC Technical Logic</span>
                            <ChevronDown className="w-4 h-4 group-data-[state=open]:rotate-180 transition-transform" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-xs font-medium text-slate-700 italic"
                          >
                            <span className="font-black text-primary uppercase text-[8px] tracking-widest block mb-1">Accredited Explanation:</span>
                            "{q.explanation}"
                          </motion.div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
}
