import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Plus, Edit, Trash2, CheckCircle2, Megaphone,
  Layers, Send, Sparkles, FileText, Globe
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface RoadRule {
  id: number;
  title: string;
  category: string;
  content: string;
  published: boolean;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
  active: boolean;
}

export default function ContentManagement() {
  const { toast } = useToast();

  const [rules, setRules] = useState<RoadRule[]>([
    { id: 1, title: "SADC Speed Limits on Freeways", category: "Speed Regulations", content: "General freeways in Zimbabwe carry a 120 km/h limit for light passenger vehicles.", published: true },
    { id: 2, title: "Four-Way Stop Priority Rule", category: "Intersections", content: "Vehicles proceed in order of arrival. First vehicle to stop has the right of way.", published: true },
    { id: 3, title: "Overtaking on Solid White Line", category: "Road Markings", content: "Cross unbroken single or double white lines only when avoiding a stationary hazard.", published: true }
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 101, title: "Updated VID 2026 Question Bank", message: "New SADC signs added to mock exams.", date: "2026-09-15", active: true }
  ]);

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({ title: "", category: "Road Rules", content: "" });

  const handleCreateRule = () => {
    if (!newRule.title || !newRule.content) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const created: RoadRule = {
      id: Date.now(),
      title: newRule.title,
      category: newRule.category,
      content: newRule.content,
      published: true
    };

    setRules([created, ...rules]);
    toast({ title: "Road Rule Published", description: "Updated curriculum content." });
    setIsRuleModalOpen(false);
    setNewRule({ title: "", category: "Road Rules", content: "" });
  };

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
    toast({ title: "Road Rule Deleted" });
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-0.5 border-0">
              Curriculum CMS
            </Badge>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SADC & VID Standards</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">Content & Rules CMS</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
            Road Rules &bull; Learning Materials &bull; System Announcements
          </p>
        </div>

        <div className="relative z-10 w-full sm:w-auto">
          <Button
            onClick={() => setIsRuleModalOpen(true)}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest gap-2 shadow-xl hover:bg-primary/90"
          >
            <Plus size={16} /> Add Road Rule
          </Button>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen size={16} className="text-primary" /> Active Road Rules & Curriculum
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-start justify-between">
                <div>
                  <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-primary/20 text-primary mb-1">
                    {rule.category}
                  </Badge>
                  <CardTitle className="text-sm font-black uppercase text-slate-900 dark:text-white">{rule.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-500"
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{rule.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Rule Dialog */}
      <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">Add Road Rule</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Publish new road regulation or learning material
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">Title</Label>
              <Input
                placeholder="Rule Title"
                className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs font-bold"
                value={newRule.title}
                onChange={e => setNewRule({...newRule, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">Content Explanation</Label>
              <Textarea
                placeholder="Write full rule explanation..."
                className="rounded-xl bg-slate-50 border-slate-200 text-xs font-bold min-h-[100px]"
                value={newRule.content}
                onChange={e => setNewRule({...newRule, content: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl h-11 font-black uppercase text-[9px] tracking-widest" onClick={() => setIsRuleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRule} className="rounded-xl h-11 px-6 font-black uppercase text-[9px] tracking-widest gap-2 bg-primary text-white">
              Publish Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
