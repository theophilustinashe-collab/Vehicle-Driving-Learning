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
      description: "Thank you for helping us improve VID Master!",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Help & Support</h1>
        <p className="text-muted-foreground">Need help or found an issue? We're here for you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <Mail className="w-5 h-5 text-primary mb-2" />
            <CardTitle className="text-base">Email Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Response within 24 hours</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full font-bold justify-start gap-2"
              onClick={() => window.open("mailto:vidmasterzim@gmail.com?subject=VID Master Support Request")}
            >
              <Mail className="w-3.5 h-3.5" />
              Open Mail App
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[10px] h-8 font-medium text-muted-foreground"
              onClick={() => window.open("https://mail.google.com/mail/?view=cm&fs=1&to=vidmasterzim@gmail.com", "_blank")}
            >
              Open in Gmail Web
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <MessageSquare className="w-5 h-5 text-emerald-500 mb-2" />
            <CardTitle className="text-base">WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Direct chat support</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full font-bold"
              onClick={() => window.open("https://wa.me/263778230962", "_blank")}
            >
              +263 77 823 0962
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <ExternalLink className="w-5 h-5 text-blue-500 mb-2" />
            <CardTitle className="text-base">FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Quick answers</p>
            <Button variant="outline" size="sm" className="w-full font-bold">Browse Articles</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-md ring-1 ring-border h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Report an Issue
              </CardTitle>
              <CardDescription>
                Found an incorrect question, a bug, or have a suggestion? Tell us below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold">Feedback Sent!</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Our team will review your report shortly. Thank you for your contribution.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another Report</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Issue Type</label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                      >
                        <option>Incorrect Question</option>
                        <option>App Bug</option>
                        <option>Improvement Suggestion</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Question ID (if known)</label>
                      <Input
                        placeholder="e.g. #423"
                        value={questionId}
                        onChange={(e) => setQuestionId(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Description</label>
                    <Textarea
                      placeholder="Please describe the issue or suggestion in detail..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 font-black text-base shadow-lg shadow-primary/20">
                    Submit Report
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-border bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Common Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 border-b pb-3">
                <p className="text-sm font-bold italic">"How many questions are in the real exam?"</p>
                <p className="text-xs text-muted-foreground">The official VID test consists of 25 questions that must be completed in 8 minutes.</p>
              </div>
              <div className="space-y-1 border-b pb-3">
                <p className="text-sm font-bold italic">"What is the pass mark for the provisional?"</p>
                <p className="text-xs text-muted-foreground">You must get at least 22 out of 25 questions correct (88%) to pass.</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold italic">"Can I take the test in Shona?"</p>
                <p className="text-xs text-muted-foreground">Yes! You can change the app language in Settings to Shona or Ndebele.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-border">
            <CardHeader>
              <CardTitle className="text-lg">About VID Master</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                VID Master is an independent study tool designed to help Zimbabwean learners prepare for their Provisional Driver's Licence. We are not officially affiliated with the VID but our curriculum is 100% aligned with official standards.
              </p>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Version 1.0.0 (Gold)</span>
                <span className="text-[10px] font-bold text-primary uppercase">© 2024 VID Master</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
