import { useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Car, ShieldCheck, Palette, Sparkles, Check, Lock, ArrowLeft, Trophy } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SHOP_ITEMS = [
  { id: "border-gold", name: "Gold Master Border", price: 1000, desc: "A prestigious gold ring around your profile picture.", type: "border", color: "from-yellow-400 to-amber-600" },
  { id: "border-neon", name: "Neon Night Border", price: 2500, desc: "A glowing electric blue pulse for your avatar.", type: "border", color: "from-cyan-400 to-blue-600" },
  { id: "bg-aston", name: "Vantage Performance BG", price: 5000, desc: "Unlocks the Aston Martin background for your entire dashboard.", type: "background", color: "from-emerald-600 to-slate-900" },
  { id: "badge-legend", name: "Living Legend Title", price: 10000, desc: "Displays 'LEGEND' in diamond text next to your name.", type: "title", color: "from-purple-500 to-pink-500" },
];

export default function GaragePage() {
  const { data: user, refetch } = useGetMe();
  const { toast } = useToast();
  const [isBuying, setIsIdentifying] = useState<string | null>(null);

  const ownedItems = JSON.parse((user as any)?.unlockedItems || "[]");

  const handleBuy = async (itemId: string, price: number) => {
    if (((user as any)?.coins || 0) < price) {
      toast({ title: "Insufficient Coins", description: "Take more tests to earn more VID Coins!", variant: "destructive" });
      return;
    }

    setIsIdentifying(itemId);
    try {
      const baseUrl = (window as any).apiUrl || `http://${window.location.hostname || 'localhost'}:8080`;
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/garage/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("vid_token")}`,
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) throw new Error("Purchase failed");

      toast({ title: "Unlock Successful!", description: "Check your profile to see your new item." });
      refetch();
    } catch (e) {
      toast({ title: "Error", description: "Could not complete purchase.", variant: "destructive" });
    } finally {
      setIsIdentifying(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-2xl border shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">The Garage</h1>
            <p className="text-muted-foreground font-bold">Exchange your hard-earned VID Coins for premium status items.</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10 shrink-0">
          <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none mb-1">Your Balance</p>
            <p className="text-2xl font-black tracking-tight">{(user as any)?.coins || 0} <span className="text-primary text-xs">Coins</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SHOP_ITEMS.map((item) => {
          const isOwned = ownedItems.includes(item.id);
          const canAfford = ((user as any)?.coins || 0) >= item.price;

          return (
            <Card key={item.id} className="border-0 shadow-xl ring-1 ring-slate-200/60 rounded-[2.5rem] overflow-hidden group">
              <CardContent className="p-0">
                <div className={cn("h-32 bg-gradient-to-br relative flex items-center justify-center overflow-hidden", item.color)}>
                   <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                   {item.type === 'border' && <div className="w-16 h-16 rounded-full border-4 border-white/40 shadow-2xl" />}
                   {item.type === 'background' && <Car className="w-20 h-20 text-white/20 rotate-[-15deg] translate-x-12 translate-y-4" />}
                   {item.type === 'title' && <Trophy className="w-16 h-16 text-white/40 animate-pulse" />}

                   <div className="absolute bottom-4 left-6">
                      <Badge className="bg-white/20 backdrop-blur-md text-white border-0 font-black text-[10px] tracking-widest uppercase">
                        {item.type}
                      </Badge>
                   </div>
                </div>
                <div className="p-8 space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{item.name}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">{item.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                       <Coins className="w-4 h-4 text-amber-500" />
                       <span className="font-black text-slate-900">{item.price.toLocaleString()}</span>
                    </div>

                    {isOwned ? (
                      <Button disabled className="rounded-xl bg-emerald-500 text-white font-black uppercase text-xs gap-2 px-6">
                        <Check className="w-4 h-4" /> Owned
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleBuy(item.id, item.price)}
                        disabled={!canAfford || isBuying === item.id}
                        className={cn(
                          "rounded-xl font-black uppercase text-xs px-8 shadow-lg transition-all",
                          canAfford ? "bg-primary shadow-primary/20 hover:scale-105" : "bg-slate-100 text-slate-400"
                        )}
                      >
                        {isBuying === item.id ? "Processing..." : canAfford ? "Unlock Now" : "Need More Coins"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
