import { useRoute, Link } from "wouter";
import { useGetTestResult } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function TestResults() {
  const [match, params] = useRoute("/test/:sessionId/results");
  const sessionId = params?.sessionId;

  const { data: result, isLoading } = useGetTestResult(sessionId || "", {
    query: {
      enabled: !!sessionId,
    } as any
  });

  if (!match || !sessionId) return null;

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Result not found</h2>
        <Link href="/dashboard">
          <Button className="mt-4">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
      </div>

      <Card className={`border-t-4 ${result.passed ? 'border-t-emerald-500' : 'border-t-destructive'}`}>
        <CardContent className="pt-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-muted mb-4">
              {result.passed ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              ) : (
                <XCircle className="w-10 h-10 text-destructive" />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {result.passed ? "Congratulations, you passed!" : "Keep practicing, you failed."}
            </h2>
            <p className="text-muted-foreground">
              You scored {result.score} out of {result.total}. The passing score is {result.total}.
            </p>
            <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
              <Link href="/test">
                <Button className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-64 bg-card rounded-xl border p-6 text-center shadow-sm">
            <div className="text-5xl font-black mb-2">{result.percentage}%</div>
            <Progress 
              value={result.percentage} 
              className="h-3 mb-2" 
              indicatorClassName={result.passed ? "bg-emerald-500" : "bg-destructive"}
            />
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Final Score</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Review Your Answers</h3>
        
        {result.answers?.map((ans, idx) => (
          <Card key={ans.questionId} className={`border-l-4 ${ans.isCorrect ? 'border-l-emerald-500' : 'border-l-destructive'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-muted-foreground">Question {idx + 1}</div>
                {ans.isCorrect ? (
                  <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> CORRECT
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded">
                    <XCircle className="w-3 h-3 mr-1" /> INCORRECT
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="font-medium text-lg">Question details will be fetched in full review mode. ID: {ans.questionId}</p>
                <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-2">
                  <div className="flex gap-2">
                    <span className="font-semibold w-24 shrink-0">Your Answer:</span>
                    <span>Option {ans.selectedAnswer + 1}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold w-24 shrink-0">Correct Answer:</span>
                    <span>Option {ans.correctAnswer + 1}</span>
                  </div>
                </div>
                {ans.explanation && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium text-primary">Explanation:</p>
                    <p className="text-sm mt-1">{ans.explanation}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
