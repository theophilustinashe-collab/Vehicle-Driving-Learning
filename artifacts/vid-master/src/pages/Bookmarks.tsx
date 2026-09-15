import { useGetBookmarks, useRemoveBookmark } from "@roadify/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkMinus, CheckCircle2, ArrowLeft, Bookmark, Search, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { variants, transitions } from "@/lib/motion";
import { triggerHaptic } from "@/lib/native-bridge";

export default function Bookmarks() {
  const { data: bookmarks, isLoading, refetch } = useGetBookmarks();
  const removeBookmark = useRemoveBookmark();
  const { toast } = useToast();

  const handleRemove = (questionId: number) => {
    triggerHaptic('medium');
    removeBookmark.mutate(
      { questionId },
      {
        onSuccess: () => {
          toast({ title: "Removed from bookmarks" });
          refetch();
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <Card key={i} className="border-0 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 space-y-4 relative overflow-hidden">
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent w-1/2 -skew-x-12" />
                <div className="flex justify-between items-center"><Skeleton className="h-5 w-32 rounded-md" /><Skeleton className="h-8 w-20 rounded-lg" /></div>
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-12 rounded-xl" /></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={variants.listContainer} className="p-3 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 pb-32">
      <motion.div variants={variants.listItem} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent" />
        <div className="flex items-center gap-4 relative z-10">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition-all active:scale-95" onClick={() => triggerHaptic('light')}>
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">Saved Records</h1>
            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
               <Bookmark size={12} className="text-primary" /> Special Revision Library
            </p>
          </div>
        </div>
        <div className="px-4 py-2 h-9 flex items-center justify-center rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shrink-0 shadow-lg shadow-primary/20 relative z-10">
           {bookmarks?.length || 0} Items
        </div>
      </motion.div>

      {!bookmarks || bookmarks.length === 0 ? (
        <motion.div variants={variants.listItem}>
          <Card className="border-dashed border-2 border-slate-200 py-24 bg-slate-50/30 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <CardContent className="p-0 flex flex-col items-center relative z-10">
              <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                <BookmarkMinus className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">No bookmarks yet</h3>
              <p className="text-slate-400 font-bold max-w-xs text-xs mt-2 mb-8 uppercase tracking-[0.2em] leading-relaxed text-center">
                Save difficult questions during simulations for intensive review.
              </p>
              <Link href="/questions">
                <Button className="font-black h-14 px-10 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-primary/20 uppercase text-xs tracking-widest gap-3 active:scale-95 transition-all">
                  <Search size={18} /> Browse Questions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={variants.listContainer} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {bookmarks.map((q) => (
              <motion.div
                key={q.id}
                variants={variants.listItem}
                layout
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95, x: -20, transition: { duration: 0.2 } }}
              >
                <Card className="border-0 shadow-sm ring-1 ring-slate-100 hover:ring-primary/30 rounded-2xl overflow-hidden bg-white group transition-all duration-300">
                  <CardContent className="p-5 md:p-6 space-y-5 relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="uppercase text-[7px] font-black tracking-widest px-2 py-0 h-4 bg-slate-100 text-slate-500 border-0">{q.category}</Badge>
                        <Badge className={cn(
                          "uppercase text-[7px] font-black tracking-widest py-0 h-4 border-0",
                          q.difficulty === 'hard' ? 'bg-red-500 text-white' : q.difficulty === 'medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                        )}>
                          {q.difficulty}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(q.id)}
                        disabled={removeBookmark.isPending}
                        className="h-8 px-3 rounded-lg text-[9px] font-black uppercase text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                      >
                        <BookmarkMinus className="w-3.5 h-3.5 mr-1.5" />
                        Purge Item
                      </Button>
                    </div>

                    <h3 className="text-sm md:text-base font-black text-slate-900 leading-snug">{q.text}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-2.5 rounded-lg border text-xs flex items-start gap-3 transition-all",
                            idx === q.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-60'
                          )}
                        >
                          <div className={cn(
                              "w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-black transition-all",
                              idx === q.correctAnswer ? "bg-emerald-500 text-white shadow-md" : "bg-slate-200 text-slate-400"
                            )}>
                            {idx === q.correctAnswer ? <CheckCircle2 size={12} /> : idx + 1}
                          </div>
                          <span className="leading-tight pt-0.5">{opt}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs font-medium text-slate-700 italic relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5"><Zap size={40} className="text-primary" /></div>
                      <span className="font-black text-primary uppercase text-[8px] tracking-[0.2em] block mb-1 relative z-10">SADC Protocol Logic:</span>
                      <p className="relative z-10">"{q.explanation}"</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
