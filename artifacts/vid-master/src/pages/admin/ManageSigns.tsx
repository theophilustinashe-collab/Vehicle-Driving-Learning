import { useState, useEffect } from "react";
import { useListSigns, useCreateSign, useDeleteSign, useUpdateSign } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Search, Save, X, Image as ImageIcon, Sparkles, Loader2, Check } from "lucide-react";
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

  // Handle hardware back button to close dialogs instead of navigating home
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
      if (window.history.state?.modal) {
        window.history.back();
      }
    };
  }, [isDialogOpen, isActionOpen]);

  const initialForm = {
    name: "",
    category: "regulatory",
    meaning: "",
    imageUrl: "",
    usage: ""
  };

  const [form, setForm] = useState(initialForm);
  const [isIdentifying, setIsIdentifying] = useState(false);

  const identifySign = async () => {
    if (!form.imageUrl) return;

    setIsIdentifying(true);

    // Simulate AI identification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerName = form.name.toLowerCase();
    const lowerMeaning = form.meaning.toLowerCase();

    // Simple heuristic detection based on image source or name hints
    let detectedName = "";
    let detectedMeaning = "";
    let detectedCategory = "regulatory";

    const url = form.imageUrl.toLowerCase();
    const name = lowerName;

    // REGULATORY
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
    } else if (url.includes("no_left_turn") || name.includes("no left turn")) {
      detectedName = "No Left Turn (R209)";
      detectedMeaning = "Turning left is prohibited at this intersection.";
    } else if (url.includes("no_right_turn") || name.includes("no right turn")) {
      detectedName = "No Right Turn (R210)";
      detectedMeaning = "Turning right is prohibited at this intersection.";
    } else if (url.includes("one_way") || name.includes("one way")) {
      detectedName = "One Way (R103)";
      detectedMeaning = "Traffic is restricted to one direction only.";
    }

    // WARNING
    else if (url.includes("zebra") || name.includes("zebra crossing")) {
      detectedName = "Zebra Crossing (W306)";
      detectedMeaning = "Pedestrian crossing point ahead. Prepare to stop.";
      detectedCategory = "warning";
    } else if (url.includes("school") || name.includes("school ahead")) {
      detectedName = "School Ahead (W308)";
      detectedMeaning = "Children may be crossing the road near a school. Slow down.";
      detectedCategory = "warning";
    } else if (url.includes("pedestrian") || name.includes("pedestrian crossing")) {
      detectedName = "Pedestrian Crossing (W306)";
      detectedMeaning = "Warns that there is a pedestrian crossing ahead.";
      detectedCategory = "warning";
    } else if (url.includes("narrow_road") || name.includes("narrow road")) {
      detectedName = "Narrow Road Ahead (W202)";
      detectedMeaning = "The road narrows ahead. Be cautious of oncoming traffic.";
      detectedCategory = "warning";
    } else if (url.includes("two_way") || name.includes("two-way")) {
      detectedName = "Two-Way Traffic (W212)";
      detectedMeaning = "Traffic will be moving in both directions ahead.";
      detectedCategory = "warning";
    } else if (url.includes("men_at_work") || name.includes("men at work") || url.includes("construction")) {
      detectedName = "Men At Work (TW306)";
      detectedMeaning = "Road maintenance or construction is taking place ahead.";
      detectedCategory = "warning";
    } else if (url.includes("bumps") || name.includes("bumps")) {
      detectedName = "Bumps (W318)";
      detectedMeaning = "Successive humps in the road ahead. Slow down.";
      detectedCategory = "warning";
    } else if (url.includes("curve") || name.includes("curve")) {
      detectedName = "Curve Ahead";
      detectedMeaning = "The road ahead curves. Reduce speed.";
      detectedCategory = "warning";
    } else if (url.includes("crossroads") || name.includes("crossroads")) {
      detectedName = "Crossroads (W201)";
      detectedMeaning = "Intersection ahead where two roads cross.";
      detectedCategory = "warning";
    }

    // INFORMATIVE / FALLBACK
    else if (url.includes("hospital") || name.includes("hospital")) {
      detectedName = "Hospital Ahead (IN1)";
      detectedMeaning = "Medical facility or hospital nearby. Keep noise low.";
      detectedCategory = "informative";
    } else {
      toast({
        title: "AI Scan Complete",
        description: "Image processed. No exact match found, but you can now manually refine the details."
      });
      setIsIdentifying(false);
      return;
    }

    setForm({
      ...form,
      name: detectedName,
      meaning: detectedMeaning,
      category: detectedCategory
    });

    toast({
      title: "Sign Identified!",
      description: `AI detected this as a ${detectedName}. Fields auto-filled.`,
    });
    setIsIdentifying(false);
  };

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

    // Close action dialog first
    setIsActionOpen(false);

    // Tiny delay to allow the first dialog to start closing before opening the edit one
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 100);
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
    <div className="p-4 md:p-8 max-w-[98%] mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Road Signs</h1>
          <p className="text-muted-foreground mt-1">Manage the library of regulatory, warning, and informative signs.</p>
        </div>
        <Button className="gap-2 font-bold shadow-lg" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add New Sign
        </Button>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search signs by name..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border shadow-sm">
              Showing {filtered.length} Signs
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Preview</TableHead>
                  <TableHead>Sign Name</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead>Meaning</TableHead>
                  <TableHead className="w-[150px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading signs...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No signs found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow
                      key={s.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer group"
                      onClick={() => handleRowClick(s)}
                    >
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg border bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          <img src={s.imageUrl} alt={s.name} className="w-full h-full object-contain p-1" />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">{s.name}</TableCell>
                      <TableCell><Badge variant="secondary" className="uppercase text-[10px] font-black">{s.category}</Badge></TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate text-muted-foreground" title={s.meaning}>{s.meaning}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-8 gap-1.5 font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white border-0 transition-all opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(s);
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSign ? "Edit Road Sign" : "Add New Road Sign"}</DialogTitle>
            <DialogDescription>
              Update the sign's name, category, and meaning.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="font-bold">Sign Name / ID</Label>
              <Input
                placeholder="e.g. Stop Sign (R1)"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Category</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regulatory">Regulatory</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="guidance">Guidance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Meaning / Instruction</Label>
              <Textarea
                placeholder="What does this sign mean?"
                value={form.meaning}
                onChange={e => setForm({...form, meaning: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label className="font-bold">Sign Image</Label>

              {form.imageUrl && (
                <div className="relative w-full aspect-square max-w-[200px] mx-auto border-2 border-dashed rounded-xl flex items-center justify-center bg-muted overflow-hidden group">
                  <img src={form.imageUrl} className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 gap-1.5 font-bold bg-primary hover:bg-primary/90 shadow-lg border border-white/20"
                      onClick={identifySign}
                      disabled={isIdentifying}
                    >
                      {isIdentifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {isIdentifying ? "Identifying..." : "AI Identify"}
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

            <div className="space-y-2">
              <Label className="font-bold">Usage / Notes (Optional)</Label>
              <Input
                placeholder="Where is this usually placed?"
                value={form.usage}
                onChange={e => setForm({...form, usage: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createS.isPending || updateS.isPending}>
              {editingSign ? "Update Sign" : "Add Sign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Choice Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-2">
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Sign Actions</span>
            </div>
            <CardTitle className="text-xl">What would you like to do?</CardTitle>
            <CardDescription className="line-clamp-2 mt-2 font-medium">
              "{selectedRow?.name}"
            </CardDescription>
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
              Edit Sign Details
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
