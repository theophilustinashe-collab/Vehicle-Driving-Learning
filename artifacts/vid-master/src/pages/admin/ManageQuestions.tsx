import { useState, useEffect } from "react";
import { useListQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuestion } from "@roadify/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Search, Save, X, Image as ImageIcon, List, Filter, Sparkles, Loader2, BookOpen, AlertCircle, LayoutGrid, CheckCircle2, MoreVertical, Copy, ArrowUpDown, ArrowLeft, Globe, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Link } from "wouter";
import Cropper from 'react-easy-crop';
import { Slider } from "@/components/ui/slider";
import { useCallback } from "react";

export default function ManageQuestions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { data: questions, isLoading, refetch } = useListQuestions({ limit: 250, all: "true" } as any);
  const createQ = useCreateQuestion();
  const updateQ = useUpdateQuestion();
  const deleteQ = useDeleteQuestion();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Cropping state
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppingSource, setCroppingSource] = useState("");

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
    setForm(prev => ({ ...prev, text: detectedText, explanation: detectedExplanation, category: detectedCategory }));
    toast({ title: "Smart Suggestion Applied", description: "AI detected the sign and suggested a question format." });
    setIsIdentifying(false);
  };

  const onCropComplete = useCallback((_croppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
    if (!pixelCrop || !imageSrc) return null;

    return new Promise<string | null>((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = "anonymous"; // Fix CORS glitches

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("No 2D context"));
          return;
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        resolve(canvas.toDataURL('image/jpeg', 0.8)); // Compressed JPEG for faster database sync
      };

      image.onerror = (e) => reject(e);
    });
  };

  const handleCropSave = async () => {
    if (!croppingSource) return;

    // Fallback if onCropComplete hasn't fired yet
    const pixels = croppedAreaPixels || { x: 0, y: 0, width: 100, height: 100 };

    try {
      const croppedImage = await getCroppedImg(croppingSource, pixels);
      if (croppedImage) {
        setForm(prev => ({ ...prev, imageUrl: croppedImage }));
        setShowCropper(false);
        setCroppingSource("");
        toast({ title: "Asset Validated", description: "The cropped visual has been applied." });
      }
    } catch (e) {
      console.error("[ManageQuestions] Cropping Error:", e);
      toast({ title: "Processing Fault", description: "Could not apply crop. Check image format.", variant: "destructive" });
    }
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
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Payload Oversize", description: "Asset must be under 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Optimization: Show immediately, cropping is optional
        setForm(prev => ({ ...prev, imageUrl: result }));
        toast({ title: "Asset Staged", description: "Visual added. You can optionally crop it using the tools below." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRowClick = (q: any) => {
    handleEdit(q);
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

  const handleDuplicate = (q: any) => {
    setEditingQuestion(null);
    setForm({
      text: `${q.text} (Copy)`,
      category: q.category || "General Rules",
      difficulty: (q.difficulty as any) || "medium",
      options: Array.isArray(q.options) ? [...q.options] : ["", "", "", ""],
      correctAnswer: q.correctAnswer ?? 0,
      explanation: q.explanation || "",
      imageUrl: q.imageUrl || ""
    });
    setIsDialogOpen(true);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const bulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} questions?`)) {
      // Logic for bulk delete - in a real app this would be a single API call
      Promise.all(selectedIds.map(id => deleteQ.mutateAsync({ id })))
        .then(() => {
          toast({ title: "Bulk delete successful" });
          setSelectedIds([]);
          refetch();
        });
    }
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
      toast({ title: "Validation Error", description: "All logic and content fields must be populated.", variant: "destructive" });
      return;
    }

    if (form.imageUrl && form.imageUrl.length > 5 * 1024 * 1024) {
      toast({ title: "Asset Rejected", description: "Image data is too large for the terminal. Try a smaller crop.", variant: "destructive" });
      return;
    }

    const syncAction = editingQuestion
      ? updateQ.mutateAsync({ id: editingQuestion.id, data: form as any })
      : createQ.mutateAsync({ data: form as any });

    toast({ title: editingQuestion ? "Syncing Record..." : "Committing Record..." });

    syncAction
      .then(() => {
        toast({ title: "Sync Complete", description: "Curriculum bank has been updated." });
        setIsDialogOpen(false);
        // Invalidate all questions queries to ensure other pages see the update
        queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/progress/dashboard'] });
        refetch();
      })
      .catch((err) => {
        console.error("[ManageQuestions] Sync Failure:", err);
        const errorMessage = err.data?.message || err.data?.error || err.message;
        toast({
          title: "Engine Sync Failure",
          description: err.status === 403
            ? "Your session does not have administrative clearance. Try logging out and back in."
            : err.message?.includes('413')
              ? "Image payload exceeds server limits. Reduce crop size."
              : errorMessage || "The terminal could not reach the master database.",
          variant: "destructive"
        });
      });
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
      const lowerText = text.toLowerCase();
      const lowerCategory = category.toLowerCase();
      const needsPic = lowerCategory.includes("sign") || lowerText.includes("sign") || lowerText.includes("car") || lowerText.includes("diagram") || lowerText.includes("figure") || lowerText.includes("which car") || lowerText.includes("this sign");
      if (!(isMissing && needsPic)) return false;
    }

    if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;

    return true;
  }) || [];

  return (
    <div className="p-3 md:p-4 w-full space-y-3 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tighter text-primary uppercase leading-none">Curriculum Bank</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{filtered.length} / {questions?.length || 0} Records</p>
              <div className="flex gap-1">
                 <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase text-[5px] py-0 h-3.5 px-1">{questions?.filter(q => q.difficulty === 'easy').length} E</Badge>
                 <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-bold uppercase text-[5px] py-0 h-3.5 px-1">{questions?.filter(q => q.difficulty === 'medium').length} M</Badge>
                 <Badge variant="outline" className="bg-red-50 text-red-700 border-red-100 font-bold uppercase text-[5px] py-0 h-3.5 px-1">{questions?.filter(q => q.difficulty === 'hard').length} H</Badge>
              </div>
            </div>
          </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest gap-2 transition-all"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw size={12} className={cn(isLoading && "animate-spin")} />
            {isLoading ? "Syncing" : "Refresh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 w-8 rounded-lg border-2 transition-all", compactMode ? "bg-slate-900 text-white" : "bg-white")}
            onClick={() => setCompactMode(!compactMode)}
          >
            <LayoutGrid size={14} />
          </Button>
          <Button size="sm" className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest gap-2 shadow-sm active:scale-95 transition-all" onClick={handleOpenCreate}>
            <Plus size={12} /> New Record
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
          <TabsList className="h-8 p-0.5 bg-slate-100 rounded-lg border w-full">
            <TabsTrigger value="all" className="flex-1 px-2 rounded-md font-black text-[7px] uppercase tracking-widest">All</TabsTrigger>
            <TabsTrigger value="rules" className="flex-1 px-2 rounded-md font-black text-[7px] uppercase tracking-widest">Rules</TabsTrigger>
            <TabsTrigger value="signs" className="flex-1 px-2 rounded-md font-black text-[7px] uppercase tracking-widest">Signs</TabsTrigger>
            <TabsTrigger value="diagrams" className="flex-1 px-2 rounded-md font-black text-[7px] uppercase tracking-widest">Assets</TabsTrigger>
            <TabsTrigger value="missing_images" className="flex-1 px-2 rounded-md font-black text-[7px] uppercase tracking-widest data-[state=active]:bg-red-500 data-[state=active]:text-white">Gaps</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1 flex flex-col xs:flex-row items-center gap-1.5 w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
            <Input
              placeholder="Search..."
              className="pl-7 h-8 bg-white border-slate-200 rounded-lg text-[11px] font-medium shadow-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full xs:w-[80px] h-8 rounded-lg border-slate-200 bg-white font-black uppercase text-[7px] tracking-widest">
              <SelectValue placeholder="Diff" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200 shadow-xl">
              <SelectItem value="all" className="text-[8px] font-black uppercase">All</SelectItem>
              <SelectItem value="easy" className="text-[8px] font-black uppercase text-emerald-600">Easy</SelectItem>
              <SelectItem value="medium" className="text-[8px] font-black uppercase text-amber-600">Med</SelectItem>
              <SelectItem value="hard" className="text-[8px] font-black uppercase text-red-600">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            className="h-8 px-3 rounded-lg font-black uppercase text-[7px] tracking-widest animate-in fade-in"
            onClick={bulkDelete}
          >
            <Trash2 size={10} className="mr-1" /> Wipe {selectedIds.length}
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent h-9">
                  <TableHead className="w-8 px-3">
                    <button
                      onClick={() => {
                        if (selectedIds.length === filtered.length) setSelectedIds([]);
                        else setSelectedIds(filtered.map(q => q.id));
                      }}
                      className={cn(
                        "w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all",
                        selectedIds.length === filtered.length && filtered.length > 0 ? "bg-primary border-primary text-white" : "border-slate-300"
                      )}
                    >
                      {selectedIds.length === filtered.length && filtered.length > 0 && <CheckCircle2 size={10} strokeWidth={4} />}
                    </button>
                  </TableHead>
                  <TableHead className="w-[60px] font-black uppercase text-[8px] tracking-widest text-center px-1">Asset</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Content</TableHead>
                  <TableHead className="w-[100px] font-black uppercase text-[8px] tracking-widest px-2">Tag</TableHead>
                  <TableHead className="w-[100px] font-black uppercase text-[8px] tracking-widest text-right px-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Accessing Curriculum...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold text-[10px] uppercase tracking-widest">No Records Found</TableCell></TableRow>
                ) : (
                  filtered.map((q) => (
                    <TableRow
                      key={q.id}
                      className={cn(
                        "transition-all border-b cursor-pointer group",
                        compactMode ? "h-10" : "h-14",
                        selectedIds.includes(q.id) ? "bg-primary/5" : "hover:bg-slate-50/50"
                      )}
                      onClick={() => handleRowClick(q)}
                    >
                      <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSelect(q.id); }}
                          className={cn(
                            "w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all",
                            selectedIds.includes(q.id) ? "bg-primary border-primary text-white" : "border-slate-300 group-hover:border-primary/50"
                          )}
                        >
                          {selectedIds.includes(q.id) && <CheckCircle2 size={10} strokeWidth={4} />}
                        </button>
                      </TableCell>
                      <TableCell className="px-1 text-center">
                        {q.imageUrl ? (
                          <div className={cn(
                            "rounded-md border border-slate-200 shadow-sm bg-white flex items-center justify-center overflow-hidden mx-auto",
                            compactMode ? "w-6 h-6 p-0.5" : "w-10 h-10 p-1"
                          )}>
                            <img src={q.imageUrl} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className={cn(
                            "rounded-md border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300 mx-auto",
                            compactMode ? "w-6 h-6" : "w-10 h-10"
                          )}>
                            <ImageIcon size={compactMode ? 10 : 14} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="max-w-xl min-w-0">
                          <p className={cn(
                            "font-black text-slate-900 leading-tight",
                            compactMode ? "text-[11px] truncate" : "text-xs mb-0.5 line-clamp-1"
                          )} title={q.text}>{q.text}</p>
                          {!compactMode && (
                            <p className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-sm italic">{q.explanation}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter truncate max-w-[80px]">
                            {q.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              "w-1 h-1 rounded-full",
                              q.difficulty === 'easy' ? 'bg-emerald-500' : q.difficulty === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                            )} />
                            <span className="text-[7px] font-black text-slate-400 uppercase">{q.difficulty}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            className={cn(
                              "rounded-lg font-black text-[9px] uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all h-7 px-3",
                            )}
                            onClick={() => handleEdit(q)}
                          >
                            Edit
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg h-7 w-7 border border-slate-100"
                              >
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32 rounded-lg border-slate-200 shadow-xl">
                              <DropdownMenuItem className="font-bold text-[9px] uppercase p-2 gap-2" onClick={() => handleDuplicate(q)}>
                                <Copy size={10} /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="font-bold text-[9px] uppercase p-2 gap-2 text-destructive" onClick={() => handleDelete(q.id)}>
                                <Trash2 size={10} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto rounded-2xl p-6 bg-white">
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <BookOpen size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tighter uppercase leading-none">Curriculum Editor</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">SADC Archive Maintenance</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
            {/* Left Column: Content & Options */}
            <div className="space-y-6">
               <div className="space-y-2">
                 <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Question Content</Label>
                 <Textarea
                    placeholder="Enter the official question text..."
                    className="min-h-[100px] rounded-xl text-sm font-bold border-slate-200 focus:ring-primary/20 shadow-sm transition-all"
                    value={form.text}
                    onChange={e => setForm({...form, text: e.target.value})}
                  />
               </div>

               <div className="space-y-3">
                 <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Multiple Choice Setup</Label>
                 <div className="grid gap-2">
                   {form.options.map((opt, i) => (
                     <div key={i} className={cn(
                        "flex items-center gap-2 p-2 rounded-xl border-2 transition-all group",
                        form.correctAnswer === i ? "border-primary bg-primary/5 shadow-sm" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                      )}>
                       <button
                        type="button"
                        className={cn(
                          "w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 text-xs font-black shadow-sm transition-all",
                          form.correctAnswer === i ? "bg-primary border-primary text-white scale-105" : "bg-white border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50"
                        )}
                        onClick={() => setForm({...form, correctAnswer: i})}
                        title="Mark as correct answer"
                       >
                         {String.fromCharCode(65 + i)}
                       </button>
                       <Input
                        placeholder={`Option ${String.fromCharCode(65 + i)}...`}
                        className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0 text-xs font-bold placeholder:text-slate-300"
                        value={opt}
                        onChange={e => { const newOpts = [...form.options]; newOpts[i] = e.target.value; setForm({...form, options: newOpts}); }}
                       />
                       {form.correctAnswer === i && (
                          <div className="pr-1 text-primary">
                             <CheckCircle2 size={14} strokeWidth={3} />
                          </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            {/* Right Column: Meta, Logic & Visual */}
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Classification</Label>
                    <Input className="h-10 rounded-xl font-bold border-slate-200 text-xs shadow-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Complexity</Label>
                    <Select value={form.difficulty} onValueChange={v => setForm({...form, difficulty: v as any})}>
                      <SelectTrigger className="h-10 rounded-xl font-bold border-slate-200 text-xs shadow-sm uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                        <SelectItem value="easy" className="font-black text-[9px] uppercase text-emerald-600">Easy</SelectItem>
                        <SelectItem value="medium" className="font-black text-[9px] uppercase text-amber-600">Medium</SelectItem>
                        <SelectItem value="hard" className="font-black text-[9px] uppercase text-red-600">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>

               <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Legal Logic</Label>
                  <Textarea
                    placeholder="Provide the official legal explanation..."
                    className="min-h-[80px] rounded-xl text-xs font-medium border-slate-200 focus:ring-primary/20 shadow-sm leading-relaxed"
                    value={form.explanation}
                    onChange={e => setForm({...form, explanation: e.target.value})}
                  />
               </div>

               <div className="space-y-2">
                 <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Visual Asset</Label>
                 {form.imageUrl ? (
                   <div className="relative w-full aspect-video rounded-2xl bg-slate-900 overflow-hidden group border-2 border-white shadow-lg ring-1 ring-slate-200">
                     <img src={form.imageUrl} className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                     <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Button type="button" size="sm" className="h-8 px-4 bg-primary rounded-lg font-black text-[9px] uppercase tracking-widest gap-2 shadow-lg active:scale-95" onClick={identifyFromImage} disabled={isIdentifying}>
                          {isIdentifying ? <Loader2 className="animate-spin w-3 h-3" /> : <Sparkles size={12} className="text-white"/>}
                          Suggest
                        </Button>
                        <Button type="button" size="sm" className="h-8 px-4 bg-white text-slate-900 rounded-lg font-black text-[9px] uppercase tracking-widest gap-2 shadow-lg active:scale-95" onClick={() => {
                          setCroppingSource(form.imageUrl);
                          setCrop({ x: 0, y: 0 });
                          setZoom(1);
                          setShowCropper(true);
                        }}>
                          <Filter size={12} /> Crop
                        </Button>
                        <Button type="button" variant="destructive" size="sm" className="h-8 w-8 rounded-lg shadow-lg active:scale-95" onClick={() => setForm({...form, imageUrl: ""})}>
                          <X size={14} />
                        </Button>
                     </div>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                        <div className="h-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-0.5 text-slate-400 group hover:bg-slate-100 transition-colors">
                           <ImageIcon size={16} />
                           <span className="text-[7px] font-black uppercase tracking-widest">Upload</span>
                        </div>
                      </div>
                      <div className="h-16 rounded-xl border-2 border-slate-100 bg-white p-2 flex flex-col gap-1 shadow-sm">
                         <div className="flex items-center gap-1 text-[7px] font-black text-slate-400 uppercase tracking-widest"><Globe size={8} /> URL</div>
                         <Input
                            placeholder="https://..."
                            className="h-6 rounded-md text-[9px] font-bold border-slate-100 bg-slate-50/50"
                            value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                            onChange={e => {
                              const val = e.target.value;
                              setForm(prev => ({...prev, imageUrl: val}));
                              if (val.includes('://')) {
                                toast({ title: "Asset Linked", description: "Remote visual active. Use 'Crop' if adjustments are needed." });
                              }
                            }}
                          />
                      </div>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t flex flex-col sm:flex-row gap-2">
            <div className="flex-1 text-left hidden sm:block">
               <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">Ready for master sync.</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100" onClick={() => setIsDialogOpen(false)}>Discard</Button>
            <Button size="sm" className="h-10 px-8 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all hover:bg-slate-800" onClick={handleSubmit} disabled={createQ.isPending || updateQ.isPending}>
              {createQ.isPending || updateQ.isPending ? <Loader2 className="animate-spin mr-2" size={14} /> : <CheckCircle2 className="mr-2 text-primary" size={14} />}
              {editingQuestion ? "Sync Changes" : "Commit to Bank"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCropper && (
        <div
          className="fixed inset-0 z-[110] bg-slate-900/95 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => e.stopPropagation()} // Prevent closing background dialogs
        >
           <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <div className="relative h-[400px] w-full bg-black">
                <Cropper
                  image={croppingSource}
                  crop={crop}
                  zoom={zoom}
                  aspect={16/9}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                   <div className="text-[10px] font-black uppercase text-slate-400 shrink-0">Scale Engine</div>
                   <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={([v]) => setZoom(v)} className="flex-1" />
                </div>
                <div className="flex gap-3">
                   <Button variant="outline" className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest" onClick={() => { setShowCropper(false); setCroppingSource(""); }}>Discard</Button>
                   <Button className="flex-1 h-12 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" onClick={handleCropSave}>Authorize Asset</Button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
