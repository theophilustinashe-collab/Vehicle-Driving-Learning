import { useRoute, Link } from "wouter";
import { useGetTestResult } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw, AlertTriangle, Share2, Trophy, Medal, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  }, [result]);

  if (!match || !sessionId) return null;

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Result not found</h2>
        <Link href="/dashboard">
          <Button className="mt-4 rounded-xl">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 relative overflow-hidden pb-24">
      {/* Simple Pure-CSS/Framer Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  top: -20,
                  left: `${Math.random() * 100}%`,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{
                  top: '120%',
                  rotate: 360 * 2,
                  left: `${(Math.random() * 100)}%`,
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  ease: "linear",
                  repeat: 0
                }}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 rounded-2xl border">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Exam Analysis</h1>
        </div>

        {result.passed && (
          <Button
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black shadow-lg shadow-emerald-200 gap-2 h-12 px-6"
            onClick={() => {
               alert("Status Card Generated! Long-press to save and share to WhatsApp.");
            }}
          >
            <Share2 className="w-4 h-4" /> Share My Success
          </Button>
        )}
      </div>

      <Card className={cn(
        "border-0 shadow-2xl ring-1 ring-slate-200/60 rounded-[3rem] overflow-hidden relative",
        result.passed ? 'bg-gradient-to-br from-emerald-50 to-white' : 'bg-gradient-to-br from-red-50 to-white'
      )}>
        <CardContent className="pt-12 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12 px-8 md:px-16">
          <div className="text-center lg:text-left flex-1 space-y-8">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className={cn(
                "inline-flex items-center justify-center w-24 h-24 rounded-[2rem] shadow-xl",
                result.passed ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-destructive text-white shadow-destructive/20"
              )}
            >
              {result.passed ? (
                <Trophy className="w-12 h-12" />
              ) : (
                <XCircle className="w-12 h-12" />
              )}
            </motion.div>

            <div className="space-y-3">
              <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                {result.passed ? "CERTIFIED MASTER" : "KEEP PUSHING"}
              </h2>
              <p className="text-slate-500 font-bold text-xl leading-relaxed max-w-md">
                {result.passed
                  ? "Outstanding! You've met the 88% pass threshold. You're ready for the real VID depot."
                  : "You didn't reach the 88% pass mark this time. Review your mistakes below to improve."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link href="/test">
                <Button className="h-16 px-10 rounded-2xl font-black text-xl gap-2 shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
                  <RotateCcw className="w-6 h-6" />
                  Try Again
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="h-16 px-10 rounded-2xl font-black text-xl border-2">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Certificate/Card Preview */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full max-w-[380px] bg-slate-900 rounded-[2.5rem] p-10 text-center shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Medal className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full inline-block text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Official Result
              </div>
              <div className="text-8xl font-black tracking-tighter text-white drop-shadow-lg">
                {result.percentage}<span className="text-primary text-4xl">%</span>
              </div>
              <div className="space-y-4">
                 <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.percentage}%` }}
                      className={cn(
                        "h-full rounded-full",
                        result.passed ? "bg-emerald-500" : "bg-destructive"
                      )}
                    />
                 </div>
                 <div className="flex justify-between items-center px-2">
                    <div className="text-left">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Correct</p>
                       <p className="text-white font-black text-xl">{result.score}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total</p>
                       <p className="text-white font-black text-xl">{result.total}</p>
                    </div>
                 </div>
              </div>
              <div className={cn(
                "py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-inner",
                result.passed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"
              )}>
                {result.passed ? "LICENCE QUALIFIED" : "TRAINING REQUIRED"}
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <h3 className="text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Review Session
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          {result.answers?.map((ans, idx) => (
            <Card key={ans.questionId} className={cn(
              "border-0 shadow-lg ring-1 ring-slate-200/60 rounded-3xl overflow-hidden",
              ans.isCorrect ? 'bg-white' : 'bg-red-50/30'
            )}>
              <CardContent className="p-8 flex gap-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                  ans.isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-destructive"
                )}>
                  {ans.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div className="space-y-6 flex-1">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Question {idx + 1}</p>
                    <p className="text-xl font-bold text-slate-900 leading-tight">Question details will be fetched in full review mode. ID: {ans.questionId}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Selection</p>
                      <p className={cn("font-bold text-lg", ans.isCorrect ? "text-emerald-600" : "text-destructive")}>Option {ans.selectedAnswer + 1}</p>
                    </div>
                    {!ans.isCorrect && (
                      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-inner">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Correct Answer</p>
                        <p className="text-emerald-700 font-bold text-lg">Option {ans.correctAnswer + 1}</p>
                      </div>
                    )}
                  </div>

                  {ans.explanation && (
                    <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-2">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                         <Star className="w-3 h-3 fill-current" /> Expert Guidance
                      </p>
                      <p className="text-slate-700 font-bold leading-relaxed">{ans.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
