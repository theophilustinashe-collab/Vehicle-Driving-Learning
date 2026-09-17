import { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useStartTest, useSubmitTest, StartTestInputMode, getGetTestResultQueryKey } from "@roadify/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, ArrowRight, CheckCircle2, Volume2, VolumeX, Info, Flag, ChevronLeft, ChevronRight, X as CloseIcon, Zap, Sparkles, XCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { speak, stopSpeaking, prepareTextForSpeech } from "@/lib/voice";
import type { TestSession, AnswerInput } from "@roadify/api-client-react";
import { getOfflineQuestions, queueTestResult } from "@/lib/offline";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { triggerHaptic } from "@/lib/native-bridge";
import { transitions, variants } from "@/lib/motion";

function TickerDigit({ value, color }: { value: string | number, color: string }) {
  return (
    <div className="relative h-7 md:h-8 w-[0.6em] overflow-hidden flex justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn("absolute inset-0 flex justify-center font-black", color)}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function CircularTimer({ seconds, total }: { seconds: number, total: number }) {
  const percentage = (seconds / total) * 100;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const minsStr = mins.toString().padStart(2, '0');
  const secsStr = secs.toString().padStart(2, '0');

  const isLow = seconds <= 60;
  const isCritical = seconds <= 30;
  const isWarning = seconds <= 120 && seconds > 60;

  const color = isCritical ? "text-red-600" : isLow ? "text-red-500" : isWarning ? "text-amber-500" : "text-primary";

  return (
    <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shrink-0">
      {/* Glass Morphism Background Layer */}
      <div className="absolute inset-0 bg-white/10 dark:bg-slate-900/20 backdrop-blur-md rounded-full border border-white/20 dark:border-slate-800/30 shadow-xl pointer-events-none" />

      {/* Background Glow */}
      <AnimatePresence>
        {isLow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0.1, 0.25, 0.1],
              scale: [1, 1.2, 1],
              boxShadow: isCritical ? ["0 0 20px rgba(220,38,38,0.2)", "0 0 40px rgba(220,38,38,0.4)", "0 0 20px rgba(220,38,38,0.2)"] : ["0 0 20px rgba(239,68,68,0.1)", "0 0 40px rgba(239,68,68,0.3)", "0 0 20px rgba(239,68,68,0.1)"]
            }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={cn("absolute inset-0 rounded-full blur-2xl", isCritical ? "bg-red-600/20" : "bg-red-500/10")}
          />
        )}
      </AnimatePresence>

      <svg className="w-full h-full -rotate-90 drop-shadow-xl relative z-10 p-1" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800/50" />

        {/* Progress Glow Path */}
        <motion.circle
          cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="10"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          className={cn("opacity-20 blur-sm", color)}
          strokeLinecap="round"
        />

        <motion.circle
          cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "linear" }}
          className={color}
          strokeLinecap="round"
        />
      </svg>

      <div className={cn("absolute inset-0 flex flex-col items-center justify-center font-mono leading-none z-20", isCritical ? "animate-pulse" : "")}>
        <motion.div
          key={seconds}
          initial={{ scale: 1 }}
          animate={{ scale: isLow ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center text-xl md:text-2xl tracking-tighter"
        >
          <TickerDigit value={minsStr[0]} color={color} />
          <TickerDigit value={minsStr[1]} color={color} />
          <span className={cn("font-black px-0.5 mb-1", color)}>:</span>
          <TickerDigit value={secsStr[0]} color={color} />
          <TickerDigit value={secsStr[1]} color={color} />
        </motion.div>
        <span className="text-[6px] md:text-[7px] font-black opacity-40 uppercase tracking-widest text-slate-900 dark:text-slate-100 mt-1">Remaining</span>
      </div>
    </div>
  );
}

import { useQueryClient } from "@tanstack/react-query";

