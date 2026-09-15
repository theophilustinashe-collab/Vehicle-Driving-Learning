import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LifeBuoy,
  MessageSquare,
  AlertTriangle,
  Mail,
  ExternalLink,
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearch } from "wouter";

export default function SupportPage() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const isReport = searchParams.get("report") === "true";
  const initialQuestionId = searchParams.get("questionId") || "";

  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [issueType, setIssueType] = useState(isReport ? "Incorrect Question" : "Improvement Suggestion");
  const [questionId, setQuestionId] = useState(initialQuestionId);

  useEffect(() => {
    if (isReport) {
      setIssueType("Incorrect Question");
    }
    if (initialQuestionId) {
      setQuestionId(initialQuestionId);
    }
  }, [isReport, initialQuestionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: "Feedback Received",
      description: "Thank you for helping us improve Roadify!",
    });
  };

  return (
    <div className="p-3 md:p-4 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-primary uppercase leading-none">Support Hub</h1>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Engineering Assistance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl overflow-hidden bg-white">
          <CardHeader className="p-4 pb-1">
            <Mail className="w-4 h-4 text-primary mb-1.5" />
            <CardTitle className="text-[11px] font-black uppercase tracking-widest">Email System</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-2">24h Response Protocol</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 font-black text-[9px] uppercase tracking-widest justify-start gap-2 rounded-lg"
              onClick={() => window.open("mailto:roadifyzim@gmail.com?subject=Roadify Support Request")}
            >
              <Mail className="w-3 h-3" />
              Open Client
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl overflow-hidden bg-white">
          <CardHeader className="p-4 pb-1">
            <MessageSquare className="w-4 h-4 text-emerald-500 mb-1.5" />
            <CardTitle className="text-[11px] font-black uppercase tracking-widest">WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-2">Direct Intelligence Link</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 font-black text-[9px] uppercase tracking-widest rounded-lg"
              onClick={() => window.open("https://wa.me/263778230962", "_blank")}
            >
              +263 77 823 0962
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl overflow-hidden bg-white">
          <CardHeader className="p-4 pb-1">
            <ExternalLink className="w-4 h-4 text-blue-500 mb-1.5" />
            <CardTitle className="text-[11px] font-black uppercase tracking-widest">FAQ Base</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mb-2">Self-Service Archives</p>
            <Button variant="outline" size="sm" className="w-full h-8 font-black text-[9px] uppercase tracking-widest rounded-lg">Access Data</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-lg ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-white h-full">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Report Anomaly
              </CardTitle>
              <CardDescription className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter">
                Identify curriculum errors or system bugs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">Telemetry Sent</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-xs">
                    Engineering will review your report shortly.
                  </p>
                  <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest" onClick={() => setSubmitted(false)}>New Report</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Type</label>
                      <select
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                      >
                        <option>Incorrect Question</option>
                        <option>App Bug</option>
                        <option>Suggestion</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Record ID</label>
                      <Input
                        placeholder="e.g. #423"
                        className="h-9 rounded-lg border-slate-200 text-xs font-bold"
                        value={questionId}
                        onChange={(e) => setQuestionId(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Description</label>
                    <Textarea
                      placeholder="Detail the anomaly here..."
                      className="min-h-[100px] rounded-lg border-slate-200 text-xs font-medium"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 rounded-xl mt-2">
                    Submit Telemetry
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-primary/5">
            <CardHeader className="p-5 pb-1">
              <CardTitle className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                Intelligence Base
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-3">
              <div className="space-y-0.5 border-b border-primary/10 pb-2.5">
                <p className="text-[10px] font-black text-slate-900 leading-tight uppercase">"Question Pool?"</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">25 questions per mock exam. 8 minute window.</p>
              </div>
              <div className="space-y-0.5 border-b border-primary/10 pb-2.5">
                <p className="text-[10px] font-black text-slate-900 leading-tight uppercase">"Pass mark?"</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">100% required. 25/25 accuracy.</p>
              </div>
              <div className="space-y-0.5 pb-1">
                <p className="text-[10px] font-black text-slate-900 leading-tight uppercase">"Local access?"</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Yes, the syllabus works offline after sync.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="p-5 pb-1">
              <CardTitle className="text-[11px] font-black uppercase tracking-widest">Accreditation</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed tracking-tighter">
                Roadify is an independent terminal designed for SADC curriculum mastery. 100% alignment with official VID standards.
              </p>
              <div className="mt-4 pt-3 border-t flex justify-between items-center opacity-40">
                <span className="text-[8px] font-black uppercase tracking-widest">Version 1.0.1 (Gold)</span>
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">© 2026 Roadify</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
