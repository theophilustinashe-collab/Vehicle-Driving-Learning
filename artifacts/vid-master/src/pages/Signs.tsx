import { useState, useMemo } from "react";
import { useListSigns } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Info, ArrowLeft, WifiOff } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RoadSign } from "@workspace/api-client-react";
import { getOfflineSigns } from "@/lib/offline";

export default function Signs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedSign, setSelectedSign] = useState<RoadSign | null>(null);

  const { data: onlineSigns, isLoading, error } = useListSigns({
    search: search.length > 2 ? search : undefined,
    category: category !== "all" ? category : undefined,
  }, { query: { retry: false } as any });

  const signs = useMemo(() => {
    if (onlineSigns && onlineSigns.length > 0) return onlineSigns;

    // If offline or error, use local data
    if (!navigator.onLine || error) {
      const local = getOfflineSigns() as any[];
      if (!local.length) return [];

      return local.filter(s => {
        const matchesSearch = !search ||
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.meaning.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || s.category.toLowerCase() === category.toLowerCase();
        return matchesSearch && matchesCategory;
      });
    }

    return onlineSigns || [];
  }, [onlineSigns, error, search, category]);

  const isOffline = !navigator.onLine;

  const categories = [
    { value: "all", label: "All Signs" },
    { value: "warning", label: "Warning" },
    { value: "regulatory", label: "Regulatory" },
    { value: "informative", label: "Informative" },
    { value: "direction", label: "Direction" },
  ];

  let content;
  if (isLoading) {
    content = (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  } else if (error) {
    content = (
      <div className="text-center py-20 bg-destructive/5 border border-destructive/20 rounded-xl">
        <Info className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-bold text-destructive">Error Loading Signs</h3>
        <p className="text-muted-foreground mt-2">
          {(error as any)?.message || "The server could not be reached."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  } else if (!signs || signs.length === 0) {
    content = (
      <div className="text-center py-20 bg-card border rounded-xl">
        <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold">No signs found</h3>
        <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {signs.map((sign) => (
          <Card
            key={sign.id}
            className="cursor-pointer hover:border-primary transition-all hover:shadow-md group overflow-hidden"
            onClick={() => setSelectedSign(sign)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center h-full">
              <div className="h-32 w-full flex items-center justify-center bg-muted/30 rounded-lg p-2 mb-4 group-hover:bg-muted/50 transition-colors">
                {sign.imageUrl ? (
                  <img
                    src={sign.imageUrl}
                    alt={sign.name}
                    className="max-h-full max-w-full object-contain drop-shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">{sign.name}</h3>
              <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                {sign.category}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="hidden lg:flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Road Signs Library</h1>
          <p className="text-muted-foreground mt-1">Study and memorize the official Zimbabwe road signs.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search signs by name or meaning..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={category} onValueChange={setCategory} className="w-full md:w-auto overflow-x-auto">
          <TabsList>
            {categories.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {content}

      <Dialog open={!!selectedSign} onOpenChange={(o) => !o && setSelectedSign(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedSign && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSign.name}</DialogTitle>
                <DialogDescription className="uppercase tracking-widest text-xs font-bold text-primary mt-1">
                  {selectedSign.category} Sign
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center py-6">
                <div className="h-48 w-full flex items-center justify-center bg-muted/20 rounded-xl p-4 mb-6">
                  {selectedSign.imageUrl ? (
                    <img
                      src={selectedSign.imageUrl}
                      alt={selectedSign.name}
                      className="max-h-full max-w-full object-contain drop-shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-muted rounded-full" />
                  )}
                </div>
                <div className="w-full space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-1">Meaning</h4>
                    <p className="text-foreground font-medium">{selectedSign.meaning}</p>
                  </div>
                  {selectedSign.usage && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-1">
                        Usage Context
                      </h4>
                      <p className="text-foreground text-sm">{selectedSign.usage}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
