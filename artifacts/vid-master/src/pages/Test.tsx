import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useStartTest, useSubmitTest, StartTestInputMode } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, ArrowRight, CheckCircle2, Volume2, VolumeX, Info, Flag, ChevronLeft, ChevronRight, X as CloseIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { speak, stopSpeaking } from "@/lib/voice";
import type { TestSession, AnswerInput } from "@workspace/api-client-react";
import { getOfflineQuestions } from "@/lib/offline";
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

export default function TestPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const startTest = useStartTest();
  const submitTest = useSubmitTest();

  const [mode, setMode] = useState<StartTestInputMode>("timed");
  const [session, setSession] = useState<TestSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleStart = () => {
    if (!navigator.onLine) {
      const offlineQuestions = getOfflineQuestions();
      if (!offlineQuestions.length) {
        toast({ title: "No Offline Data", description: "Please connect to the internet once to sync questions.", variant: "destructive" });
        return;
      }

      // Local shuffle and select 25
      const shuffled = [...offlineQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 25);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 8 * 60 * 1000);

      setSession({
        sessionId: `offline-${Date.now()}`,
        questions: selected,
        mode: mode,
        startedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        durationSeconds: 8 * 60
      } as any);

      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowExplanation(false);
      setTimeLeft(mode === "timed" ? 8 * 60 : null);

      toast({ title: "Offline Exam Started" });
      return;
    }

    startTest.mutate(
      { data: { mode } },
      {
        onSuccess: (data) => {
          setSession(data);
          setCurrentQuestionIndex(0);
          setAnswers({});
          setShowExplanation(false);

          if (data.mode === "timed" && data.expiresAt) {
            const expires = new Date(data.expiresAt).getTime();
            const now = new Date().getTime();
            setTimeLeft(Math.max(0, Math.floor((expires - now) / 1000)));
          } else {
            setTimeLeft(null);
          }
        },
        onError: (err) => {
          toast({
            title: "Failed to start test",
            description: err.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  const toggleVoice = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speak(text);
      setIsSpeaking(true);
    }
  };

  // Auto-stop voice when question changes
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setShowExplanation(false);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft === null || !session) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, session]);

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));

    // In practice mode, automatically show explanation if answer is selected
    if (mode === "practice") {
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (!session) return;
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!session) return;

    const formattedAnswers: AnswerInput[] = Object.entries(answers).map(([qId, ans]) => ({
      questionId: parseInt(qId, 10),
      selectedAnswer: ans,
    }));

    if (!navigator.onLine || session.sessionId.startsWith('offline-')) {
      let score = 0;
      session.questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) score++;
      });
      toast({ title: "Offline Score", description: `You scored ${score}/${session.questions.length}` });
      setSession(null);
      setLocation('/dashboard');
      return;
    }

    submitTest.mutate(
      { sessionId: session.sessionId, data: { answers: formattedAnswers } },
      {
        onSuccess: (result) => {
          toast({
            title: "Test Submitted",
            description: `You scored ${result.score}/${result.total}`,
          });
          setLocation(`/test/${session.sessionId}/results`);
        },
        onError: (err) => {
          toast({
            title: "Failed to submit test",
            description: err.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <div className="p-8 w-full min-h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg border-0 ring-1 ring-border rounded-3xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Start Exam Simulator</CardTitle>
            <CardDescription className="font-medium">25 questions, 8 minutes, 88% to pass.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as StartTestInputMode)} className="space-y-3">
              <div className={cn("flex items-start space-x-3 rounded-2xl border p-4 cursor-pointer transition-all", mode === 'timed' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200")} onClick={() => setMode('timed')}>
                <RadioGroupItem value="timed" id="timed" className="mt-1" />
                <Label htmlFor="timed" className="cursor-pointer flex-1">
                  <div className="font-bold text-slate-900">Timed Mock Exam</div>
                  <div className="text-xs text-slate-500">Official conditions simulator.</div>
                </Label>
              </div>
              <div className={cn("flex items-start space-x-3 rounded-2xl border p-4 cursor-pointer transition-all", mode === 'practice' ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:border-slate-200")} onClick={() => setMode('practice')}>
                <RadioGroupItem value="practice" id="practice" className="mt-1" />
                <Label htmlFor="practice" className="cursor-pointer flex-1">
                  <div className="font-bold text-slate-900">Practice Mode</div>
                  <div className="text-xs text-slate-500">Study with immediate feedback.</div>
                </Label>
              </div>
            </RadioGroup>
            <Button className="w-full font-black h-12 rounded-xl" size="lg" onClick={handleStart} disabled={startTest.isPending}>
              {startTest.isPending ? "Loading..." : "Start Simulation"}
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
  const isTimeLow = timeLeft !== null && timeLeft <= 60;

  return (
    <div className="fixed inset-0 lg:left-72 bg-white flex flex-col z-[40]">

      {/* Header with Integrated Navigation (ON TOP) */}
      <div className="bg-white border-b px-6 py-5 md:py-6 flex flex-col md:flex-row items-center gap-6 shrink-0 shadow-sm relative z-50">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
           <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="font-bold h-10 px-4 border-2">
             <ChevronLeft className="w-4 h-4 mr-1" /> Prev
           </Button>

           <div className="md:hidden flex items-center gap-3">
             {timeLeft !== null && (
               <div className={cn("font-mono font-black text-xl px-2", isTimeLow ? "text-destructive animate-pulse" : "text-slate-900")}>
                 {formatTime(timeLeft)}
               </div>
             )}
           </div>

           {isLastQuestion ? (
             <Button size="sm" onClick={handleSubmit} disabled={submitTest.isPending || !isAnswered} className="bg-emerald-600 hover:bg-emerald-700 font-bold h-10 px-6 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
               Finish Exam
             </Button>
           ) : (
             <Button size="sm" onClick={handleNext} disabled={!isAnswered} className="font-bold h-10 px-8 shadow-lg shadow-primary/20 disabled:opacity-50">
               Next <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
           )}
        </div>

        <div className="flex-1 flex flex-col gap-2.5 w-full">
           <div className="flex justify-between items-center px-1">
             <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]">Question {currentQuestionIndex + 1} of {session.questions.length}</span>
             <span className="text-sm font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">{Math.round(progress)}% Complete</span>
           </div>
           <Progress value={progress} className="h-2 rounded-full" />
        </div>

        <div className="flex items-center gap-3 md:pl-4 md:border-l">
           {timeLeft !== null && (
             <div className="flex flex-col items-center md:items-end">
               <div className={cn("font-mono font-black text-2xl leading-none", isTimeLow ? "text-destructive animate-pulse" : "text-slate-900")}>
                 {formatTime(timeLeft)}
               </div>
             </div>
           )}
           <div className="flex items-center gap-1.5 ml-2">
             <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-xl", isSpeaking ? "text-primary bg-primary/10" : "text-muted-foreground")} onClick={() => toggleVoice(`${currentQuestion.text}.`)}>
               <Volume2 className="w-5 h-5" />
             </Button>

             <AlertDialog>
               <AlertDialogTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-colors">
                   <CloseIcon className="w-5 h-5" />
                 </Button>
               </AlertDialogTrigger>
               <AlertDialogContent className="rounded-[2rem] max-w-[90vw] md:max-w-md">
                 <AlertDialogHeader>
                   <AlertDialogTitle className="text-2xl font-black">Abandon Exam?</AlertDialogTitle>
                   <AlertDialogDescription className="text-slate-500 font-medium">
                     Your current progress and all answers for this session will be discarded. This action cannot be undone.
                   </AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4">
                   <AlertDialogCancel className="rounded-2xl h-12 font-black border-2 flex-1 mt-0">Keep Going</AlertDialogCancel>
                   <AlertDialogAction
                     className="bg-destructive text-white hover:bg-destructive/90 rounded-2xl h-12 font-black flex-1 shadow-lg shadow-destructive/20"
                     onClick={() => {
                        setSession(null);
                        setLocation('/dashboard');
                     }}
                    >
                     Yes, Quit Test
                   </AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
           </div>
        </div>
      </div>

      {/* FIXED VIEWPORT CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">

        {/* Media Area */}
        {currentQuestion.imageUrl && (
          <div className="w-full lg:w-1/2 h-[35%] lg:h-full bg-slate-50 border-r border-b lg:border-b-0 flex items-center justify-center p-6 shrink-0">
             <img src={currentQuestion.imageUrl} className="max-h-full max-w-full object-contain drop-shadow-xl" alt="Sign" />
          </div>
        )}

        {/* Question Area */}
        <div className={cn(
          "flex-1 flex flex-col p-4 md:p-8",
          !currentQuestion.imageUrl && "max-w-4xl mx-auto w-full"
        )}>
          <div className="mb-2 shrink-0">
            <Badge variant="secondary" className="uppercase font-black text-[9px] mb-1">{currentQuestion.category}</Badge>
            <h2 className="text-xl md:text-2xl font-black leading-tight text-slate-900">
              {currentQuestion.text}
            </h2>
          </div>

          <div className={cn(
            "flex-1 grid gap-3 min-h-0 overflow-y-auto pr-2 custom-scrollbar content-start pb-6",
            !currentQuestion.imageUrl ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              const isCorrect = currentQuestion.correctAnswer === idx;
              const isActuallyCorrect = isCorrect && showExplanation;
              const isWrong = isSelected && !isCorrect && showExplanation;

              return (
                <button
                  key={idx}
                  disabled={showExplanation}
                  onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 font-bold text-sm md:text-base h-fit",
                    isSelected && !showExplanation ? "border-primary bg-primary/5" :
                    isActuallyCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" :
                    isWrong ? "border-destructive bg-destructive/5 text-destructive" : "border-slate-100 bg-white"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-[10px]",
                    isSelected ? "bg-primary border-primary text-white" :
                    isActuallyCorrect ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-slate-400"
                  )}>
                    {idx + 1}
                  </div>
                  <span className="leading-tight">{option}</span>
                </button>
              );
            })}

            {showExplanation && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("p-4 rounded-xl bg-primary/5 border border-primary/20", !currentQuestion.imageUrl && "md:col-span-2")}>
                <p className="text-[10px] font-black text-primary uppercase mb-1">Explanation</p>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">{currentQuestion.explanation}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
