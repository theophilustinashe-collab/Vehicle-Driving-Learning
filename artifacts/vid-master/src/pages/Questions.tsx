import { useState } from "react";
import { useListQuestions, useGetBookmarks, useAddBookmark, useRemoveBookmark } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ChevronDown, CheckCircle2, ArrowLeft } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Questions() {
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");
  const { toast } = useToast();

  const { data: questions, isLoading } = useListQuestions({
    category: category !== "all" ? category : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
    limit: 50, // pagination could be added
  });

  const { data: bookmarks } = useGetBookmarks();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const bookmarkedIds = new Set(bookmarks?.map(q => q.id) || []);

  const handleBookmarkToggle = (questionId: number) => {
    if (bookmarkedIds.has(questionId)) {
      removeBookmark.mutate(
        { questionId },
        {
          onSuccess: () => {
            toast({ title: "Removed from bookmarks" });
          }
        }
      );
    } else {
      addBookmark.mutate(
        { data: { questionId } },
        {
          onSuccess: () => {
            toast({ title: "Added to bookmarks" });
          }
        }
      );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="hidden lg:flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Question Bank</h1>
            <p className="text-muted-foreground mt-1">Browse and study all official curriculum questions.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General Rules</SelectItem>
              <SelectItem value="signs">Road Signs</SelectItem>
              <SelectItem value="intersections">Intersections</SelectItem>
              <SelectItem value="emergencies">Emergencies</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Difficulty</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : !questions || questions.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-xl">
          <h3 className="text-xl font-bold mb-2">No questions found</h3>
          <p className="text-muted-foreground">Adjust your filters to see more results.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const isBookmarked = bookmarkedIds.has(q.id);
            return (
              <Card key={q.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="uppercase">{q.category}</Badge>
                        <Badge variant={q.difficulty === 'hard' ? 'destructive' : q.difficulty === 'medium' ? 'default' : 'outline'} className="uppercase">
                          {q.difficulty}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleBookmarkToggle(q.id)}
                        className={isBookmarked ? "text-primary" : "text-muted-foreground"}
                        disabled={addBookmark.isPending || removeBookmark.isPending}
                      >
                        {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-6">{q.text}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {q.options.map((opt, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-md border text-sm flex items-start gap-3 ${idx === q.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium' : 'bg-muted/30'}`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${idx === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20'}`}>
                            {idx === q.correctAnswer ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[10px]">{idx + 1}</span>}
                          </div>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>

                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          View Explanation <ChevronDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                          <span className="font-semibold text-primary block mb-1">Explanation:</span>
                          {q.explanation}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
