import { useState } from "react";
import { useListSigns, useCreateSign, useDeleteSign, useUpdateSign } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Search, Save, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, CardHeader, CardTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
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
  const [editingSign, setEditingSign] = useState<any>(null);

  const initialForm = {
    name: "",
    category: "regulatory",
    meaning: "",
    imageUrl: "",
    usage: ""
  };

  const [form, setForm] = useState(initialForm);

  const handleEdit = (s: any) => {
    setEditingSign(s);
    setForm({
      name: s.name,
      category: s.category,
      meaning: s.meaning,
      imageUrl: s.imageUrl,
      usage: s.usage || ""
    });
    setIsDialogOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingSign(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
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

  const filtered = signs?.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Road Signs</h1>
          <p className="text-muted-foreground mt-1">Manage the library of regulatory, warning, and informative signs.</p>
        </div>
        <Button className="gap-2 font-bold" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Add New Sign
        </Button>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/30">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search signs by name..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center overflow-hidden">
                          <img src={s.imageUrl} alt={s.name} className="w-full h-full object-contain" />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{s.name}</TableCell>
                      <TableCell><Badge variant="outline" className="uppercase text-[10px]">{s.category}</Badge></TableCell>
                      <TableCell className="text-sm max-w-xs truncate" title={s.meaning}>{s.meaning}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(s)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(s.id)}
                          disabled={deleteS.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
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
          <CardHeader className="px-0 pt-0">
            <CardTitle>{editingSign ? "Edit Road Sign" : "Add New Road Sign"}</CardTitle>
          </CardHeader>

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

            <div className="space-y-2">
              <Label className="font-bold">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={e => setForm({...form, imageUrl: e.target.value})}
                />
                {form.imageUrl && (
                  <div className="w-11 h-11 border rounded flex items-center justify-center bg-muted shrink-0 overflow-hidden">
                    <img src={form.imageUrl} className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Paste a direct link to the sign image.</p>
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
    </div>
  );
}
