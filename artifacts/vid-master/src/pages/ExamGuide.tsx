import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  UserCircle,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Camera
} from "lucide-react";
import { Link } from "wouter";

export default function ExamGuidePage() {
  const steps = [
    {
      title: "Required Documents",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50",
      items: [
        "National ID Card (Original & 2 Photocopies)",
        "2 Passport-sized color photos",
        "Original Birth Certificate",
        "Provisional Fee (Approx. $20 USD / RTGS Equivalent)"
      ]
    },
    {
      title: "Arrival & Logistics",
      icon: MapPin,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      items: [
        "Arrive at the VID depot by 7:30 AM",
        "Join the queue for Eye Testing",
        "Wait for your name to be called for the room assignment",
        "Switch off your mobile phone completely"
      ]
    },
    {
      title: "Inside the Exam Room",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
      items: [
        "The test is 25 multiple-choice questions",
        "You have exactly 8 minutes to finish",
        "The pass mark is 100% (All 25 must be correct)",
        "Stay calm and read every question twice"
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Exam Day Guide</h1>
        <p className="text-muted-foreground">Everything you need to know for your VID Provisional Test.</p>
      </div>

      <Card className="border-0 shadow-lg ring-1 ring-border bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <ShieldCheck className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Official Checklist
          </CardTitle>
          <CardDescription className="text-slate-300">Don't leave home without these items.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <UserCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold">National ID (Original)</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold">2 Passport Photos</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold">Cash for Exam Fees</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold">Arrive 1 hour early</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <Card key={i} className="border-0 shadow-sm ring-1 ring-border h-full">
            <CardHeader className="pb-2">
              <div className={`${step.bg} ${step.color} w-10 h-10 rounded-xl flex items-center justify-center mb-2`}>
                <step.icon className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {step.items.map((item, j) => (
                  <li key={j} className="text-xs font-medium text-slate-600 flex gap-2">
                    <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800 text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Pro-Tip for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-900 leading-relaxed font-medium">
            "The computer system at the VID depot can feel different from your phone. Take your time to click precisely on the answer you want. If you finish early, DO NOT click 'Submit' immediately—re-read every answer one last time. Every single mark counts!"
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-8">
        <Link href="/test">
          <Button size="lg" className="h-14 px-8 font-black text-lg gap-2 shadow-xl hover:scale-105 transition-transform">
            Practice One Last Time
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
