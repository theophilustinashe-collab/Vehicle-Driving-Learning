import { useGetBookmarks, useRemoveBookmark } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookmarkMinus, CheckCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Bookmarks() {
  const { data: bookmarks, isLoading, refetch } = useGetBookmarks();
  const removeBookmark = useRemoveBookmark();
  const { toast } = useToast();

  const handleRemove = (questionId: number) => {
    removeBookmark.mutate(
      { questionId },
      {
        onSuccess: () => {
          toast({ title: "Removed from bookmarks" });
          refetch();
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="hidden lg:flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Saved Questions</h1>
          <p className="text-muted-foreground mt-1">Questions you've bookmarked for special revision.</p>
        </div>
      </div>

      {!bookmarks || bookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookmarkMinus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              You haven't saved any questions. Browse the question bank to find difficult questions to review later.
            </p>
            <Link href="/questions">
              <Button>Browse Question Bank</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="uppercase">{q.category}</Badge>
                    <Badge variant={q.difficulty === 'hard' ? 'destructive' : q.difficulty === 'medium' ? 'default' : 'outline'} className="uppercase">
                      {q.difficulty}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemove(q.id)}
                    disabled={removeBookmark.isPending}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <BookmarkMinus className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
                
                <h3 className="text-lg font-semibold mb-6">{q.text}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {q.options.map((opt, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-md border text-sm flex items-start gap-3 ${idx === q.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium' : 'bg-muted/30 opacity-60'}`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${idx === q.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20'}`}>
                        {idx === q.correctAnswer ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[10px]">{idx + 1}</span>}
                      </div>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm mt-4">
                  <span className="font-semibold text-primary block mb-1">Explanation:</span>
                  {q.explanation}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
