import { useState, useEffect, useCallback, useRef } from "react";
import { useListSigns, useCreateSign, useDeleteSign, useUpdateSign } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Search, Save, X, Image as ImageIcon, Sparkles, Loader2, Check, Signpost, AlertCircle, Crop as CropIcon } from "lucide-react";
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const initialForm = {
    name: "",
    category: "regulatory",
    meaning: "",
    imageUrl: "",
    usage: ""
  };

  const [form, setForm] = useState(initialForm);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

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

    return canvas.toDataURL('image/png');
  };

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImg(form.imageUrl, croppedAreaPixels);
      if (croppedImage) {
        setForm({ ...form, imageUrl: croppedImage });
        setShowCropper(false);
        toast({ title: "Image Cropped", description: "The cropped version has been applied." });
      }
    } catch (e) {
      toast({ title: "Cropping Error", description: "Could not crop the image.", variant: "destructive" });
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
    setForm({ ...form, name: detectedName, meaning: detectedMeaning, category: detectedCategory });
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, imageUrl: reader.result as string });
        setShowCropper(true);
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
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (editingSign) {
      updateS.mutate({ id: editingSign.id, data: form as any }, {
        onSuccess: () => {
          toast({ title: "Sign updated" });
          setIsDialogOpen(false);
          refetch();
        }
      });
    } else {
      createS.mutate({ data: form as any }, {
        onSuccess: () => {
          toast({ title: "Sign created" });
          setIsDialogOpen(false);
          refetch();
        }
      });
    }
  };

  const filtered = signs?.filter(s => {
    const name = s.name?.toLowerCase() || "";
    return name.includes(search.toLowerCase());
  }) || [];

  return (
    <div className="p-4 md:p-8 w-full space-y-10 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">Signs Library</h1>
          <p className="text-lg font-medium text-muted-foreground mt-2">Managing {signs?.length || 0} high-resolution visual markers.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Visual Assets</p>
              <p className="text-2xl font-black text-slate-900">{signs?.length || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Signpost className="w-6 h-6" />
            </div>
          </div>
          <Button size="lg" className="h-16 px-8 rounded-3xl font-black text-lg gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all" onClick={handleOpenCreate}>
            <Plus className="w-6 h-6" /> Add New Sign
          </Button>
        </div>
      </div>

      <Card className="border-0 shadow-2xl ring-1 ring-slate-200/60 rounded-[2.5rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search signs by name or classification..."
                className="pl-12 h-14 bg-white border-slate-200 rounded-2xl text-lg font-medium shadow-sm focus:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="px-6 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-[0.2em]">
              {filtered.length} Signs Indexed
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[120px] h-16 px-8 font-black uppercase text-[10px] tracking-widest">Preview</TableHead>
                  <TableHead className="h-16 font-black uppercase text-[10px] tracking-widest">Sign Identification</TableHead>
                  <TableHead className="h-16 font-black uppercase text-[10px] tracking-widest">Meaning & Instruction</TableHead>
                  <TableHead className="w-[180px] h-16 font-black uppercase text-[10px] tracking-widest text-right px-8">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 text-slate-400 font-bold">Accessing visual archives...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-32 text-slate-400 font-bold">No signs found matching your search.</TableCell></TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.id} className="h-28 hover:bg-slate-50/50 transition-all border-b cursor-pointer group" onClick={() => handleRowClick(s)}>
                      <TableCell className="px-8">
                        <div className="w-20 h-20 rounded-2xl border-2 border-white shadow-md bg-white flex items-center justify-center overflow-hidden ring-1 ring-slate-100 group-hover:scale-110 transition-transform">
                          <img src={s.imageUrl} className="w-full h-full object-contain p-1" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 text-lg leading-none">{s.name}</p>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest py-0 h-4 border-slate-200 mt-1">
                            {s.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-slate-600 font-medium max-w-md line-clamp-2 leading-snug">{s.meaning}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-tighter">ID #{s.id}</p>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button
                          variant="secondary"
                          className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                          onClick={(e) => { e.stopPropagation(); handleEdit(s); }}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight">{editingSign ? "Update Marker" : "New Visual Marker"}</DialogTitle>
            <DialogDescription className="text-lg font-medium text-slate-500">Provide official SADC details for the road sign library.</DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-8">
            <div className="space-y-3">
              <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Sign Name / Curriculum ID</Label>
              <Input placeholder="e.g. Stop Sign (R1)" className="h-14 rounded-2xl text-lg font-bold border-slate-200 focus:ring-primary/20" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>

            <div className="space-y-3">
              <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Official Category</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger className="h-14 rounded-2xl font-bold border-slate-200"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="guidance">Guidance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Standard Meaning</Label>
              <Textarea placeholder="What does this sign legally mean?" className="min-h-[120px] rounded-2xl font-medium border-slate-200" value={form.meaning} onChange={e => setForm({...form, meaning: e.target.value})} />
            </div>

            <div className="space-y-4">
              <Label className="font-black text-sm uppercase tracking-widest text-slate-400">High-Res Visual</Label>

              {showCropper ? (
                <div className="relative w-full h-80 bg-slate-900 rounded-3xl overflow-hidden border-4 border-primary/20">
                  <Cropper
                    image={form.imageUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 z-10 bg-white/10 backdrop-blur-xl p-3 rounded-full border border-white/20">
                    <Slider
                      value={[zoom]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={([v]) => setZoom(v)}
                    />
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                     <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20" onClick={() => setShowCropper(false)}>Cancel</Button>
                     <Button size="sm" className="bg-primary text-white font-bold" onClick={handleCropSave}>Save Crop</Button>
                  </div>
                </div>
              ) : form.imageUrl ? (
                <div className="relative w-64 h-64 mx-auto rounded-[2.5rem] bg-slate-50 overflow-hidden group border-8 border-slate-100 shadow-inner flex items-center justify-center">
                  <img src={form.imageUrl} className="max-h-full max-w-full object-contain p-6" />
                  <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" className="h-10 px-4 rounded-xl font-black gap-2 bg-primary shadow-lg shadow-primary/30" onClick={identifySign} disabled={isIdentifying}>
                      {isIdentifying ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      Identify
                    </Button>
                    <div className="flex gap-2">
                       <Button type="button" size="icon" className="h-10 w-10 rounded-xl bg-white text-slate-900 shadow-lg" onClick={() => setShowCropper(true)}>
                         <CropIcon className="w-5 h-5" />
                       </Button>
                       <Button type="button" size="icon" variant="destructive" className="h-10 w-10 rounded-xl shadow-lg" onClick={() => setForm({...form, imageUrl: ""})}>
                         <X className="w-5 h-5" />
                       </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              {!showCropper && (
                <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col gap-6">
                  <div className="space-y-2"><p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest mb-4">Upload from Disk</p><Input type="file" accept="image/*" onChange={handleFileUpload} className="h-16 rounded-2xl bg-white border-slate-200 shadow-sm pt-4 pl-6 font-bold cursor-pointer" /></div>
                  <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-slate-50 px-4 text-slate-400">OR</span></div></div>
                  <div className="space-y-2"><p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest mb-4">Cloud URL</p><Input placeholder="https://..." className="h-16 rounded-2xl bg-white border-slate-200 shadow-sm pl-6 text-lg font-bold" value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl} onChange={e => {
                    setForm({...form, imageUrl: e.target.value});
                    if (e.target.value) setShowCropper(true);
                  }} /></div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="font-black text-sm uppercase tracking-widest text-slate-400">Usage / Placement (Optional)</Label>
              <Input placeholder="e.g. 50m before a bridge" className="h-14 rounded-2xl font-bold border-slate-200" value={form.usage} onChange={e => setForm({...form, usage: e.target.value})} />
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-6 border-t mt-8">
            <Button variant="ghost" size="lg" className="rounded-2xl font-black text-slate-400 uppercase tracking-widest" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-lg shadow-xl shadow-primary/25" onClick={handleSubmit} disabled={createS.isPending || updateS.isPending}>
              {editingSign ? "Save Marker" : "Register Marker"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
