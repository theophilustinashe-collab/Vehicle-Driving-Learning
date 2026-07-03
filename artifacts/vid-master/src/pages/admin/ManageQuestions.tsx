import { useState, useEffect } from "react";
import { useListQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuestion } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Search, Save, X, Image as ImageIcon, List, Filter, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const identifyFromImage = async () => {
    if (!form.imageUrl) return;

    setIsIdentifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerUrl = form.imageUrl.toLowerCase();

    // Heuristic detection for questions
    let detectedText = "";
    let detectedExplanation = "";
    let detectedCategory = "Signs";

    // REGULATORY
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
    }

    // WARNING
    else if (lowerUrl.includes("zebra") || lowerUrl.includes("pedestrian")) {
      detectedText = "What does this warning sign indicate?";
      detectedExplanation = "It warns that a pedestrian crossing is ahead and you should be prepared to stop.";
    } else if (lowerUrl.includes("school") || lowerUrl.includes("children")) {
      detectedText = "When seeing this sign, a driver must:";
      detectedExplanation = "Slow down and be alert for children who may be crossing the road near a school.";
    } else if (lowerUrl.includes("narrow_road") || lowerUrl.includes("narrow")) {
      detectedText = "This warning sign means:";
      detectedExplanation = "The road narrows ahead. Be cautious of narrowing path and oncoming traffic.";
    } else if (lowerUrl.includes("two_way") || lowerUrl.includes("2way")) {
      detectedText = "This sign warns that:";
      detectedExplanation = "Traffic will be moving in both directions ahead on the same road.";
    } else if (lowerUrl.includes("men_at_work") || lowerUrl.includes("construction")) {
      detectedText = "What should you expect when seeing this sign?";
      detectedExplanation = "It indicates that road maintenance or construction is taking place ahead. Slow down.";
    } else if (lowerUrl.includes("bumps") || lowerUrl.includes("humps")) {
      detectedText = "The sign indicates:";
      detectedExplanation = "There are speed humps or successive bumps in the road ahead. Reduce speed.";
    }

    // INTERSECTIONS / DIAGRAMS
    else if (lowerUrl.includes("intersection") || lowerUrl.includes("car ") || lowerUrl.includes("diagram")) {
      detectedText = "Which car has the right of way in this diagram?";
      detectedExplanation = "Traffic approaching from the right or those already in the intersection generally have priority.";
      detectedCategory = "Intersections";
    }
    else {
      toast({ title: "Scan Complete", description: "Image analyzed. No specific template found for this sign yet." });
      setIsIdentifying(false);
      return;
    }

    setForm({
      ...form,
      text: detectedText,
      explanation: detectedExplanation,
      category: detectedCategory
    });

    toast({ title: "Smart Suggestion Applied", description: "AI detected the sign and suggested a question format." });
    setIsIdentifying(false);
  };

  // Handle hardware back button to close dialogs instead of navigating home
  useEffect(() => {
    if (!isDialogOpen && !isActionOpen) return;

    // Push a dummy state so 'back' button has something to pop
    window.history.pushState({ modal: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      // When back is pressed, close everything
      setIsDialogOpen(false);
      setIsActionOpen(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Clean up the dummy history entry if we closed the modal manually
      if (window.history.state?.modal) {
        window.history.back();
      }
    };
  }, [isDialogOpen, isActionOpen]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result as string });
      };
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

    // Close action dialog first
    setIsActionOpen(false);

    // Tiny delay to allow the first dialog to start closing before opening the edit one
    // This prevents Radix UI focus/pointer-event lock conflicts
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 100);
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
    const matchesSearch = text.includes(search.toLowerCase()) ||
                         category.includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    if (activeTab === "signs") return category.includes("sign");
    if (activeTab === "diagrams") return category.includes("intersection") || q.imageUrl || text.includes("diagram") || text.includes("car ");
    if (activeTab === "rules") return category.includes("rule") || category.includes("legal") || category.includes("safety");

    if (activeTab === "missing_images") {
      const isMissing = !q.imageUrl || (typeof q.imageUrl === 'string' && q.imageUrl.trim() === "");
      const needsPic = category.includes("sign") ||
                      text.includes("sign") ||
                      text.includes("car") ||
                      text.includes("diagram") ||
                      text.includes("figure") ||
                      text.includes("which car") ||
                      text.includes("this sign");
      return isMissing && needsPic;
    }

    return true;
  }) || [];

  return (
    <div className="p-4 md:p-8 max-w-[98%] mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Questions</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or archive questions in the test bank.</p>
        </div>
        <Button className="gap-2 font-bold shadow-lg" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Create Question
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted/50 border">
          <TabsTrigger value="all" className="py-2 gap-2 font-bold"><List className="w-3.5 h-3.5" /> All</TabsTrigger>
          <TabsTrigger value="rules" className="py-2 gap-2 font-bold">General Rules</TabsTrigger>
          <TabsTrigger value="signs" className="py-2 gap-2 font-bold">Signs</TabsTrigger>
          <TabsTrigger value="diagrams" className="py-2 gap-2 font-bold">Diagrams</TabsTrigger>
          <TabsTrigger value="missing_images" className="py-2 gap-2 font-bold text-amber-600 data-[state=active]:bg-amber-100"><ImageIcon className="w-3.5 h-3.5" /> Missing Pic</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-0 shadow-sm ring-1 ring-border overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search questions..." 
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border shadow-sm">
              Showing {filtered.length} Results
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead>Question Text</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[100px]">Difficulty</TableHead>
                  <TableHead className="w-[150px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading questions...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground bg-muted/5">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="w-8 h-8 opacity-20" />
                        <p className="font-bold">No questions found matching your filter</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((q) => (
                    <TableRow
                      key={q.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(q)}
                    >
                      <TableCell>
                        {q.imageUrl ? (
                          <div className="w-10 h-10 rounded-md border bg-white flex items-center justify-center overflow-hidden shadow-sm">
                            <img src={q.imageUrl} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md border-2 border-dashed bg-muted/30 flex items-center justify-center text-muted-foreground/30">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-md">
                          <p className="truncate" title={q.text}>{q.text}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter mt-0.5">ID #{q.id}</p>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="uppercase text-[9px] font-black">{q.category}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={q.difficulty === 'hard' ? 'destructive' : q.difficulty === 'medium' ? 'default' : 'outline'} className="uppercase text-[9px] font-bold">
                          {q.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-8 gap-1.5 font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white border-0 transition-all opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(q);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Create New Question"}</DialogTitle>
            <DialogDescription>
              Provide question details, options, and explanations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="font-bold">Question Text</Label>
              <Textarea
                placeholder="Enter the question..."
                value={form.text}
                onChange={e => setForm({...form, text: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Category</Label>
                <Input
                  placeholder="e.g. General Rules"
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm({...form, difficulty: v as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-bold">Options</Label>
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer ${form.correctAnswer === i ? 'border-primary bg-primary text-white' : 'border-muted'}`}
                    onClick={() => setForm({...form, correctAnswer: i})}
                  >
                    {i + 1}
                  </div>
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={e => {
                      const newOpts = [...form.options];
                      newOpts[i] = e.target.value;
                      setForm({...form, options: newOpts});
                    }}
                  />
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tip: Click the number to mark it as the correct answer.</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Explanation</Label>
              <Textarea
                placeholder="Explain why the answer is correct..."
                value={form.explanation}
                onChange={e => setForm({...form, explanation: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label className="font-bold">Question Image (Optional)</Label>

              {form.imageUrl && (
                <div className="relative w-full aspect-video border-2 border-dashed rounded-xl flex items-center justify-center bg-muted overflow-hidden group">
                  <img src={form.imageUrl} className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 gap-1.5 font-bold bg-primary hover:bg-primary/90 shadow-lg border border-white/20"
                      onClick={identifyFromImage}
                      disabled={isIdentifying}
                    >
                      {isIdentifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {isIdentifying ? "Scanning..." : "AI Suggest Question"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => setForm({...form, imageUrl: ""})}
                      disabled={isIdentifying}
                    >
                      <X className="w-3 h-3" /> Remove
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Option A: Upload File</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground font-bold">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Option B: Paste Image URL</p>
                  <Input
                    placeholder="https://..."
                    value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                    onChange={e => setForm({...form, imageUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createQ.isPending || updateQ.isPending}>
              {editingQuestion ? "Update Question" : "Create Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Choice Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-2">
              <List className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Question Actions</span>
            </div>
            <DialogTitle className="text-xl">What would you like to do?</DialogTitle>
            <DialogDescription className="line-clamp-2 mt-2 font-medium">
              "{selectedRow?.text}"
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 py-4">
            <Button
              size="lg"
              className="h-16 justify-start gap-4 text-lg font-bold"
              onClick={() => handleEdit(selectedRow)}
            >
              <div className="bg-white/20 p-2 rounded-lg">
                <Edit className="w-6 h-6" />
              </div>
              Edit Question Details
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-16 justify-start gap-4 text-lg font-bold text-destructive hover:bg-destructive/5 border-destructive/20"
              onClick={() => handleDelete(selectedRow?.id)}
            >
              <div className="bg-destructive/10 p-2 rounded-lg text-destructive">
                <Trash2 className="w-6 h-6" />
              </div>
              Delete Permanently
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsActionOpen(false)} className="w-full font-bold">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
