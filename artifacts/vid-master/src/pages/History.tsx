import { useGetTestHistory } from "@roadify/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Clock, Calendar, ArrowLeft, BarChart3, ChevronRight, Zap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { variants, transitions } from "@/lib/motion";
import { triggerHaptic } from "@/lib/native-bridge";

export default function History() {
  const { data: history, isLoading } = useGetTestHistory();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 flex items-center justify-between relative overflow-hidden">
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent w-1/2 -skew-x-12" />
                <div className="flex items-center gap-6">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
                <Skeleton className="h-10 w-20 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={variants.listContainer} className="p-3 md:p-6 max-w-5xl mx-auto space-y-6 pb-32">
      <motion.div variants={variants.listItem} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent" />
        <div className="flex items-center gap-4 relative z-10">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition-all active:scale-95" onClick={() => triggerHaptic('light')}>
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">Simulation Logs</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
               <BarChart3 size={12} className="text-primary" /> Your Performance History
            </p>
          </div>
        </div>

        {history && history.length > 0 && (
          <Badge className="bg-primary/10 text-primary border-0 font-black text-[9px] uppercase px-3 py-1.5 rounded-full relative z-10">
            {history.length} Sessions Captured
          </Badge>
        )}
      </motion.div>

      {!history || history.length === 0 ? (
        <motion.div variants={variants.listItem}>
          <Card className="border-dashed border-2 border-slate-200 py-24 bg-slate-50/30 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <CardContent className="p-0 text-center flex flex-col items-center relative z-10">
              <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                <Calendar className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Empty Logbook</h3>
              <p className="text-slate-400 font-bold max-w-xs text-xs mt-2 mb-8 uppercase tracking-[0.2em] leading-relaxed">
                Take your first mock exam to start capturing simulation data.
              </p>
              <Link href="/test">
                 <Button className="font-black h-14 px-10 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-primary/20 uppercase text-xs tracking-widest gap-3 active:scale-95 transition-all">
                    <Zap size={18} className="text-primary fill-current" /> Initialize First Run
                 </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={variants.listContainer} initial="hidden" animate="show" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {history.map((result) => (
              <motion.div key={result.sessionId} variants={variants.listItem} layout>
                <Link href={`/test/${result.sessionId}/results`}>
                  <Card
                    className="hover:ring-primary/40 transition-all cursor-pointer shadow-sm ring-1 ring-slate-100 border-0 rounded-2xl bg-white group overflow-hidden relative"
                    onClick={() => triggerHaptic('light')}
                  >
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.01] transition-opacity" />
                  <CardContent className="p-4 md:p-6 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        result.passed
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-lg shadow-emerald-500/10'
                          : 'bg-red-50 text-red-600 border-red-100 shadow-lg shadow-red-500/10'
                      )}>
                        {result.passed ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">Simulator Run</h3>
                          <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-widest py-0.5 px-2 border-0",
                            result.passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                          )}>
                            {result.passed ? 'QUALIFIED' : 'RE-ATTEMPT'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-300" />
                            {new Date(result.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="opacity-20 hidden xs:inline">•</span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                            {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Session Score</div>
                        <div className="font-black text-slate-400 text-sm">{result.score} / {result.total}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={cn(
                          "text-2xl md:text-3xl font-black tabular-nums tracking-tighter leading-none",
                          result.passed ? "text-slate-900" : "text-slate-300"
                        )}>{result.percentage}%</div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg mt-2 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                           <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      )}
    </motion.div>
  );
}
