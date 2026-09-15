import { useState } from "react";
import { useGetMe, customFetch } from "@roadify/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins, Car, Palette, Sparkles, Check,
  Lock, ArrowLeft, Trophy, Zap, Gem, Gauge,
  Settings2, Wind, CheckCircle2, Loader2,
  ChevronRight, ShoppingCart, Info, Star
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/lib/native-bridge";
import { motion, AnimatePresence } from "framer-motion";
import { variants, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SHOP_ITEMS = [
  {
    id: "streak-freeze",
    name: "Streak Freeze",
    price: 500,
    desc: "Protects your progress for 24 hours if you miss a training session.",
    type: "Power-up",
    color: "from-blue-600 to-indigo-900",
    image: "https://images.unsplash.com/photo-1547307331-5079a4993132?auto=format&fit=crop&q=80&w=1000",
    icon: Zap
  },
  {
    id: "toyota-supra",
    name: "Supra MK4 Legend",
    price: 2500,
    desc: "Unlock the legendary Supra avatar and profile theme.",
    type: "Vehicle",
    color: "from-red-600 to-red-950",
    image: "https://images.unsplash.com/photo-1626023533967-a002f2097c5f?auto=format&fit=crop&q=80&w=1000",
    icon: Car
  },
  {
    id: "border-neon",
    name: "Cyber-Pulse Border",
    price: 1500,
    desc: "An electric blue animated pulse that glows around your avatar.",
    type: "Visual",
    color: "from-cyan-500 to-blue-800",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000",
    icon: Palette
  },
  {
    id: "bmw-m4",
    name: "M4 Competition",
    price: 4500,
    desc: "The ultimate driving machine. High-fidelity M-Performance theme.",
    type: "Vehicle",
    color: "from-blue-700 to-slate-950",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000",
    icon: Car
  },
  {
    id: "title-legend",
    name: "Elite Roadmaster",
    price: 8000,
    desc: "Special 'ROADMASTER' title in diamond-cut gold font.",
    type: "Title",
    color: "from-yellow-500 to-amber-900",
    image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000",
    icon: Gem
  },
  {
    id: "porsche-911",
    name: "GT3 RS Heritage",
    price: 15000,
    desc: "The pinnacle of the garage. Complete dashboard transformation.",
    type: "Vehicle",
    color: "from-slate-800 to-black",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000",
    icon: Wind
  },
];

export default function GaragePage() {
  const { data: user, refetch } = useGetMe();
  const { toast } = useToast();
  const [isBuying, setIsBuying] = useState<string | null>(null);

  const ownedItems = JSON.parse(user?.unlockedItems || "[]");

  const handleBuy = async (itemId: string, price: number) => {
    triggerHaptic('light');
    if ((user?.coins || 0) < price) {
      triggerHaptic('error');
      toast({ title: "Insufficient Coins", description: "Earn more VID Coins by passing tests!", variant: "destructive" });
      return;
    }

    setIsBuying(itemId);
    try {
      const isGuest = localStorage.getItem('vid_token')?.includes('emergency') || localStorage.getItem('vid_token')?.includes('guest');

      if (isGuest) {
        triggerHaptic('medium');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Cinematic wait
        const currentUnlocked = JSON.parse(user?.unlockedItems || "[]");
        const newUnlocked = [...currentUnlocked, itemId];
        const updatedUser = { ...user, coins: (user?.coins || 0) - price, unlockedItems: JSON.stringify(newUnlocked) };
        localStorage.setItem('vid_cached_user', JSON.stringify(updatedUser));
        triggerHaptic('success');
        toast({ title: "Authorization Successful", description: "Asset has been allocated to your profile." });
        refetch();
      } else {
        await customFetch(`/api/shop/purchase`, { method: "POST", body: JSON.stringify({ itemId }) });
        triggerHaptic('success');
        toast({ title: "Purchase Confirmed", description: "Item added to your collection." });
        refetch();
      }
    } catch (e: any) {
      triggerHaptic('error');
      toast({ title: "Transaction Failed", description: e.message || "Engine error.", variant: "destructive" });
    } finally {
      setIsBuying(null);
    }
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-6 pb-32">
      {/* Sleeker Terminal Header */}
      <div className="bg-[#020617] p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl border border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 text-center md:text-left space-y-3">
           <div className="flex items-center justify-center md:justify-start gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/15 transition-all">
                  <ArrowLeft size={16} />
                </Button>
              </Link>
              <Badge className="bg-primary/20 text-primary border-primary/30 uppercase font-black text-[9px] tracking-widest px-2.5 py-0.5">Asset Store</Badge>
           </div>
           <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none uppercase">The Garage</h1>
              <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Unlock Legend Status</p>
           </div>
        </div>

        <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-4 md:p-5 rounded-2xl flex items-center gap-4 min-w-[180px] shadow-xl">
           <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
              <Coins className="w-5 h-5 text-white" />
           </div>
           <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">VID Balance</p>
              <p className="text-2xl font-black text-white tracking-tight">{user?.coins?.toLocaleString() || 0}</p>
           </div>
        </div>
      </div>

      {/* Tighter Grid Layout */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        initial="hidden"
        animate="show"
        variants={variants.listContainer}
      >
        {SHOP_ITEMS.map((item) => {
          const isOwned = ownedItems.includes(item.id);
          const canAfford = (user?.coins || 0) >= item.price;
          const ItemIcon = item.icon;

          return (
            <motion.div
              key={item.id}
              variants={variants.listItem}
              whileHover={{ y: -5 }}
              className="relative h-full"
            >
              <Card className={cn(
                "border-0 shadow-lg ring-1 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full group",
                isOwned ? "ring-emerald-500/30 bg-emerald-500/[0.02]" : "ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900"
              )}>
                {/* Visual Preview Area */}
                <div className={cn("h-48 relative flex items-center justify-center overflow-hidden bg-gradient-to-br", item.color)}>
                   <motion.img
                     whileHover={{ scale: 1.1 }}
                     src={item.image}
                     className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 transition-transform duration-700"
                     alt={item.name}
                   />

                   <motion.div
                     animate={{
                       y: [0, -8, 0],
                       rotate: [0, 1, -1, 0]
                     }}
                     transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                     className="relative z-10"
                   >
                      <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-2xl group-hover:shadow-primary/30 transition-shadow">
                         <ItemIcon className="w-12 h-12 text-white drop-shadow-md" />
                      </div>
                   </motion.div>

                   <div className="absolute bottom-4 left-6 z-20 flex gap-2">
                      <Badge className="bg-black/50 backdrop-blur-md text-white border-0 font-black text-[7px] tracking-widest uppercase px-3 py-1 rounded-full">
                        {item.type}
                      </Badge>
                      {isOwned && (
                        <Badge className="bg-emerald-500 text-white border-0 font-black text-[7px] tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1">
                          <Check size={8} className="stroke-[4px]" /> Owned
                        </Badge>
                      )}
                   </div>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{item.name}</h3>
                      {item.price > 5000 && <Star size={14} className="text-amber-500 fill-current" />}
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                             <Coins className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <span className="text-xl font-black text-slate-900 dark:text-white">{item.price.toLocaleString()}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest pt-1">Coins</span>
                       </div>
                    </div>

                    <Button
                      onClick={() => handleBuy(item.id, item.price)}
                      disabled={isOwned || !canAfford || isBuying === item.id}
                      className={cn(
                        "w-full h-11 rounded-xl font-black uppercase text-[10px] tracking-[0.1em] transition-all active:scale-95",
                        isOwned ? "bg-slate-50 dark:bg-slate-800 text-slate-400 border-0" :
                        canAfford ? "bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-primary hover:text-white" :
                        "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 border-0 cursor-not-allowed opacity-50"
                      )}
                    >
                      {isBuying === item.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : isOwned ? (
                        "Permanently Unlocked"
                      ) : canAfford ? (
                        <span className="flex items-center gap-2"><ShoppingCart size={14} /> Authorize Unlock</span>
                      ) : (
                        "Insufficient Funds"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Compact Info Footer */}
      <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
               <Info className="w-5 h-5 text-slate-400" />
            </div>
            <div>
               <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">Profile Customization</h4>
               <p className="text-[10px] font-bold text-slate-400">Unlocked items can be equipped in Settings &gt; Appearance.</p>
            </div>
         </div>
         <Link href="/support">
            <Button variant="outline" className="h-9 px-6 rounded-lg font-black uppercase text-[9px] tracking-widest border-2">Need Support?</Button>
         </Link>
      </div>
    </div>
  );
}
