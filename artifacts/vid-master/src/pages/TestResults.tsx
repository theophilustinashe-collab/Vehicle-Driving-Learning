import { useRoute, Link } from "wouter";
import { useGetTestResult } from "@roadify/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw, AlertTriangle, Share2, Trophy, Medal, Star, BookOpen, ChevronRight, Gauge, ShieldCheck, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { variants, transitions } from "@/lib/motion";
import { triggerHaptic } from "@/lib/native-bridge";

export default function TestResults() {
  const [match, params] = useRoute("/test/:sessionId/results");
  const sessionId = params?.sessionId;
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: result, isLoading } = useGetTestResult(sessionId || "", {
    query: {
      enabled: !!sessionId,
    } as any
  });

  useEffect(() => {
    if (result?.passed) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [result]);

  if (!match || !sessionId) return null;

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center py-20">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Result not found</h2>
        <Link href="/dashboard">
          <Button className="mt-4 rounded-xl px-8 h-11">Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={variants.listContainer} className="min-h-screen w-full bg-slate-50/50 relative overflow-x-hidden">
      <div className="p-3 md:p-6 max-w-6xl mx-auto space-y-4 md:space-y-6 pb-32">
      {/* Confetti Layer */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(80)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  top: -20,
                  left: `${Math.random() * 100}%`,
                  rotate: Math.random() * 360,
                  opacity: 1,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  top: '110%',
                  rotate: Math.random() * 1000,
                  left: `${(Math.random() * 100) + (Math.random() * 20 - 10)}%`,
                  opacity: 0
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  ease: "circOut",
                  repeat: 0
                }}
                className="absolute w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: ['#166534', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 6)] }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Header */}
      <motion.div variants={variants.listItem} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent" />
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none">Your Results</h1>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
             <ShieldCheck size={10} className="text-primary" /> Official Mock Exam Report
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {result.passed && (
            <Button
              size="sm"
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 font-black shadow-lg shadow-emerald-500/20 gap-2 h-10 px-4 text-[9px] uppercase tracking-widest active:scale-95 transition-all"
              onClick={() => { triggerHaptic('medium'); alert("Credentials Exported!"); }}
            >
              <Share2 size={14} /> Export
            </Button>
          )}
          <Link href="/test">
             <Button variant="outline" className="h-10 w-10 rounded-xl border-2 flex items-center justify-center p-0 active:scale-95 transition-all" title="New Test">
                <RotateCcw size={16} />
             </Button>
          </Link>
        </div>
      </motion.div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-stretch">

        {/* Outcome Card */}
        <motion.div variants={variants.listItem} className="lg:col-span-7 h-full">
          <Card className={cn(
            "border-0 shadow-xl ring-1 ring-slate-200/60 rounded-[2rem] overflow-hidden relative h-full transition-all duration-500",
            result.passed ? 'bg-gradient-to-br from-emerald-50/80 to-white' : 'bg-gradient-to-br from-red-50/80 to-white'
          )}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
            <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full space-y-5 relative z-10">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  className={cn(
                    "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-xl shrink-0 border-4 border-white",
                    result.passed ? "bg-emerald-500 text-white shadow-emerald-500/30" : "bg-red-500 text-white shadow-red-500/30"
                  )}
                >
                  {result.passed ? <Trophy size={28} /> : <XCircle size={28} />}
                </motion.div>
                <div className="min-w-0">
                  <h2 className="text-xl md:text-3xl font-black tracking-tighter text-slate-900 leading-none">
                    {result.passed ? "QUALIFIED" : "RE-ATTEMPT"}
                  </h2>
                  <p className={cn(
                    "font-bold text-[9px] md:text-xs mt-1 leading-tight max-w-sm uppercase tracking-wide",
                    result.passed ? "text-emerald-700/70" : "text-red-700/70"
                  )}>
                    {result.passed
                      ? "readiness threshold exceeded."
                      : "Review technical resolution below."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link href="/test">
                  <Button className="h-10 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-black text-[9px] uppercase tracking-widest gap-2 shadow-2xl shadow-primary/20 active:scale-95 transition-all">
                    <RotateCcw size={14} className="text-primary fill-current" />
                    Restart
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="h-10 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest border-2 active:scale-95 transition-all bg-white hover:bg-slate-50">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 p-4 opacity-[0.01] pointer-events-none transform rotate-12 scale-125"><BookOpen size={180} /></div>
          </Card>
        </motion.div>

        {/* Certificate Preview Card */}
        <motion.div
          variants={variants.listItem}
          className="lg:col-span-5 h-full"
        >
          <Card className="border-0 shadow-2xl bg-slate-900 text-white rounded-[2rem] p-5 md:p-6 h-full relative overflow-hidden flex flex-col justify-between group border border-white/5">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 p-2 opacity-[0.05] group-hover:opacity-10 transition-opacity"
            >
              <Medal size={180} />
            </motion.div>

            <div className="relative z-10">
              <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-full inline-flex items-center gap-1.5 text-[6px] font-black uppercase tracking-[0.2em] text-primary border border-white/5 shadow-inner">
                <ShieldCheck size={8} /> Performance Scorecard
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                 <motion.span
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.4, duration: 0.8 }}
                   className="text-5xl md:text-6xl font-black tracking-tighter leading-none"
                 >
                   {result.percentage}
                 </motion.span>
                 <span className="text-xl font-black text-primary">%</span>
              </div>
            </div>

            <div className="relative z-10 space-y-4 pt-6">
              <div className="space-y-2">
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.percentage}%` }}
                      transition={{ duration: 1.5, ease: "circOut", delay: 0.6 }}
                      className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", result.passed ? "bg-emerald-500" : "bg-red-500")}
                    />
                 </div>
                 <div className="flex justify-between items-center px-0.5">
                    <div>
                       <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Correct</p>
                       <p className="text-lg font-black tabular-nums">{result.score}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total</p>
                       <p className="text-lg font-black tabular-nums">{result.total}</p>
                    </div>
                 </div>
              </div>
              <div className={cn(
                "py-2 rounded-lg font-black text-[8px] text-center uppercase tracking-[0.2em] border-2 shadow-inner transition-all duration-700",
                result.passed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5"
                  : "bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5"
              )}>
                {result.passed ? "LICENCE AUTHORIZED" : "DRILL REQUIRED"}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Review Section */}
      <div className="space-y-8 pt-6">
        <motion.div variants={variants.listItem} className="flex items-center justify-between px-2">
          <h3 className="text-base font-black tracking-[0.2em] text-slate-900 uppercase flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg"><BookOpen size={18} className="text-primary" /></div>
            Review your answers
          </h3>
          <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-black text-[10px] uppercase px-4 py-1.5 rounded-xl shadow-sm">
            {result.answers?.length} Questions
          </Badge>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {result.answers?.map((ans, idx) => (
            <motion.div key={ans.questionId} variants={variants.listItem} whileHover={{ y: -2 }} layout>
              <Card className={cn(
                "border-0 shadow-sm ring-1 ring-slate-100 rounded-xl overflow-hidden bg-white hover:ring-primary/20 transition-all duration-300 group",
                !ans.isCorrect && 'ring-red-100 bg-red-50/20 shadow-red-500/5'
              )}>
                <CardContent className="p-3 md:p-5 flex gap-4 md:gap-5 relative">
                  <div className={cn(
                    "w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 shadow-lg border-2 transition-transform group-hover:scale-110",
                    ans.isCorrect
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5"
                      : "bg-red-50 text-red-600 border-red-100 shadow-red-500/5"
                  )}>
                    {ans.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3 md:space-y-4">
                    <div>
                      <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                        <span className="w-2 h-[1px] bg-slate-200" /> Syllabus Item #{idx + 1}
                      </p>
                      <h4 className="text-sm md:text-base font-black text-slate-900 leading-snug tracking-tight">{(ans as any).text || `Curriculum Question ${ans.questionId}`}</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-slate-50/50 border border-slate-100 group-hover:bg-white transition-colors">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Your Selection</p>
                        <p className={cn("font-black text-xs", ans.isCorrect ? "text-emerald-700" : "text-red-700")}>
                          Option {String.fromCharCode(65 + ans.selectedAnswer)}
                        </p>
                      </div>
                      {!ans.isCorrect && (
                        <div className="p-2.5 rounded-lg bg-emerald-50/30 border border-emerald-100 animate-in fade-in zoom-in duration-700">
                          <p className="text-[7px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">Master Protocol</p>
                          <p className="text-emerald-800 font-black text-xs">
                             Option {String.fromCharCode(65 + ans.correctAnswer)}
                          </p>
                        </div>
                      )}
                    </div>

                    {ans.explanation && (
                      <div className="p-3.5 md:p-4 bg-slate-900 rounded-lg md:rounded-xl text-white relative overflow-hidden shadow-xl border border-white/5">
                        <div className="absolute top-0 right-0 p-2 opacity-[0.05] group-hover:scale-110 transition-transform"><ShieldCheck size={60} className="text-primary" /></div>
                        <p className="text-[7px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-1.5 mb-1 relative z-10">
                           <Zap size={8} className="fill-current" /> Expert Guidance
                        </p>
                        <p className="text-[11px] md:text-xs font-bold text-slate-300 leading-relaxed relative z-10 italic opacity-90">"{ans.explanation}"</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </motion.div>
);
}
