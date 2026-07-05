import { useState, useMemo } from "react";
import { useListQuestions, useGetBookmarks, useAddBookmark, useRemoveBookmark } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ChevronDown, CheckCircle2, ArrowLeft, Info, WifiOff, Sparkles, Trophy as TrophyIcon, Share2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch } from "wouter";
import { getOfflineQuestions } from "@/lib/offline";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Questions() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const isDaily = searchParams.get("daily") === "true";

  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const { toast } = useToast();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showDailyResult, setShowDailyResult] = useState(false);

  const { data: onlineQuestions, isLoading, error } = useListQuestions({
    category: category !== "all" ? category : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
    limit: 500,
  }, { query: { retry: false } });

  const questions = useMemo(() => {
    if (onlineQuestions && onlineQuestions.length > 0) return onlineQuestions;

    // If offline or error, use local data
    if (!navigator.onLine || error) {
      const local = getOfflineQuestions();
      if (!local.length) return [];

      return local.filter(q => {
        const matchesCategory = category === "all" || q.category.toLowerCase().includes(category.toLowerCase());
        const matchesDifficulty = difficulty === "all" || q.difficulty === difficulty;
        return matchesCategory && matchesDifficulty;
      });
    }

    return onlineQuestions || [];
  }, [onlineQuestions, error, category, difficulty]);

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
        const baseUrl = (window as any).apiUrl || `http://${window.location.hostname || 'localhost'}:8080`;
        await fetch(`${baseUrl.replace(/\/$/, "")}/api/progress/daily-challenge/complete`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("vid_token")}`,
          },
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
            toast({ title: "Removed from bookmarks" });
          }
        }
      );
    } else {
      addBookmark.mutate(
        { data: { questionId } },
        {
          onSuccess: () => {
            toast({ title: "Added to bookmarks" });
          }
        }
      );
    }
  };

  if (isDaily && dailyQuestion) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 pb-24">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Question of the Day</h1>
          </div>
        </div>

        <Card className="border-0 shadow-2xl ring-1 ring-border overflow-hidden bg-gradient-to-b from-card to-muted/20">
          <div className="h-2 bg-primary w-full" />
          <CardContent className="p-6 md:p-10 space-y-8">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="uppercase font-black tracking-widest text-[10px]">
                {dailyQuestion.category}
              </Badge>
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold leading-tight text-slate-900">
              {dailyQuestion.text}
            </h2>

            {dailyQuestion.imageUrl && (
               <div className="rounded-2xl border bg-white p-4 shadow-inner overflow-hidden">
                 <img src={dailyQuestion.imageUrl} className="max-h-64 mx-auto object-contain" />
               </div>
            )}

            <div className="space-y-3">
              {dailyQuestion.options.map((opt, idx) => {
                const isCorrect = idx === dailyQuestion.correctAnswer;
                const isSelected = idx === selectedAnswer;

                let style = "border-slate-200 hover:border-primary/50 hover:bg-primary/5";
                if (showDailyResult) {
                  if (isCorrect) style = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20";
                  else if (isSelected) style = "border-destructive bg-destructive/5 text-destructive-foreground opacity-80";
                  else style = "opacity-40 border-slate-100";
                }

                return (
                  <button
                    key={idx}
                    disabled={showDailyResult}
                    onClick={() => handleDailySubmit(idx)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 font-bold text-sm md:text-base",
                      style
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                      showDailyResult && isCorrect ? "bg-emerald-500 border-emerald-500 text-white" :
                      showDailyResult && isSelected ? "bg-destructive border-destructive text-white" :
                      isSelected ? "bg-primary border-primary text-white" : "border-slate-300"
                    )}>
                      {showDailyResult && isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    {opt}
                  </button>
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
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="hidden lg:flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Question Bank</h1>
            <p className="text-muted-foreground mt-1">Browse and study all official curriculum questions.</p>
          </div>
        </div>
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
              <SelectItem value="general">General Rules</SelectItem>
              <SelectItem value="signs">Road Signs</SelectItem>
              <SelectItem value="intersections">Intersections</SelectItem>
              <SelectItem value="emergencies">Emergencies</SelectItem>
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
        <div className="space-y-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : !questions || questions.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-xl">
          <h3 className="text-xl font-bold mb-2">No questions found</h3>
          <p className="text-muted-foreground">Adjust your filters to see more results.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const isBookmarked = bookmarkedIds.has(q.id);
            return (
              <Card key={q.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="uppercase">{q.category}</Badge>
                        <Badge variant={q.difficulty === 'hard' ? 'destructive' : q.difficulty === 'medium' ? 'default' : 'outline'} className="uppercase">
                          {q.difficulty}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleBookmarkToggle(q.id)}
                        className={isBookmarked ? "text-primary" : "text-muted-foreground"}
                        disabled={addBookmark.isPending || removeBookmark.isPending}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-6">{q.text}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {q.options.map((opt, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-md border text-sm flex items-start gap-3 ${idx === q.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium' : 'bg-muted/30'}`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${idx === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20'}`}>
                            {idx === q.correctAnswer ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[10px]">{idx + 1}</span>}
                          </div>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>

                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          View Explanation <ChevronDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                          <span className="font-semibold text-primary block mb-1">Explanation:</span>
                          {q.explanation}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
