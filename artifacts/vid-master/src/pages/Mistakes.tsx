import { useState, useMemo } from "react";
import { useListQuestions, useGetDashboard } from "@roadify/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronDown, CheckCircle2, ArrowLeft, PlayCircle, Loader2, Target, BookOpen, ShieldCheck, Zap } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { variants, transitions } from "@/lib/motion";

import { getRecordedMistakeIds } from "@/lib/offline";

export default function MistakesPage() {
  const { data: dashboard } = useGetDashboard();
  const { data: allQuestions, isLoading } = useListQuestions({ limit: 1000 });

  // Group real user mistakes by category
  const categorizedMistakes = useMemo(() => {
    if (!allQuestions) return {};
    const mistakeIds = getRecordedMistakeIds();
    const mistakes = allQuestions.filter(q => mistakeIds.includes(q.id));

    return mistakes.reduce((acc: any, q) => {
      if (!acc[q.category]) acc[q.category] = [];
      acc[q.category].push(q);
      return acc;
    }, {});
  }, [allQuestions]);

  const categories = Object.keys(categorizedMistakes);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 space-y-4 relative overflow-hidden">
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent w-1/2 -skew-x-12" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={variants.listContainer}
      className="p-3 md:p-4 max-w-5xl mx-auto space-y-6 pb-32"
    >
      <motion.div variants={variants.listItem} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-primary uppercase leading-none">Mistake Bank</h1>
            <p className="text-slate-400 font-bold mt-1 uppercase text-[9px] tracking-widest">Improve your weak spots</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl border border-white/10 shadow-lg">
           <Target className="w-4 h-4 text-primary animate-pulse" />
           <div>
              <p className="text-[7px] font-black uppercase text-slate-500 leading-none">Target Mastery</p>
              <p className="text-xs font-black tracking-tight">{Object.values(categorizedMistakes).flat().length} Weak Spots</p>
           </div>
        </div>
      </motion.div>

      {categories.length === 0 ? (
        <motion.div variants={variants.listItem}>
          <Card className="border-dashed border-2 border-primary/20 py-16 bg-primary/5 rounded-[2.5rem] flex flex-col items-center text-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
            <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-xl shadow-emerald-500/20 relative z-10">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="relative z-10 space-y-1 px-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Impeccable Record!</h3>
              <p className="text-slate-500 font-bold max-w-sm text-sm">Your knowledge is currently flawless. Maintain your edge with a fresh mock exam.</p>
            </div>
            <Link href="/test">
              <Button className="font-black gap-2 h-12 px-6 rounded-xl shadow-lg relative z-10 uppercase text-[10px] tracking-widest">
                <PlayCircle size={18} /> Start Simulation
              </Button>
            </Link>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Categorized Mastery Overview */}
          <motion.div variants={variants.listItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(cat => (
              <Card key={cat} className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-100 bg-white overflow-hidden group">
                 <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                       <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-4 h-4 text-primary" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1 truncate">{cat}</p>
                          <p className="text-[11px] font-black text-slate-900 truncate">{(categorizedMistakes[cat] || []).length} Mistakes</p>
                       </div>
                    </div>
                 </div>
                 <div className="h-1 w-full bg-slate-100 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '40%' }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]"
                    />
                 </div>
              </Card>
            ))}
          </motion.div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-black text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                Correction Pipeline
              </h2>
              <Link href="/test?mode=mistakes">
                <Button size="sm" variant="outline" className="font-black uppercase text-[9px] tracking-widest h-8 px-4 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                  Simulate Gaps
                </Button>
              </Link>
            </div>

            <div className="grid gap-4">
              {Object.values(categorizedMistakes).flat().map((q: any) => (
                <motion.div key={q.id} variants={variants.listItem}>
                  <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200/60 rounded-2xl bg-white group hover:ring-primary/30 transition-all">
                    <CardContent className="p-0">
                      <div className="p-5 md:p-6 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="uppercase text-[8px] font-black tracking-tighter bg-red-500 text-white border-0 px-2 py-0.5">Critical Fault</Badge>
                              <Badge variant="outline" className="uppercase text-[8px] font-black tracking-tighter border-slate-200 text-slate-400 px-2 py-0.5">{q.category}</Badge>
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight tracking-tight">{q.text}</h3>
                          </div>
                          {q.imageUrl && (
                            <div className="w-full md:w-40 h-28 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-3 shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform duration-500 shrink-0">
                               <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                               <img src={q.imageUrl} className="max-h-full max-w-full object-contain drop-shadow-lg relative z-10" alt="Question Asset" />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt: string, idx: number) => (
                            <motion.div
                              key={idx}
                              whileHover={{ scale: 1.01 }}
                              className={cn(
                                "p-3.5 rounded-xl border-2 flex items-start gap-3 transition-all duration-300",
                                idx === q.correctAnswer
                                  ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                                  : "bg-slate-50/50 border-transparent text-slate-500 opacity-60"
                              )}
                            >
                              <div className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-black text-[10px] transition-all",
                                  idx === q.correctAnswer ? "bg-emerald-500 text-white shadow-md" : "bg-slate-200 text-slate-400"
                                )}>
                                {idx === q.correctAnswer ? <CheckCircle2 size={14} /> : idx + 1}
                              </div>
                              <span className={cn("text-xs md:text-sm leading-tight pt-0.5", idx === q.correctAnswer ? "font-bold text-emerald-900" : "font-medium")}>{opt}</span>
                            </motion.div>
                          ))}
                        </div>

                        <Collapsible className="w-full">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between h-10 px-4 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase text-[9px] tracking-widest group/trigger">
                              <span>SADC Official Resolution</span>
                              <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]/trigger:rotate-180" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden shadow-xl border border-white/5">
                               <div className="absolute top-0 right-0 p-6 opacity-[0.05]">
                                  <AlertCircle className="w-24 h-24 text-primary" />
                               </div>
                               <div className="space-y-3 relative z-10">
                                  <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                        <ShieldCheck className="w-5 h-5 text-white" />
                                     </div>
                                     <h4 className="font-black text-[10px] uppercase tracking-widest text-primary">Master Correction</h4>
                                  </div>
                                  <p className="text-sm md:text-base leading-relaxed text-slate-300 font-medium italic opacity-90">
                                    "{q.explanation}"
                                  </p>
                                  <div className="pt-2 flex items-center gap-2 opacity-30">
                                     <div className="h-[1px] flex-1 bg-white" />
                                     <span className="text-[7px] font-black uppercase tracking-widest">Verified Accreditation</span>
                                     <div className="h-[1px] flex-1 bg-white" />
                                  </div>
                               </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
