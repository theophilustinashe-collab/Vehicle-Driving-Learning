import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStartTest, useSubmitTest, StartTestInputMode } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertTriangle, ArrowRight, CheckCircle2, Volume2, VolumeX, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { speak, stopSpeaking } from "@/lib/voice";
import type { TestSession, AnswerInput } from "@workspace/api-client-react";

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
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Ready to test your knowledge?</CardTitle>
            <CardDescription>Choose a mode to begin your mock exam.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as StartTestInputMode)} className="space-y-4">
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <RadioGroupItem value="timed" id="timed" className="mt-1" />
                <Label htmlFor="timed" className="cursor-pointer flex-1">
                  <div className="font-semibold text-base mb-1">Timed Mock Exam</div>
                  <div className="text-sm text-muted-foreground">
                    25 questions, 8 minutes. Simulates the real VID exam conditions. Pass mark is 100%.
                  </div>
                </Label>
              </div>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <RadioGroupItem value="practice" id="practice" className="mt-1" />
                <Label htmlFor="practice" className="cursor-pointer flex-1">
                  <div className="font-semibold text-base mb-1">Practice Mode</div>
                  <div className="text-sm text-muted-foreground">
                    No time limit. Take your time to carefully read and answer questions.
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleStart} 
              disabled={startTest.isPending}
            >
              {startTest.isPending ? "Starting..." : "Start Test"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === session.questions.length - 1;
  const progress = ((currentQuestionIndex) / session.questions.length) * 100;
  
  const isTimeLow = timeLeft !== null && timeLeft <= 60;

  return (
    <div className="p-2 md:p-6 max-w-4xl mx-auto h-[calc(100vh-160px)] lg:h-auto flex flex-col gap-2">
      <div className="flex items-center justify-between bg-card p-3 rounded-xl shadow-sm border sticky top-0 z-10">
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Question {currentQuestionIndex + 1}/{session.questions.length}</span>
            <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        
        {timeLeft !== null && (
          <div className={`ml-4 flex items-center gap-1.5 font-mono text-lg font-black px-3 py-1.5 rounded-lg border-2 ${isTimeLow ? 'bg-destructive/10 border-destructive/50 text-destructive animate-pulse' : 'bg-primary/5 border-primary/20 text-primary'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-2 rounded-full", isSpeaking ? "text-primary bg-primary/10" : "text-muted-foreground")}
          onClick={() => toggleVoice(`${currentQuestion.text}. Options are: ${currentQuestion.options.join(". ")}`)}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </div>

      <Card className="flex-1 shadow-md border-0 ring-1 ring-border overflow-hidden flex flex-col">
        <CardContent className="p-4 md:p-8 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-secondary/20 text-secondary-foreground text-[10px] font-black uppercase tracking-widest border border-secondary/30">
                  {currentQuestion.category}
                </div>
                {mode === "practice" && (
                   <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                     <Info className="w-3 h-3" /> Practice Mode
                   </div>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-bold leading-snug text-foreground">
                {currentQuestion.text}
              </h2>
              {currentQuestion.imageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border bg-muted/30 shadow-inner">
                  <img src={currentQuestion.imageUrl} alt="Question figure" className="max-h-40 md:max-h-64 w-full object-contain mx-auto" />
                </div>
              )}
            </div>

            <div className="space-y-2 pb-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                const isCorrect = currentQuestion.correctAnswer === idx;

                let buttonStyle = "border-muted bg-card hover:border-primary/30 hover:bg-muted/50";
                if (mode === "practice" && showExplanation) {
                  if (isCorrect) buttonStyle = "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20";
                  else if (isSelected) buttonStyle = "border-destructive bg-destructive/5 shadow-sm";
                } else if (isSelected) {
                  buttonStyle = "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20";
                }

                return (
                  <button
                    key={idx}
                    disabled={mode === "practice" && showExplanation}
                    onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 flex items-start gap-3",
                      buttonStyle
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      isSelected ? (mode === "practice" && showExplanation && !isCorrect ? "border-destructive bg-destructive" : "border-primary bg-primary") :
                      (mode === "practice" && showExplanation && isCorrect ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30")
                    )}>
                      {(isSelected || (mode === "practice" && showExplanation && isCorrect)) && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm md:text-base font-bold leading-tight">{option}</span>
                  </button>
                );
              })}
            </div>

            {mode === "practice" && showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 mb-6"
              >
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                  <Info className="w-4 h-4" /> Why this is the answer:
                </div>
                <p className="text-sm leading-relaxed text-slate-700 font-medium">
                  {currentQuestion.explanation}
                </p>
                <div className="pt-2">
                   <Button size="sm" className="font-bold" onClick={handleNext}>
                     Continue to Next <ArrowRight className="ml-2 w-4 h-4" />
                   </Button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t bg-card">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
              className="font-bold border-2"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {isLastQuestion ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitTest.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold px-6 shadow-lg shadow-emerald-500/20"
                >
                  {submitTest.isPending ? "Submitting..." : "Finish Exam"}
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2 font-bold px-6 shadow-lg shadow-primary/20">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
