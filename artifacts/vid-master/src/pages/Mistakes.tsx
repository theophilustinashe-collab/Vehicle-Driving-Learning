import { useState } from "react";
import { useListQuestions, useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ChevronDown, CheckCircle2, ArrowLeft, PlayCircle, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "wouter";

export default function MistakesPage() {
  const { data: dashboard } = useGetDashboard();

  // For now, we simulate the "Mistake Bank" by filtering questions from the last session
  // In a full implementation, we'd have a specific /mistakes API endpoint
  const { data: allQuestions, isLoading } = useListQuestions({ limit: 500 });

  // Mock filter: In a real app, this would come from the 'mistakes' table via API
  const mistakeQuestions = allQuestions?.filter(q => q.id % 7 === 0).slice(0, 10) || [];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Mistake Bank</h1>
          <p className="text-muted-foreground">Focus on the questions you missed to achieve mastery.</p>
        </div>
      </div>

      {mistakeQuestions.length === 0 ? (
        <Card className="border-dashed border-2 py-12 flex flex-col items-center text-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-xl font-bold">No Mistakes Recorded!</h3>
            <p className="text-muted-foreground max-w-sm px-4">Your record is clean. Keep practicing to maintain your perfection.</p>
          </div>
          <Link href="/test">
            <Button className="font-bold gap-2">
              <PlayCircle className="w-4 h-4" /> Take a Mock Exam
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-black text-sm uppercase tracking-widest text-muted-foreground">
              {mistakeQuestions.length} Questions to Review
            </h2>
            <Link href="/test?mode=mistakes">
              <Button size="sm" variant="outline" className="font-bold border-primary/20 text-primary">
                Practice These Only
              </Button>
            </Link>
          </div>

          {mistakeQuestions.map((q) => (
            <Card key={q.id} className="overflow-hidden border-destructive/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="destructive" className="uppercase text-[9px] font-black">Frequent Mistake</Badge>
                  <Badge variant="secondary" className="uppercase text-[9px] font-black">{q.category}</Badge>
                </div>

                <h3 className="text-lg font-bold mb-6">{q.text}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {q.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border-2 text-sm flex items-start gap-3 ${idx === q.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'bg-muted/30 border-transparent'}`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${idx === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20'}`}>
                        {idx === q.correctAnswer ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[10px]">{idx + 1}</span>}
                      </div>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between hover:bg-primary/5 text-primary font-bold">
                      Master this topic <ChevronDown className="w-4 h-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm space-y-2">
                      <p className="font-bold text-primary flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> The Highway Code Says:
                      </p>
                      <p className="leading-relaxed text-slate-700 font-medium">
                        {q.explanation}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
