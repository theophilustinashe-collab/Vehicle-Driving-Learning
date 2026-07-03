import { useState } from "react";
import { useListQuestions, useCreateQuestion, useDeleteQuestion, useUpdateQuestion } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Search, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, CardHeader, CardTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ManageQuestions() {
  const [search, setSearch] = useState("");
  const { data: questions, isLoading, refetch } = useListQuestions({ limit: 100 });
  const createQ = useCreateQuestion();
  const updateQ = useUpdateQuestion();
  const deleteQ = useDeleteQuestion();
  const { toast } = useToast();

  const [isDialogOpen, setIsSidebarOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

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

  const handleEdit = (q: any) => {
    setEditingQuestion(q);
    setForm({
      text: q.text,
      category: q.category,
      difficulty: q.difficulty,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      imageUrl: q.imageUrl || ""
    });
    setIsSidebarOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setForm(initialForm);
    setIsSidebarOpen(true);
  };

  const handleDelete = (id: number) => {
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
          setIsSidebarOpen(false);
          refetch();
        }
      });
    } else {
      createQ.mutate({ data: form as any }, {
        onSuccess: () => {
          toast({ title: "Question created" });
          setIsSidebarOpen(false);
          refetch();
        }
      });
    }
  };

  const filtered = questions?.filter(q => q.text.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Questions</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or archive questions in the test bank.</p>
        </div>
        <Button className="gap-2 font-bold" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" /> Create Question
        </Button>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/30">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search questions..." 
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
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Question Text</TableHead>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[100px]">Difficulty</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading questions...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No questions found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-muted-foreground">{q.id}</TableCell>
                      <TableCell className="font-medium max-w-md truncate" title={q.text}>{q.text}</TableCell>
                      <TableCell><Badge variant="secondary" className="uppercase text-[10px]">{q.category}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={q.difficulty === 'hard' ? 'destructive' : q.difficulty === 'medium' ? 'default' : 'outline'} className="uppercase text-[10px]">
                          {q.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(q)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(q.id)}
                          disabled={deleteQ.isPending}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsSidebarOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="px-0 pt-0">
            <CardTitle>{editingQuestion ? "Edit Question" : "Create New Question"}</CardTitle>
          </CardHeader>

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

            <div className="space-y-2">
              <Label className="font-bold">Image URL (Optional)</Label>
              <Input
                placeholder="https://..."
                value={form.imageUrl}
                onChange={e => setForm({...form, imageUrl: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSidebarOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createQ.isPending || updateQ.isPending}>
              {editingQuestion ? "Update Question" : "Create Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
