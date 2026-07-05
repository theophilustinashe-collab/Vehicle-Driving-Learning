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
  Camera,
  Eye,
  Smartphone,
  Lightbulb,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

export default function ExamGuidePage() {
  const steps = [
    {
      title: "Essential Documents",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      items: [
        "Original National ID Card (Metal, Poly-Carbonate or Plastic)",
        "Original Birth Certificate (if using a Plastic/Green ID)",
        "2 Passport-sized color photos (White background preferred)",
        "Proof of Residence (within the last 3 months)"
      ]
    },
    {
      title: "Costs & Fees",
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      items: [
        "Exam Fee: $20.00 USD (Payable at the accounts desk)",
        "Carry extra cash for the Eye Testing fee",
        "Keep your receipt safe—you will need it for the room entry",
        "Fees are valid for 1 attempt only"
      ]
    },
    {
      title: "The Test Format",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      items: [
        "25 Multiple-choice questions",
        "Time limit: Exactly 8 Minutes",
        "Pass Mark: 25/25 (100%) required",
        "Testing is conducted on touch-screen computers"
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-primary uppercase">The Exam Day Guide</h1>
        <p className="text-muted-foreground font-bold">Your step-by-step roadmap to success at the VID Depot.</p>
      </div>

      <Card className="border-0 shadow-2xl ring-1 ring-border bg-slate-900 text-white overflow-hidden relative rounded-[2.5rem]">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <ShieldCheck className="w-48 h-48" />
        </div>
        <CardHeader className="pt-10">
          <CardTitle className="flex items-center gap-3 text-2xl font-black">
            <ClipboardCheck className="w-7 h-7 text-primary" />
            FINAL CHECKLIST
          </CardTitle>
          <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Review these before you leave for the depot
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="bg-primary/20 p-2 rounded-lg"><UserCircle className="w-6 h-6 text-primary" /></div>
              <span className="text-sm font-black">Original National ID</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="bg-primary/20 p-2 rounded-lg"><Camera className="w-6 h-6 text-primary" /></div>
              <span className="text-sm font-black">2 Professional Passport Photos</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="bg-primary/20 p-2 rounded-lg"><CreditCard className="w-6 h-6 text-primary" /></div>
              <span className="text-sm font-black">$20 USD Testing Fee</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="bg-primary/20 p-2 rounded-lg"><MapPin className="w-6 h-6 text-primary" /></div>
              <span className="text-sm font-black">Arrive by 07:30 AM Sharp</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <Card key={i} className="border-0 shadow-lg ring-1 ring-slate-200/60 h-full rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
              <div className={`${step.bg} ${step.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-inner`}>
                <step.icon className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg font-black text-slate-900">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {step.items.map((item, j) => (
                  <li key={j} className="text-[13px] font-bold text-slate-600 flex gap-3 leading-snug">
                    <div className="mt-1"><div className="w-1.5 h-1.5 rounded-full bg-primary" /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="bg-amber-50 border-0 ring-1 ring-amber-200 rounded-3xl p-2">
            <CardHeader>
              <CardTitle className="text-amber-800 text-lg font-black flex items-center gap-2">
                <Eye className="w-5 h-5" />
                The Eye Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-900 leading-relaxed font-bold">
                Before entering the exam room, an officer will test your vision. You must read letters on a chart from a specific distance. If you wear glasses, make sure to bring them!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-0 ring-1 ring-red-200 rounded-3xl p-2">
            <CardHeader>
              <CardTitle className="text-red-800 text-lg font-black flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Strict Regulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-900 leading-relaxed font-bold">
                Mobile phones must be switched OFF before entering. Any suspicion of cheating or communication will result in immediate disqualification and a ban from the depot.
              </p>
            </CardContent>
          </Card>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-primary/5 border-2 border-dashed border-primary/20 text-center space-y-4">
         <Lightbulb className="w-10 h-10 text-primary mx-auto" />
         <h3 className="text-xl font-black text-primary">MASTER'S PRO-TIP</h3>
         <p className="text-slate-700 font-bold max-w-2xl mx-auto leading-relaxed text-sm italic">
           "The most common reason people fail isn't lack of knowledge—it's **PANIC**. 8 minutes is more than enough time if you stay calm. Read the question, look at the options, and trust your training. In our simulator, you learned to be fast and accurate. Do exactly that!"
         </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
        <Link href="/test">
          <Button size="lg" className="h-16 px-10 rounded-2xl font-black text-lg gap-2 shadow-2xl shadow-primary/30 hover:scale-105 transition-transform w-full sm:w-auto">
            Run One Last Mock Exam
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
        <Link href="/dashboard">
           <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl font-black text-lg border-2 w-full sm:w-auto animate-car-indicator">
             <ArrowLeft className="w-5 h-5 mr-2" /> Return to Dashboard
           </Button>
        </Link>
      </div>
    </div>
  );
}
