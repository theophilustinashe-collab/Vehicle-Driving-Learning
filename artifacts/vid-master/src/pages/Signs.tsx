import { useState, useMemo } from "react";
import { useListSigns } from "@roadify/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Info, ArrowLeft, WifiOff, RefreshCw, Layers } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RoadSign } from "@roadify/api-client-react";
import { getOfflineSigns } from "@/lib/offline";
import { motion, AnimatePresence } from "framer-motion";
import { variants, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/native-bridge";

export default function Signs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedSign, setSelectedSign] = useState<RoadSign | null>(null);

  const { data: onlineSigns, isLoading, error, refetch } = useListSigns({
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

  const handleSignClick = (sign: RoadSign) => {
    triggerHaptic('light');
    setSelectedSign(sign);
  };

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
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden bg-white h-32 md:h-40">
             <CardContent className="p-3 space-y-3 relative overflow-hidden h-full">
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50 to-transparent w-1/2 -skew-x-12" />
                <Skeleton className="h-2/3 w-full rounded-lg" />
                <Skeleton className="h-3 w-3/4 rounded-full mx-auto" />
             </CardContent>
          </Card>
        ))}
      </div>
    );
  } else if (error && !signs.length) {
    content = (
      <div className="text-center py-20 bg-destructive/5 border border-destructive/20 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <Info className="w-12 h-12 text-destructive mx-auto mb-4 relative z-10" />
        <h3 className="text-xl font-black text-destructive uppercase tracking-tight relative z-10">Sync Error</h3>
        <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest relative z-10">
          Curriculum assets could not be retrieved from the terminal.
        </p>
        <Button variant="outline" className="mt-6 h-11 px-8 rounded-xl border-2 relative z-10 font-black uppercase text-[10px] tracking-widest" onClick={() => refetch()}>
          Retry Link
        </Button>
      </div>
    );
  } else if (!signs || signs.length === 0) {
    content = (
      <div className="text-center py-20 bg-white border rounded-[2.5rem] shadow-sm">
        <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-xl font-black uppercase tracking-tight text-slate-400">Empty Archive</h3>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No matching assets in the Highway Code library.</p>
      </div>
    );
  } else {
    content = (
      <motion.div
        variants={variants.listContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3"
      >
        {signs.map((sign) => (
          <motion.div key={sign.id} variants={variants.listItem}>
            <Card
              className="cursor-pointer border-0 shadow-sm ring-1 ring-slate-100 hover:ring-primary/40 transition-all hover:shadow-lg group overflow-hidden rounded-xl bg-white h-full relative"
              onClick={() => handleSignClick(sign)}
            >
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.02] transition-opacity" />
              <CardContent className="p-2 md:p-3 flex flex-col items-center text-center h-full relative z-10">
                <div className="h-20 md:h-24 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-lg p-1.5 mb-2 group-hover:bg-primary/5 transition-colors relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                  {sign.imageUrl ? (
                    <motion.img
                      whileHover={{ scale: 1.15, rotate: [0, -2, 2, 0] }}
                      transition={transitions.gentle}
                      src={sign.imageUrl}
                      alt={sign.name}
                      className="max-h-full max-w-full object-contain drop-shadow-md relative z-10"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center relative z-10">
                      <span className="text-[6px] font-black text-slate-300 uppercase tracking-tighter">No Asset</span>
                    </div>
                  )}
                </div>
                <h3 className="font-black text-[9px] md:text-[10px] leading-tight line-clamp-1 text-slate-900 uppercase tracking-tighter group-hover:text-primary transition-colors">{sign.name}</h3>
                <div className="mt-1.5">
                  <Badge variant="secondary" className="text-[6px] font-black uppercase tracking-tighter px-1.5 py-0 h-3.5 bg-slate-100 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all border-0">
                    {sign.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div className="p-3 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">Signs Library</h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em] mt-1.5">Highway Code Rules</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <div className="relative flex-1 sm:min-w-[300px]">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-300" />
            <Input
              placeholder="Search by name or meaning..."
              className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className={cn(
              "h-11 px-4 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest gap-2 bg-white",
              isLoading && "text-primary border-primary/20"
            )}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Layers size={14} />}
            {isLoading ? "Syncing" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
        <Tabs value={category} onValueChange={(v) => { triggerHaptic('light'); setCategory(v); }} className="w-full min-w-max">
          <TabsList className="bg-slate-100/80 p-1 h-12 rounded-2xl border border-slate-200/40">
            {categories.map((c) => (
              <TabsTrigger key={c.value} value={c.value} className="px-6 font-black text-[10px] uppercase tracking-widest rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {content}

      <Dialog open={!!selectedSign} onOpenChange={(o) => !o && setSelectedSign(null)}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-0 shadow-2xl p-0 overflow-hidden bg-white">
          <AnimatePresence>
            {selectedSign && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="h-64 w-full flex items-center justify-center bg-slate-900 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-20 border border-white/5 rounded-full" />

                  {selectedSign.imageUrl ? (
                    <img
                      src={selectedSign.imageUrl}
                      alt={selectedSign.name}
                      className="max-h-full max-w-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] relative z-10 animate-in fade-in zoom-in duration-500"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center relative z-10 border border-white/10">
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-widest text-center px-4">No Asset Found</span>
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Badge className="bg-primary/20 text-primary border-0 font-black text-[8px] tracking-[0.2em] uppercase px-3 py-1">
                      {selectedSign.category} Category
                    </Badge>
                    <DialogTitle className="text-3xl font-black tracking-tighter text-slate-900 uppercase">{selectedSign.name}</DialogTitle>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-5"><Info size={40} className="text-primary" /></div>
                      <h4 className="font-black text-[9px] text-primary uppercase tracking-[0.2em] mb-2 relative z-10">Legislative Meaning</h4>
                      <p className="text-slate-700 font-bold leading-relaxed relative z-10 text-sm md:text-base italic">"{selectedSign.meaning}"</p>
                    </div>

                    {selectedSign.usage && (
                      <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                        <h4 className="font-black text-[9px] text-indigo-600 uppercase tracking-[0.2em] mb-2">Driver Context</h4>
                        <p className="text-indigo-900/80 text-xs font-bold leading-relaxed">{selectedSign.usage}</p>
                      </div>
                    )}
                  </div>

                  <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all" onClick={() => setSelectedSign(null)}>
                    Dismiss Intelligence
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
