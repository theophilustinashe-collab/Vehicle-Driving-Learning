import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStartTest, useSubmitTest, StartTestInputMode } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

  const handleStart = () => {
    startTest.mutate(
      { data: { mode } },
      {
        onSuccess: (data) => {
          setSession(data);
          setCurrentQuestionIndex(0);
          setAnswers({});
          
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
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6 bg-card p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Question {currentQuestionIndex + 1} of {session.questions.length}</span>
          <div className="w-48 mt-2">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
        
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-md ${isTimeLow ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <Card className="flex-1 shadow-md border-t-4 border-t-primary">
        <CardContent className="p-6 md:p-10 flex flex-col h-full">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-xs font-bold uppercase tracking-wider mb-4">
              {currentQuestion.category}
            </div>
            <h2 className="text-xl md:text-2xl font-semibold leading-relaxed">
              {currentQuestion.text}
            </h2>
            {currentQuestion.imageUrl && (
              <div className="mt-6 rounded-lg overflow-hidden border">
                <img src={currentQuestion.imageUrl} alt="Question figure" className="max-h-64 w-auto object-contain bg-muted" />
              </div>
            )}
          </div>

          <div className="space-y-3 flex-1">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-4 ${
                  answers[currentQuestion.id] === idx 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  answers[currentQuestion.id] === idx ? 'border-primary' : 'border-muted-foreground/30'
                }`}>
                  {answers[currentQuestion.id] === idx && <div className="w-3 h-3 bg-primary rounded-full" />}
                </div>
                <span className="text-base font-medium">{option}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-3">
              {isLastQuestion ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitTest.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitTest.isPending ? "Submitting..." : "Submit Exam"}
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
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
