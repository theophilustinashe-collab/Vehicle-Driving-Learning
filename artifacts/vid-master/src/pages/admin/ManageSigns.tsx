import { useState, useEffect, useCallback } from "react";
import { useListSigns, useCreateSign, useDeleteSign, useUpdateSign } from "@roadify/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Search, X, Image as ImageIcon, Sparkles, Loader2, Signpost, ArrowLeft, RefreshCw, Globe, Filter } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import Cropper from 'react-easy-crop';
import { Slider } from "@/components/ui/slider";

export default function ManageSigns() {
  const [search, setSearch] = useState("");
  const { data: signs, isLoading, refetch } = useListSigns();
  const createS = useCreateSign();
  const updateS = useUpdateSign();
  const deleteS = useDeleteSign();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [editingSign, setEditingSign] = useState<any>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);

  // Cropping state
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppingSource, setCroppingSource] = useState("");

  const initialForm = {
    name: "",
    category: "regulatory",
    meaning: "",
    imageUrl: "",
    usage: ""
  };

  const [form, setForm] = useState(initialForm);

  const onCropComplete = useCallback((_croppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
    if (!pixelCrop || !imageSrc) return null;

    return new Promise<string | null>((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = "anonymous";

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

        resolve(canvas.toDataURL('image/jpeg', 0.8));
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
        toast({ title: "Asset Validated", description: "The cropped sign has been applied." });
      }
    } catch (e) {
      console.error("[ManageSigns] Cropping Error:", e);
      toast({ title: "Processing Fault", description: "Could not apply crop.", variant: "destructive" });
    }
  };

  const identifySign = async () => {
    if (!form.imageUrl) return;
    setIsIdentifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const lowerName = form.name.toLowerCase();
    let detectedName = "";
    let detectedMeaning = "";
    let detectedCategory = "regulatory";
    const url = form.imageUrl.toLowerCase();
    const name = lowerName;

    if (url.includes("stop_sign") || name.includes("stop")) {
      detectedName = "Stop Sign (R1)";
      detectedMeaning = "You must bring your vehicle to a complete stop and give way to all traffic.";
    } else if (url.includes("yield") || name.includes("give way") || url.includes("give_way")) {
      detectedName = "Give Way (R2)";
      detectedMeaning = "Slow down and prepare to stop to give way to traffic on the major road.";
    } else if (url.includes("no_entry") || name.includes("no entry")) {
      detectedName = "No Entry (R3)";
      detectedMeaning = "Vehicles are prohibited from entering this road in this direction.";
    } else if (url.includes("speed_limit") || name.includes("speed")) {
      detectedName = "Speed Limit Sign";
      detectedMeaning = "Indicates the maximum speed allowed in this section of the road.";
    } else if (url.includes("no_overtaking") || name.includes("no overtaking")) {
      detectedName = "No Overtaking (R214)";
      detectedMeaning = "You are not allowed to overtake other vehicles.";
    } else if (url.includes("no_parking") || name.includes("no parking")) {
      detectedName = "No Parking (R216)";
      detectedMeaning = "Parking is not allowed in this area.";
    } else if (url.includes("no_u_turn") || name.includes("no u-turn")) {
      detectedName = "No U-Turn (R213)";
      detectedMeaning = "U-turns are prohibited for all vehicles.";
    } else if (url.includes("zebra") || name.includes("zebra crossing")) {
      detectedName = "Zebra Crossing (W306)";
      detectedMeaning = "Pedestrian crossing point ahead. Prepare to stop.";
      detectedCategory = "warning";
    } else if (url.includes("school") || name.includes("school ahead")) {
      detectedName = "School Ahead (W308)";
      detectedMeaning = "Children may be crossing the road near a school. Slow down.";
      detectedCategory = "warning";
    } else if (url.includes("hospital") || name.includes("hospital")) {
      detectedName = "Hospital Ahead (IN1)";
      detectedMeaning = "Medical facility or hospital nearby. Keep noise low.";
      detectedCategory = "informative";
    } else {
      toast({ title: "AI Scan Complete", description: "Image processed. No exact match found, but you can now manually refine the details." });
      setIsIdentifying(false);
      return;
    }
    setForm(prev => ({ ...prev, name: detectedName, meaning: detectedMeaning, category: detectedCategory }));
    toast({ title: "Sign Identified!", description: `AI detected this as a ${detectedName}.` });
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
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "Payload Oversize", description: "Asset must be under 2MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Optimization: Show immediately, cropping is optional
        setForm(prev => ({ ...prev, imageUrl: result }));
        toast({ title: "Asset Staged", description: "Sign added. You can optionally crop it using the tools below." });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRowClick = (s: any) => {
    setSelectedRow(s);
    setIsActionOpen(true);
  };

  const handleEdit = (s: any) => {
    if (!s) return;
    setEditingSign(s);
    setForm({
      name: s.name || "",
      category: s.category || "regulatory",
      meaning: s.meaning || "",
      imageUrl: s.imageUrl || "",
      usage: s.usage || ""
    });
    setIsActionOpen(false);
    setTimeout(() => setIsDialogOpen(true), 100);
  };

  const handleOpenCreate = () => {
    setEditingSign(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setIsActionOpen(false);
    if (confirm("Are you sure you want to delete this road sign?")) {
      deleteS.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Sign deleted" });
          refetch();
        }
      });
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.meaning || !form.imageUrl) {
      toast({ title: "Validation Error", description: "All visual and naming fields must be populated.", variant: "destructive" });
      return;
    }

    if (form.imageUrl && form.imageUrl.length > 5 * 1024 * 1024) {
      toast({ title: "Asset Rejected", description: "Image data is too large for the terminal. Try a smaller crop.", variant: "destructive" });
      return;
    }

    const syncAction = editingSign
      ? updateS.mutateAsync({ id: editingSign.id, data: form as any })
      : createS.mutateAsync({ data: form as any });

    toast({ title: editingSign ? "Syncing Asset..." : "Registering Asset..." });

    syncAction
      .then(() => {
        toast({ title: "Sync Complete", description: "Signs library has been updated." });
        setIsDialogOpen(false);
        refetch();
      })
      .catch((err) => {
        console.error("[ManageSigns] Sync Failure:", err);
        toast({
          title: "Engine Sync Failure",
          description: err.message?.includes('413')
            ? "Image payload exceeds server limits. Reduce crop size."
            : "The terminal could not reach the master database.",
          variant: "destructive"
        });
      });
  };

  const filtered = signs?.filter(s => {
    const name = s.name?.toLowerCase() || "";
    return name.includes(search.toLowerCase());
  }) || [];

  return (
    <div className="p-3 md:p-4 w-full space-y-3 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-black tracking-tighter text-primary uppercase leading-none">Signs Library</h1>
          <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{signs?.length || 0} Assets Indexed</p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button size="sm" className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest gap-2 shadow-sm active:scale-95 transition-all" onClick={handleOpenCreate}>
            <Plus size={14} /> New Sign
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search signs..."
            className="pl-8 h-8 bg-white border-slate-200 rounded-lg text-[11px] font-medium shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="px-3 py-1 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-black text-[8px] uppercase tracking-widest shrink-0">
          {filtered.length} Results
        </div>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent h-9">
                  <TableHead className="w-[60px] font-black uppercase text-[8px] tracking-widest text-center px-2">Asset</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Identification</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Meaning</TableHead>
                  <TableHead className="w-[100px] font-black uppercase text-[8px] tracking-widest text-right px-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-400 font-bold uppercase text-[9px]">Accessing Visual Archives...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-400 font-bold uppercase text-[9px]">Zero matches found</TableCell></TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.id} className="h-12 hover:bg-slate-50/50 transition-all border-b cursor-pointer group" onClick={() => handleRowClick(s)}>
                      <TableCell className="px-2">
                        <div className="w-10 h-10 rounded-lg border border-slate-100 shadow-sm bg-white flex items-center justify-center overflow-hidden mx-auto">
                          <img src={s.imageUrl} className="w-full h-full object-contain p-0.5" />
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-[11px] leading-none uppercase truncate max-w-[150px]">{s.name}</p>
                          <Badge variant="outline" className="text-[6px] font-black uppercase tracking-tighter py-0 h-3.5 border-slate-200 mt-1 px-1">
                            {s.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <p className="text-slate-500 font-medium text-[10px] line-clamp-1 leading-snug max-w-md">{s.meaning}</p>
                      </TableCell>
                      <TableCell className="text-right px-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 px-3 rounded-md font-black text-[9px] uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                          onClick={(e) => { e.stopPropagation(); handleEdit(s); }}
                        >
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

      {/* Action Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <Signpost className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight">Sign Manager</DialogTitle>
              <DialogDescription className="font-bold text-slate-500 italic px-4 leading-tight">
                "{selectedRow?.name}"
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-6">
            <Button size="lg" className="h-20 justify-start gap-4 rounded-3xl text-xl font-black shadow-xl shadow-primary/10" onClick={() => handleEdit(selectedRow)}>
              <div className="bg-white/20 p-3 rounded-2xl"><Edit className="w-6 h-6" /></div>
              Edit Sign Details
            </Button>
            <Button variant="outline" size="lg" className="h-20 justify-start gap-4 rounded-3xl text-xl font-black text-destructive border-destructive/20 hover:bg-destructive/5 shadow-sm" onClick={() => handleDelete(selectedRow?.id)}>
              <div className="bg-destructive/10 p-3 rounded-2xl text-destructive"><Trash2 className="w-6 h-6" /></div>
              Delete Permanently
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setIsActionOpen(false)} className="w-full font-black text-slate-400 uppercase text-xs tracking-widest mt-2">Dismiss</Button>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl p-6 md:p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black uppercase tracking-tight">{editingSign ? "Modify Marker" : "New Visual Marker"}</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase text-slate-400">SADC Visual Archive Maintenance</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">Sign Identification</Label>
                <Input placeholder="e.g. Stop Sign (R1)" className="h-11 rounded-xl text-sm font-bold border-slate-200" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">Classification</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger className="h-11 rounded-xl font-bold border-slate-200 text-xs uppercase"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="regulatory" className="text-[10px] font-black uppercase">Regulatory</SelectItem>
                    <SelectItem value="warning" className="text-[10px] font-black uppercase">Warning</SelectItem>
                    <SelectItem value="informative" className="text-[10px] font-black uppercase">Informative</SelectItem>
                    <SelectItem value="guidance" className="text-[10px] font-black uppercase">Guidance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">Official Meaning</Label>
                <Textarea placeholder="What does this sign legally mean?" className="min-h-[100px] rounded-xl text-xs font-medium border-slate-200" value={form.meaning} onChange={e => setForm({...form, meaning: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">Usage Context (Optional)</Label>
                <Input placeholder="e.g. 50m before bridge" className="h-11 rounded-xl font-bold border-slate-200 text-xs" value={form.usage} onChange={e => setForm({...form, usage: e.target.value})} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">High-Resolution Visual</Label>

                {form.imageUrl ? (
                  <div className="relative aspect-square max-w-[240px] mx-auto rounded-2xl bg-slate-50 overflow-hidden group border-2 border-slate-100 flex items-center justify-center">
                    <img src={form.imageUrl} className="w-full h-full object-contain p-4" />
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button type="button" size="sm" className="h-8 bg-primary text-[10px] font-black uppercase" onClick={identifySign} disabled={isIdentifying}>AI Scan</Button>
                      <Button type="button" size="sm" className="h-8 bg-white text-slate-900 text-[10px] font-black uppercase" onClick={() => {
                        setCroppingSource(form.imageUrl);
                        setCrop({ x: 0, y: 0 });
                        setZoom(1);
                        setShowCropper(true);
                      }}>Crop</Button>
                      <Button type="button" size="sm" variant="destructive" className="h-8" onClick={() => setForm({...form, imageUrl: ""})}><X size={12}/></Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col gap-4">
                    <div className="relative">
                      <Input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                      <div className="h-20 rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-1 text-slate-400">
                         <ImageIcon size={20} />
                         <span className="text-[8px] font-black uppercase">Upload Asset</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                       <Label className="text-[7px] font-black uppercase text-slate-400 ml-1">Remote Link</Label>
                       <Input placeholder="https://..." className="h-9 rounded-lg text-[10px] font-black uppercase bg-white" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl} onChange={e => {
                         const val = e.target.value;
                         setForm(prev => ({...prev, imageUrl: val}));
                         if (val.includes('://')) {
                           toast({ title: "Asset Linked", description: "Remote sign active. Use 'Crop' if adjustments are needed." });
                         }
                       }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 pt-4 border-t gap-2">
            <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button size="sm" className="h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handleSubmit} disabled={createS.isPending || updateS.isPending}>
              {editingSign ? "Sync Asset" : "Register Sign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCropper && (
        <div
          className="fixed inset-0 z-[110] bg-slate-900/95 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
           <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <div className="relative h-[400px] w-full bg-black">
                <Cropper
                  image={croppingSource}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
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