export default function TestPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startTest = useStartTest();
  const submitTest = useSubmitTest();

  const [mode, setMode] = useState<StartTestInputMode>("timed");
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const triggerAppHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    triggerHaptic(style);
  };

  const handleStart = () => {
    triggerAppHaptic('medium');

    const startOffline = () => {
      const local = getOfflineQuestions();
      if (!local || !local.length) {
        toast({
          title: "Engine Sync Required",
          description: "No offline data found. Please connect to Wi-Fi once to download the curriculum.",
          variant: "destructive"
        });
        return;
      }
      const selected = [...local].sort(() => 0.5 - Math.random()).slice(0, 25);
      const now = new Date();
      setSession({
        sessionId: `offline-${Date.now()}`,
        questions: selected,
        mode,
        startedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 8 * 60 * 1000).toISOString(),
        durationSeconds: 8 * 60
      } as any);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(mode === "timed" ? 8 * 60 : null);
      toast({ title: "Local Simulation Active" });
    };

    if (!navigator.onLine) {
      startOffline();
      return;
    }

    startTest.mutate({ data: { mode } }, {
      onSuccess: (data) => {
        setSession(data);
        setCurrentQuestionIndex(0);
        setAnswers({});
        if (data.mode === "timed" && data.expiresAt) {
          const expires = new Date(data.expiresAt).getTime();
          const now = new Date().getTime();
          setTimeLeft(Math.max(0, Math.floor((expires - now) / 1000)));
        }
      },
      onError: (err: any) => {
        console.error("[Roadify] Start Test Error:", err);
        if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
           startOffline();
        } else {
           toast({ title: "Simulation Error", description: err.message, variant: "destructive" });
        }
      }
    });
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      const q = session?.questions[currentQuestionIndex];
      if (q) {
        speak(prepareTextForSpeech(q.text, q.options));
        setIsSpeaking(true);
      }
    }
  };

  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setShowExplanation(false);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft === null || !session) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const timer = setInterval(() => setTimeLeft((prev) => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, session]);

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (showExplanation) return; // Prevent multiple taps in practice mode feedback
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
    if (mode === "practice") {
      const q = session?.questions[currentQuestionIndex];
      if (q) triggerAppHaptic(answerIndex === q.correctAnswer ? 'success' : 'error');
      setShowExplanation(true);
    } else {
      triggerAppHaptic('medium');
    }
  };

  const handleSubmit = (force = false) => {
    if (!session) return;
    if (!force && Object.keys(answers).length < session.questions.length) {
      setShowFinishDialog(true);
      return;
    }
    setIsFinishing(true);
    triggerAppHaptic('heavy');

    const formattedAnswers: AnswerInput[] = Object.entries(answers).map(([qId, ans]) => ({
      questionId: parseInt(qId, 10),
      selectedAnswer: ans,
    }));

    if (!navigator.onLine || session.sessionId.startsWith('offline-')) {
      let score = 0;
      const offlineAnswers = session.questions.map(q => {
        const selected = answers[q.id];
        const isCorrect = selected === q.correctAnswer;
        if (isCorrect) score++;
        return {
          questionId: q.id,
          text: q.text,
          selectedAnswer: selected ?? -1,
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation
        };
      });

      const resultData = {
        sessionId: session.sessionId,
        score,
        total: session.questions.length,
        percentage: Math.round((score / session.questions.length) * 100),
        passed: score >= (session.questions.length * 0.88),
        completedAt: new Date().toISOString(),
        mode: session.mode,
        answers: offlineAnswers
      };

      // Save to local queue for future sync
      queueTestResult(session.sessionId, score, session.questions.length, offlineAnswers);

      // Hydrate cache so Results page works offline
      queryClient.setQueryData(getGetTestResultQueryKey(session.sessionId), resultData);

      setTimeout(() => {
        setSession(null);
        setLocation(`/test/${session.sessionId}/results`);
      }, 300);
      return;
    }

    submitTest.mutate({ sessionId: session.sessionId, data: { answers: formattedAnswers } }, {
      onSuccess: (data) => {
        // Instant Cache Hydration: Set the result data immediately so the next page is already loaded
        queryClient.setQueryData(getGetTestResultQueryKey(session.sessionId), data);
        setLocation(`/test/${session.sessionId}/results`);
      },
      onError: (err) => {
        console.warn("[Roadify] Submit online failed, falling back to local evaluation:", err);
        let score = 0;
        const offlineAnswers = session.questions.map(q => {
          const selected = answers[q.id];
          const isCorrect = selected === q.correctAnswer;
          if (isCorrect) score++;
          return {
            questionId: q.id,
            text: q.text,
            selectedAnswer: selected ?? -1,
            correctAnswer: q.correctAnswer,
            isCorrect,
            explanation: q.explanation
          };
        });

        const resultData = {
          sessionId: session.sessionId,
          score,
          total: session.questions.length,
          percentage: Math.round((score / session.questions.length) * 100),
          passed: score >= (session.questions.length * 0.88),
          completedAt: new Date().toISOString(),
          mode: session.mode,
          answers: offlineAnswers
        };

        // Queue result locally for background sync
        queueTestResult(session.sessionId, score, session.questions.length, offlineAnswers);

        // Hydrate cache so Results page works immediately
        queryClient.setQueryData(getGetTestResultQueryKey(session.sessionId), resultData);

        setTimeout(() => {
          setSession(null);
          setLocation(`/test/${session.sessionId}/results`);
        }, 300);
      }
    });
  };

  if (!session) {
    return (
      <div className="p-4 w-full min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-slate-200 rounded-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-black">Exam Simulator</CardTitle>
            <CardDescription className="text-xs font-bold uppercase">25 questions • 8 minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as StartTestInputMode)} className="space-y-2">
              {[
                { val: 'timed', title: 'Timed Mock Exam', desc: 'Standard exam conditions.' },
                { val: 'practice', title: 'Practice Mode', desc: 'Study with instant feedback.' }
              ].map(m => (
                <div key={m.val} className={cn("flex items-start space-x-3 rounded-xl border p-3.5 cursor-pointer transition-all", mode === m.val ? "border-primary bg-primary/5" : "border-slate-100")} onClick={() => setMode(m.val as any)}>
                   <RadioGroupItem value={m.val} id={m.val} className="mt-1" />
                   <Label htmlFor={m.val} className="cursor-pointer">
                      <div className="font-black text-sm text-slate-900">{m.title}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">{m.desc}</div>
                   </Label>
                </div>
              ))}
            </RadioGroup>
            <Button className="w-full font-black h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handleStart} disabled={startTest.isPending}>
              {startTest.isPending ? "Connecting..." : "Start Mock Exam"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestion.id] !== undefined;
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const progress = ((currentQuestionIndex) / session.questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col z-[100] h-screen w-screen overflow-hidden">
      <AnimatePresence>
        {isFinishing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center text-center p-8"
          >
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full"
              />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <motion.div
                     animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                   >
                    <ShieldCheck className="w-10 h-10 text-primary fill-current" />
                   </motion.div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-[0.4em] drop-shadow-lg">Finishing Up</h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-8 bg-white/10" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">Checking your answers</p>
                  <div className="h-[1px] w-8 bg-white/10" />
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                      backgroundColor: ["hsl(var(--primary) / 0.3)", "hsl(var(--primary) / 1)", "hsl(var(--primary) / 0.3)"]
                    }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                    className="w-1.5 h-6 rounded-full"
                  />
                ))}
              </div>

              <p className="text-white/20 font-black text-[8px] uppercase tracking-[0.3em] pt-4">Roadify Zimbabwe</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b px-4 py-2 flex items-center justify-between gap-4 shrink-0 z-50 shadow-sm safe-top">
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all flex items-center justify-center text-slate-600 dark:text-slate-400" onClick={() => window.history.back()}>
             <ChevronLeft size={18} />
           </Button>
           <div className="hidden xs:block">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
              <p className="text-sm font-black text-slate-900 dark:text-white leading-none mt-1">{currentQuestionIndex + 1} / {session.questions.length}</p>
           </div>
        </div>

        <div className="flex-1 max-w-[200px] px-2 hidden sm:block">
           <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} className="h-full bg-primary" />
           </div>
        </div>

        <div className="flex items-center gap-3">
           {timeLeft !== null && <CircularTimer seconds={timeLeft} total={8 * 60} />}
           <Button variant="ghost" size="icon" className={cn("h-9 w-9 rounded-xl shadow-sm transition-all active:scale-95", isSpeaking ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")} onClick={toggleVoice}>
              {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
           </Button>
        </div>
      </div>

      {/* Main Content Area - Space Efficient Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden bg-white dark:bg-slate-950">
        {/* Visual Asset (Optimized Overlay on Mobile, Side on Desktop) */}
        {currentQuestion.imageUrl && (
          <div className="w-full lg:w-[40%] h-[25%] lg:h-full bg-slate-50 dark:bg-black/20 border-r dark:border-slate-800 flex items-center justify-center p-4 shrink-0 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
             <img src={currentQuestion.imageUrl} className="max-h-full max-w-full object-contain drop-shadow-xl relative z-10" alt="Road Sign" />
          </div>
        )}

        {/* Question & Answers Area - High Density */}
        <div className={cn(
          "flex-1 flex flex-col overflow-y-auto custom-scrollbar relative z-10",
          currentQuestion.imageUrl ? "p-4 md:p-8" : "p-6 md:p-12 max-w-4xl mx-auto w-full"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={transitions.fast}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="uppercase font-black text-[8px] tracking-widest px-2 py-0.5 bg-primary/10 text-primary border-0">{currentQuestion.category}</Badge>
                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Question {currentQuestionIndex + 1}</span>
                </div>
                <h2 className="text-lg md:text-xl font-black leading-tight text-slate-900 dark:text-white tracking-tight">
                  {currentQuestion.text}
                </h2>
              </div>

              <motion.div
                key={`${currentQuestion.id}-options`}
                initial="hidden"
                animate="show"
                variants={variants.listContainer}
                className={cn(
                  "grid gap-2 md:gap-3 content-start",
                  !currentQuestion.imageUrl && currentQuestion.options.length <= 4 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                )}
              >
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === idx;
                  const isCorrect = currentQuestion.correctAnswer === idx;
                  const feedback = showExplanation && (isCorrect ? 'correct' : isSelected ? 'wrong' : null);

                  return (
                    <motion.button
                      key={idx}
                      variants={variants.listItem}
                      whileHover={{ scale: 1.01, x: 5, backgroundColor: "hsl(var(--primary) / 0.01)" }}
                      whileTap={{ scale: 0.98 }}
                      animate={
                        feedback === 'correct' ? {
                          scale: [1, 1.03, 1],
                          backgroundColor: ["rgba(16,185,129,0)", "rgba(16,185,129,0.1)", "rgba(16,185,129,0.05)"],
                          transition: { duration: 0.4 }
                        } :
                        feedback === 'wrong' ? {
                          x: [0, -10, 10, -10, 10, 0],
                          backgroundColor: ["rgba(239,68,68,0)", "rgba(239,68,68,0.1)", "rgba(239,68,68,0.05)"],
                          transition: { duration: 0.4 }
                        } :
                        isSelected && !showExplanation ? {
                          scale: [1, 1.02, 1],
                          transition: { duration: 0.2 }
                        } : {}
                      }
                      disabled={showExplanation}
                      onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border-2 transition-all duration-200 flex flex-col gap-1.5 font-bold text-sm md:text-base h-fit relative overflow-hidden group",
                        isSelected && !showExplanation ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" :
                        feedback === 'correct' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" :
                        feedback === 'wrong' ? "border-red-500 bg-red-50 dark:bg-red-500/10 text-red-900 dark:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/30"
                      )}
                    >
                      {/* Interactive Sparkle for correct answer */}
                      {feedback === 'correct' && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0, rotate: -45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          className="absolute top-2 right-2 text-emerald-500 z-20"
                        >
                          <Sparkles size={18} className="animate-pulse" />
                        </motion.div>
                      )}

                      {/* Ripple effect on selection */}
                      {isSelected && !showExplanation && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0.5 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 bg-primary/20 pointer-events-none rounded-xl"
                        />
                      )}

                      <div className="flex items-start gap-3 relative z-10">
                        <div className={cn(
                            "w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black transition-all",
                            isSelected || feedback === 'correct' ? "bg-primary border-primary text-white shadow-lg scale-110" :
                            "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 group-hover:border-primary/50 group-hover:text-primary"
                          )}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={cn(
                          "leading-tight pt-1 text-sm md:text-base transition-colors",
                          isSelected && !showExplanation ? "text-primary" : ""
                        )}>{option}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              {showExplanation && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-900/30">
                   <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ShieldCheck size={12}/> Highway Code Logic</p>
                   <p className="text-xs md:text-sm font-bold text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed italic">"{currentQuestion.explanation}"</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* COMPACT FOOTER */}
          <div className="mt-auto pt-6 pb-6 space-y-3">
             <div className="flex items-center gap-3">
                {currentQuestionIndex > 0 && (
                   <Button variant="outline" size="lg" onClick={() => setCurrentQuestionIndex(c => c - 1)} className="h-14 px-6 rounded-xl border-2 font-black text-slate-400 hover:text-slate-600 transition-all">
                      <ChevronLeft size={20} />
                   </Button>
                )}

                {isLastQuestion ? (
                  <Button onClick={() => handleSubmit()} disabled={!isAnswered} className="flex-1 h-14 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-black text-base uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                    Submit Final Exam
                  </Button>
                ) : (
                  <Button onClick={() => setCurrentQuestionIndex(c => c + 1)} disabled={!isAnswered} className="flex-1 h-14 rounded-xl bg-primary text-white hover:bg-primary/90 font-black text-base uppercase tracking-widest shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                    Next Question <ChevronRight size={20} />
                  </Button>
                )}
             </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Finish Now?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-500">You have unanswered items. Finalize anyway?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl h-11 font-bold border-2">Review</AlertDialogCancel>
            <AlertDialogAction className="bg-primary text-white rounded-xl h-11 font-black" onClick={() => handleSubmit(true)}>Finish & Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
