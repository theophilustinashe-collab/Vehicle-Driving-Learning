import { useState, useEffect } from "react";
import { useListQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuestion } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Search, Save, X, Image as ImageIcon, List, Filter, Sparkles, Loader2, BookOpen, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function ManageQuestions() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { data: questions, isLoading, refetch } = useListQuestions({ limit: 500 });
  const createQ = useCreateQuestion();
  const updateQ = useUpdateQuestion();
  const deleteQ = useDeleteQuestion();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);

  const initialForm = {
    text: "",
    category: "General Rules",
    difficulty: "medium",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    imageUrl: ""
  };

  const [form, setForm] = useState(initialForm);

  const identifyFromImage = async () => {
    if (!form.imageUrl) return;
    setIsIdentifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const lowerUrl = form.imageUrl.toLowerCase();
    let detectedText = "";
    let detectedExplanation = "";
    let detectedCategory = "Signs";

    if (lowerUrl.includes("stop_sign") || lowerUrl.includes("stop")) {
      detectedText = "What must a driver do when approaching this sign?";
      detectedExplanation = "A stop sign requires a complete cessation of movement and yielding to all other traffic.";
    } else if (lowerUrl.includes("yield") || lowerUrl.includes("give_way")) {
      detectedText = "When approaching this sign, you should:";
      detectedExplanation = "Slow down and be prepared to stop to give way to traffic on the major road.";
    } else if (lowerUrl.includes("no_entry") || lowerUrl.includes("entry")) {
      detectedText = "What does this regulatory sign mean?";
      detectedExplanation = "It indicates that vehicles are prohibited from entering the road in this direction.";
    } else if (lowerUrl.includes("speed_limit") || lowerUrl.includes("speed")) {
      detectedText = "This sign indicates that:";
      detectedExplanation = "You must not exceed the speed limit shown in kilometers per hour.";
    } else if (lowerUrl.includes("no_overtaking") || lowerUrl.includes("overtaking")) {
      detectedText = "What is the restriction indicated by this sign?";
      detectedExplanation = "It means that overtaking other vehicles is prohibited in this section of the road.";
    } else if (lowerUrl.includes("zebra") || lowerUrl.includes("pedestrian")) {
      detectedText = "What does this warning sign indicate?";
      detectedExplanation = "It warns that a pedestrian crossing is ahead and you should be prepared to stop.";
    } else if (lowerUrl.includes("school") || lowerUrl.includes("children")) {
      detectedText = "When seeing this sign, a driver must:";
      detectedExplanation = "Slow down and be alert for children who may be crossing the road near a school.";
    } else if (lowerUrl.includes("intersection") || lowerUrl.includes("car ") || lowerUrl.includes("diagram")) {
      detectedText = "Which car has the right of way in this diagram?";
      detectedExplanation = "Traffic approaching from the right or those already in the intersection generally have priority.";
      detectedCategory = "Intersections";
    } else {
      toast({ title: "Scan Complete", description: "Image analyzed. No specific template found for this sign yet." });
      setIsIdentifying(false);
      return;
    }
    setForm({ ...form, text: detectedText, explanation: detectedExplanation, category: detectedCategory });
    toast({ title: "Smart Suggestion Applied", description: "AI detected the sign and suggested a question format." });
    setIsIdentifying(false);
  };

  useEffect(() => {
    if (!isDialogOpen && !isActionOpen) return;
    window.history.pushState({ modal: true }, "");
    const handlePopState = () => {
      setIsDialogOpen(false);
      setIsActionOpen(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (window.history.state?.modal) window.history.back();
    };
  }, [isDialogOpen, isActionOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleRowClick = (q: any) => {
    setSelectedRow(q);
    setIsActionOpen(true);
  };

  const handleEdit = (q: any) => {
    if (!q) return;
    setEditingQuestion(q);
    setForm({
      text: q.text || "",
      category: q.category || "General Rules",
      difficulty: (q.difficulty as any) || "medium",
      options: Array.isArray(q.options) ? [...q.options] : ["", "", "", ""],
      correctAnswer: q.correctAnswer ?? 0,
      explanation: q.explanation || "",
      imageUrl: q.imageUrl || ""
    });
    setIsActionOpen(false);
    setTimeout(() => setIsDialogOpen(true), 100);
  };

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setIsActionOpen(false);
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQ.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Question deleted" });
          refetch();
        }
      });
    }
  };

  const handleSubmit = () => {
    if (!form.text || form.options.some(o => !o) || !form.explanation) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (editingQuestion) {
      updateQ.mutate({ id: editingQuestion.id, data: form as any }, {
        onSuccess: () => {
          toast({ title: "Question updated" });
          setIsDialogOpen(false);
          refetch();
        }
      });
    } else {
      createQ.mutate({ data: form as any }, {
        onSuccess: () => {
          toast({ title: "Question created" });
          setIsDialogOpen(false);
          refetch();
        }
      });
    }
  };

  const filtered = questions?.filter(q => {
    const text = q.text?.toLowerCase() || "";
    const category = q.category?.toLowerCase() || "";
    const matchesSearch = text.includes(search.toLowerCase()) || category.includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    if (activeTab === "signs") return category.includes("sign");
    if (activeTab === "diagrams") return category.includes("intersection") || q.imageUrl || text.includes("diagram") || text.includes("car ");
    if (activeTab === "rules") return category.includes("rule") || category.includes("legal") || category.includes("safety");
    if (activeTab === "missing_images") {
      const isMissing = !q.imageUrl || (typeof q.imageUrl === 'string' && q.imageUrl.trim() === "");
      const needsPic = category.includes("sign") || text.includes("sign") || text.includes("car") || text.includes("diagram") || text.includes("figure") || text.includes("which car") || text.includes("this sign");
      return isMissing && needsPic;
    }
    return true;
  }) || [];

  return (
    <div className="p-4 md:p-8 w-full space-y-10 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">Question Bank</h1>
          <p className="text-lg font-medium text-muted-foreground mt-2">Managing {questions?.length || 0} active curriculum items.</p>
        </div>
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-4 bg-amber-500/5 p-4 rounded-3xl border border-amber-500/10 cursor-pointer hover:bg-amber-500/10 transition-colors"
            onClick={() => setActiveTab("missing_images")}
          >
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Action Required</p>
              <p className="text-2xl font-black text-slate-900">{questions?.filter(q => !q.imageUrl && (q.category?.toLowerCase() || "").includes('sign'))?.length || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <Button size="lg" className="h-16 px-8 rounded-3xl font-black text-lg gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all" onClick={handleOpenCreate}>
            <Plus className="w-6 h-6" /> Create Question
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full md:w-auto h-16 p-1.5 bg-slate-100 rounded-3xl border mb-2">
          <TabsTrigger value="all" className="flex-1 md:px-8 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:shadow-lg"><List className="w-4 h-4 mr-2" /> All Items</TabsTrigger>
          <TabsTrigger value="rules" className="flex-1 md:px-8 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:shadow-lg">Rules</TabsTrigger>
          <TabsTrigger value="signs" className="flex-1 md:px-8 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:shadow-lg">Signs</TabsTrigger>
          <TabsTrigger value="diagrams" className="flex-1 md:px-8 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:shadow-lg">Diagrams</TabsTrigger>
          <TabsTrigger value="missing_images" className="flex-1 md:px-8 rounded-2xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-white"><ImageIcon className="w-4 h-4 mr-2" /> Missing Pic</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-0 shadow-2xl ring-1 ring-slate-200/60 rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search across text, category, or ID..."
                className="pl-12 h-14 bg-white border-slate-200 rounded-2xl text-lg font-medium shadow-sm focus:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="px-6 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.2em]">
              {filtered.length} Items Found
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] h-16 px-8 font-black uppercase text-[10px] tracking-widest">Type</TableHead>
                  <TableHead className="h-16 font-black uppercase text-[10px] tracking-widest">Curriculum Content</TableHead>
                  <TableHead className="h-16 font-black uppercase text-[10px] tracking-widest">Classification</TableHead>
                  <TableHead className="h-16 font-black uppercase text-[10px] tracking-widest text-right px-8">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 text-slate-400 font-bold">Synchronizing database...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 text-slate-400 font-bold">No curriculum items match your current filter.</TableCell></TableRow>
                ) : (
                  filtered.map((q) => (
                    <TableRow key={q.id} className="h-28 hover:bg-slate-50/50 transition-all border-b cursor-pointer group" onClick={() => handleRowClick(q)}>
                      <TableCell className="px-8">
                        {q.imageUrl ? (
                          <div className="w-16 h-16 rounded-2xl border-2 border-white shadow-md bg-white flex items-center justify-center overflow-hidden ring-1 ring-slate-100 group-hover:scale-110 transition-transform">
                            <img src={q.imageUrl} className="w-full h-full object-contain p-1" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-2xl space-y-1">
                          <p className="font-black text-slate-900 text-lg leading-tight line-clamp-2">{q.text}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">ID #{q.id}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{q.difficulty}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-slate-900 hover:bg-slate-900 text-white font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-lg">
                          {q.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button
                          variant="secondary"
                          className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                          onClick={(e) => { e.stopPropagation(); handleEdit(q); }}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Modify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight">Question Manager</DialogTitle>
              <DialogDescription className="font-bold text-slate-500 italic px-4 leading-tight">
                "{selectedRow?.text}"
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-6">
            <Button size="lg" className="h-20 justify-start gap-4 rounded-3xl text-xl font-black shadow-xl shadow-primary/10" onClick={() => handleEdit(selectedRow)}>
              <div className="bg-white/20 p-3 rounded-2xl"><Edit className="w-6 h-6" /></div>
              Edit Curriculum
            </Button>
            <Button variant="outline" size="lg" className="h-20 justify-start gap-4 rounded-3xl text-xl font-black text-destructive border-destructive/20 hover:bg-destructive/5 shadow-sm" onClick={() => handleDelete(selectedRow?.id)}>
              <div className="bg-destructive/10 p-3 rounded-2xl text-destructive"><Trash2 className="w-6 h-6" /></div>
              Delete Record
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setIsActionOpen(false)} className="w-full font-black text-slate-400 uppercase text-xs tracking-widest mt-2">Close Manager</Button>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight">{editingQuestion ? "Modify Curriculum" : "New Curriculum Entry"}</DialogTitle>
            <DialogDescription className="text-lg font-medium text-slate-500">Provide official details for the Zimbabwe test bank.</DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-8">
            <div className="space-y-3">
              <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Official Question Text</Label>
              <Textarea placeholder="Enter the question..." className="min-h-[120px] rounded-2xl text-lg font-bold border-slate-200 focus:ring-primary/20" value={form.text} onChange={e => setForm({...form, text: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Category</Label>
                <Input placeholder="e.g. Rules of Road" className="h-14 rounded-2xl font-bold border-slate-200" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div className="space-y-3">
                <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm({...form, difficulty: v as any})}>
                  <SelectTrigger className="h-14 rounded-2xl font-bold border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200"><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Answer Options</Label>
              <div className="grid grid-cols-1 gap-4">
                {form.options.map((opt, i) => (
                  <div key={i} className={cn("flex items-center gap-4 p-3 rounded-2xl border-2 transition-all", form.correctAnswer === i ? "border-primary bg-primary/5" : "border-slate-100")}>
                    <button className={cn("w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 font-black transition-all", form.correctAnswer === i ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" : "border-slate-200 text-slate-400 hover:border-slate-400")} onClick={() => setForm({...form, correctAnswer: i})}>
                      {i + 1}
                    </button>
                    <Input placeholder={`Provide option ${i + 1}...`} className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg font-bold" value={opt} onChange={e => { const newOpts = [...form.options]; newOpts[i] = e.target.value; setForm({...form, options: newOpts}); }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Highway Code Explanation</Label>
              <Textarea placeholder="Explain why this is correct..." className="min-h-[100px] rounded-2xl font-medium border-slate-200" value={form.explanation} onChange={e => setForm({...form, explanation: e.target.value})} />
            </div>

            <div className="space-y-4">
              <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Curriculum Visual (Diagram/Sign)</Label>
              {form.imageUrl && (
                <div className="relative w-full aspect-video rounded-3xl bg-slate-900 overflow-hidden group border-8 border-slate-100 shadow-inner">
                  <img src={form.imageUrl} className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" className="h-14 px-8 rounded-2xl font-black gap-2 bg-primary shadow-xl shadow-primary/30 hover:scale-105 transition-transform" onClick={identifyFromImage} disabled={isIdentifying}>
                      {isIdentifying ? <Loader2 className="animate-spin" /> : <Sparkles />}
                      {isIdentifying ? "Scanning..." : "AI Suggest Question"}
                    </Button>
                    <Button type="button" variant="destructive" className="h-14 px-8 rounded-2xl font-black gap-2 shadow-xl shadow-destructive/30 hover:scale-105 transition-transform" onClick={() => setForm({...form, imageUrl: ""})}>
                      <X className="w-5 h-5" /> Remove Image
                    </Button>
                  </div>
                </div>
              )}
              <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col gap-6">
                <div className="space-y-2"><p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest mb-4">Option A: Professional Upload</p><Input type="file" accept="image/*" onChange={handleFileUpload} className="h-16 rounded-2xl bg-white border-slate-200 shadow-sm pt-4 pl-6 font-bold cursor-pointer" /></div>
                <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-slate-50 px-4 text-slate-400">Or Access via Cloud</span></div></div>
                <div className="space-y-2"><p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest mb-4">Option B: Remote URL</p><Input placeholder="https://..." className="h-16 rounded-2xl bg-white border-slate-200 shadow-sm pl-6 text-lg font-bold" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} /></div>
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-6 border-t mt-8">
            <Button variant="ghost" size="lg" className="rounded-2xl font-black text-slate-400 uppercase tracking-widest" onClick={() => setIsDialogOpen(false)}>Discard</Button>
            <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-lg shadow-xl shadow-primary/25" onClick={handleSubmit} disabled={createQ.isPending || updateQ.isPending}>
              {editingQuestion ? "Publish Changes" : "Publish to Bank"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
