import React, { useState, useEffect } from "react";
import { useGetMe, useGetDashboard, useListQuestions, useListSigns, useLogout, customFetch } from "@roadify/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  User, MapPin, Trophy, Star, Shield, Loader2, Phone, Globe, Volume2,
  CloudDownload, Smartphone, Pencil, ArrowLeft, Navigation, Map,
  Palette, Bell, Lock, HelpCircle, ChevronRight, Check, Sun, Moon, Monitor,
  Trash2, LogOut, Sparkles, Zap, ShieldCheck, Fingerprint, Gauge, VolumeX, RefreshCw, Save
} from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { syncOfflineData, clearAllCache } from "@/lib/offline";
import { setSecureToken } from "@/lib/auth-bridge";
import { speak } from "@/lib/voice";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { variants, transitions } from "@/lib/motion";
import { triggerHaptic } from "@/lib/native-bridge";
import { getApiUrl } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  name: z.string().min(2, "Name too short"),
  city: z.string().min(2, "City too short"),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  language: z.string(),
  soundEnabled: z.boolean(),
  biometricEnabled: z.boolean(),
  hapticIntensity: z.string(),
  autoSyncEnabled: z.boolean(),
  voiceLanguage: z.string(),
  voiceName: z.string().optional(),
  voiceRate: z.string(),
});

type Category = "account" | "appearance" | "learning" | "security" | "help" | "danger";

interface SettingRowProps {
  icon: any;
  title: string;
  description: string;
  children?: React.ReactNode;
  onClick?: () => void;
  value?: string;
  danger?: boolean;
  className?: string;
}

function SettingRow({ icon: Icon, title, description, children, onClick, value, danger, className }: SettingRowProps) {
  return (
    <motion.div
      variants={variants.listItem}
      whileHover={{ x: 5, backgroundColor: danger ? "rgba(239, 68, 68, 0.05)" : "hsl(var(--primary) / 0.02)" }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center justify-between p-3.5 md:p-4 rounded-xl transition-all duration-200 border border-transparent bg-white shadow-sm ring-1 ring-slate-100",
        onClick ? "cursor-pointer" : "",
        danger && "ring-red-100",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            danger ? "bg-red-100 text-red-600" : "bg-slate-50 text-slate-500"
          )}
        >
          <Icon size={18} />
        </motion.div>
        <div className="min-w-0 pr-2">
          <h4 className={cn("text-[11px] font-black uppercase tracking-tight truncate", danger ? "text-red-600" : "text-slate-900")}>{title}</h4>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {value && <span className="text-[9px] font-black text-primary uppercase tracking-widest">{value}</span>}
        {children}
        {onClick && !children && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const { data: dashboard } = useGetDashboard();
  const { data: allQuestions } = useListQuestions({ limit: 1000 });
  const { data: allSigns } = useListSigns();

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [_, setLocation] = useLocation();
  const logout = useLogout();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      city: user?.city || "",
      phone: user?.phone || "",
      avatarUrl: user?.avatarUrl || "",
      language: user?.language || "en",
      soundEnabled: !!user?.soundEnabled,
      biometricEnabled: localStorage.getItem('vid_biometric_enabled') === 'true',
      hapticIntensity: localStorage.getItem('vid_haptic_intensity') || "medium",
      autoSyncEnabled: localStorage.getItem('vid_auto_sync') !== 'false',
      voiceLanguage: localStorage.getItem('vid_voice_lang') || "en-GB",
      voiceName: localStorage.getItem('vid_voice_name') || "",
      voiceRate: localStorage.getItem('vid_voice_rate') || "0.85",
    },
  });

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Filter for English voices or current selected lang for clarity
      setAvailableVoices(voices.filter(v => v.lang.startsWith('en')));
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        city: user.city || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
        language: user.language || "en",
        soundEnabled: !!user.soundEnabled,
        biometricEnabled: localStorage.getItem('vid_biometric_enabled') === 'true',
        hapticIntensity: localStorage.getItem('vid_haptic_intensity') || "medium",
        autoSyncEnabled: localStorage.getItem('vid_auto_sync') !== 'false',
        voiceLanguage: localStorage.getItem('vid_voice_lang') || "en-GB",
        voiceName: localStorage.getItem('vid_voice_name') || "",
        voiceRate: localStorage.getItem('vid_voice_rate') || "0.85",
      });
    }
  }, [user, form]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast({ title: "File too large", description: "Image must be under 1MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("avatarUrl", reader.result as string, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      localStorage.setItem('vid_voice_lang', data.voiceLanguage);
      localStorage.setItem('vid_voice_name', data.voiceName || "");
      localStorage.setItem('vid_voice_rate', data.voiceRate);
      localStorage.setItem('vid_haptic_intensity', data.hapticIntensity);
      localStorage.setItem('vid_auto_sync', data.autoSyncEnabled ? 'true' : 'false');
      localStorage.setItem('vid_biometric_enabled', data.biometricEnabled ? 'true' : 'false');

      const baseUrl = (window as any).apiUrl || getApiUrl(true);
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("vid_token")}`,
        },
        body: JSON.stringify({
          name: data.name,
          city: data.city,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
          language: data.language,
          soundEnabled: data.soundEnabled ? 1 : 0,
        }),
      });

      if (!response.ok) throw new Error("Update failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMe"] });
      toast({ title: "Profile Synced" });
    },
  });

  const categories: { id: Category; label: string; icon: any; desc: string; image: string }[] = [
    {
      id: "account",
      label: "Profile",
      icon: User,
      desc: "Your Personal Info",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "appearance",
      label: "Display",
      icon: Palette,
      desc: "Theme & UI",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "learning",
      label: "Audio",
      icon: Volume2,
      desc: "Voice & Pulse",
      image: "https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "security",
      label: "Sync",
      icon: Lock,
      desc: "Cloud & Offline",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "help",
      label: "Support",
      icon: HelpCircle,
      desc: "Help Center",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "danger",
      label: "System",
      icon: Trash2,
      desc: "Reset & Data",
      image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&q=80&w=1200"
    },
  ];

  if (isUserLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const renderCategoryContent = () => {
    switch (currentCategory) {
      case "account":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-4 bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center">
                  {form.watch("avatarUrl") ? (
                    <img src={form.watch("avatarUrl")} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-200" />
                  )}
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Pencil className="w-4 h-4 text-white" />
                  </label>
                </div>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight truncate">{user?.name}</h3>
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Lv. {user?.level} • Rank #{(dashboard as any)?.numericRank || "12"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 ml-1">Legal Name</FormLabel>
                  <FormControl><Input className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 flex items-center justify-between px-1">
                    Province / Location
                    <button
                      type="button"
                      onClick={() => { triggerHaptic('medium'); setShowLocationDialog(true); }}
                      className="text-primary hover:underline flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                    >
                      <MapPin size={10} /> Auto-Detect
                    </button>
                  </FormLabel>
                  <FormControl><Input placeholder="e.g. Harare" className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="space-y-1.5 md:col-span-2">
                  <FormLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 ml-1">Phone Contact</FormLabel>
                  <FormControl><Input className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold" placeholder="+263..." {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'light', label: 'Day', icon: Sun, color: 'bg-white border-slate-100' },
                { id: 'dark', label: 'Night', icon: Moon, color: 'bg-slate-900 border-slate-800 text-white' },
                { id: 'system', label: 'Auto', icon: Monitor, color: 'bg-slate-50 border-slate-100' }
              ].map((t) => (
                <button key={t.id} onClick={() => { triggerHaptic('light'); setTheme(t.id); }} className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  theme === t.id ? "border-primary bg-primary/5" : "border-transparent bg-white shadow-sm"
                )}>
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shadow-inner", t.color)}><t.icon size={16} /></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>

            <FormField control={form.control} name="language" render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 ml-1">Native Language</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "en"}>
                  <FormControl><SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 font-bold text-xs uppercase"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent className="rounded-xl border-0 shadow-2xl">
                    <SelectItem value="en" className="text-[10px] font-bold uppercase">English (UK)</SelectItem>
                    <SelectItem value="sn" className="text-[10px] font-bold uppercase">Shona</SelectItem>
                    <SelectItem value="nd" className="text-[10px] font-bold uppercase">Ndebele</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          </div>
        );

      case "learning":
        return (
          <div className="space-y-4">
             <div className="bg-white rounded-xl p-4 ring-1 ring-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Voice Synthesis</h3>
                   <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 rounded-lg border-primary/20 text-primary font-black text-[9px] uppercase tracking-widest gap-2"
                    onClick={() => speak("Hello! I am your Row-dee-fy assistant. I will narrate the questions for you.")}
                   >
                      <Volume2 size={12} /> Test Voice
                   </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField control={form.control} name="voiceLanguage" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 block mb-2">Accent Group</FormLabel>
                        <Select onValueChange={(v) => { field.onChange(v); localStorage.setItem('vid_voice_lang', v); }} value={field.value || "en-GB"}>
                          <FormControl><SelectTrigger className="h-10 rounded-lg bg-slate-50 border-transparent font-bold text-[10px] uppercase"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-xl border-0 shadow-2xl">
                            <SelectItem value="en-GB" className="text-[10px] font-bold uppercase">British</SelectItem>
                            <SelectItem value="en-US" className="text-[10px] font-bold uppercase">American</SelectItem>
                            <SelectItem value="en-ZA" className="text-[10px] font-bold uppercase">African</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                  )} />

                  <FormField control={form.control} name="voiceName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 block mb-2">System Voice</FormLabel>
                        <Select onValueChange={(v) => { field.onChange(v); localStorage.setItem('vid_voice_name', v); }} value={field.value || ""}>
                          <FormControl><SelectTrigger className="h-10 rounded-lg bg-slate-50 border-transparent font-bold text-[10px] uppercase"><SelectValue placeholder="Automatic Best" /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-xl border-0 shadow-2xl max-h-[200px]">
                            <SelectItem value="" className="text-[10px] font-bold uppercase">Automatic Best</SelectItem>
                            {availableVoices.map(v => (
                              <SelectItem key={v.name} value={v.name} className="text-[10px] font-bold uppercase">
                                {v.name.replace('Google ', '').split(' (')[0]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                  )} />

                  <FormField control={form.control} name="voiceRate" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-black text-[9px] uppercase tracking-widest text-slate-400 block mb-2">Tempo</FormLabel>
                        <Select onValueChange={(v) => { field.onChange(v); localStorage.setItem('vid_voice_rate', v); }} value={field.value || "0.85"}>
                          <FormControl><SelectTrigger className="h-10 rounded-lg bg-slate-50 border-transparent font-bold text-[10px] uppercase"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="rounded-xl border-0 shadow-2xl">
                            <SelectItem value="0.75" className="text-[10px] font-bold uppercase">Slow</SelectItem>
                            <SelectItem value="0.85" className="text-[10px] font-bold uppercase">Normal</SelectItem>
                            <SelectItem value="1.0" className="text-[10px] font-bold uppercase">Fast</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                  )} />
                </div>
             </div>

             <SettingRow icon={Volume2} title="Audio Feedback" description="Sound cues during simulator.">
               <Switch checked={!!form.watch("soundEnabled")} onCheckedChange={(v) => { triggerHaptic('light'); form.setValue("soundEnabled", v, { shouldDirty: true }); }} />
             </SettingRow>

             <div className="bg-white rounded-xl p-4 ring-1 ring-slate-100 shadow-sm">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5 px-0.5">Haptic Feedback</h3>
                <FormField control={form.control} name="hapticIntensity" render={({ field }) => (
                   <div className="grid grid-cols-4 gap-1.5">
                     {['none', 'light', 'med', 'high'].map((intensity) => (
                       <button key={intensity} type="button" onClick={() => { triggerHaptic(intensity === 'med' ? 'medium' : intensity === 'high' ? 'heavy' : intensity as any); field.onChange(intensity); }} className={cn(
                         "h-9 rounded-lg font-black uppercase text-[8px] tracking-tighter border-2 transition-all",
                         field.value === intensity ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-transparent text-slate-400"
                       )}>{intensity}</button>
                     ))}
                   </div>
                )} />
             </div>
          </div>
        );

      case "security":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-1 space-y-1">
                <SettingRow icon={RefreshCw} title="Cloud Sync" description="Keep your progress updated.">
                    <Switch checked={!!form.watch("autoSyncEnabled")} onCheckedChange={(v) => { triggerHaptic('light'); form.setValue("autoSyncEnabled", v, { shouldDirty: true }); }} />
                </SettingRow>
                <p className="px-2 text-[7px] text-slate-400 font-bold uppercase tracking-tight">Syncs your results automatically to all your devices.</p>
             </div>

             <div className="md:col-span-1 space-y-1">
                <SettingRow icon={Fingerprint} title="Secure Lock" description="Biometric authentication.">
                    <Switch checked={!!form.watch("biometricEnabled")} onCheckedChange={(v) => { triggerHaptic('light'); form.setValue("biometricEnabled", v, { shouldDirty: true }); }} />
                </SettingRow>
                <p className="px-2 text-[7px] text-slate-400 font-bold uppercase tracking-tight">Requires fingerprint or face ID to open the simulator.</p>
             </div>

             <div className="bg-[#020617] rounded-xl p-5 text-white overflow-hidden relative md:col-span-2 group mt-2 shadow-2xl border border-white/5">
                <div className="absolute inset-0 opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-[2s]">
                   <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

                <div className="relative z-10">
                   <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"><CloudDownload size={40} className="text-primary" /></div>
                   <h4 className="font-black text-[10px] uppercase tracking-widest mb-1">Offline Mode</h4>
                   <p className="text-[9px] text-slate-500 font-bold uppercase leading-none mb-4">Study without an internet connection</p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                     <Button variant="outline" className="w-full h-10 border-white/10 bg-white/5 hover:bg-white/10 font-black uppercase text-[9px] tracking-widest gap-2 text-white rounded-lg" onClick={async () => {
                        triggerHaptic('medium');
                        setIsSyncing(true);
                        await syncOfflineData(allQuestions || [], allSigns || []);
                        setTimeout(() => { setIsSyncing(false); toast({ title: "Cache Validated" }); }, 800);
                     }} disabled={isSyncing}>
                        {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                        Verify Content
                     </Button>
                     <Button variant="secondary" className="w-full h-10 bg-primary text-white font-black uppercase text-[9px] tracking-widest gap-2 rounded-lg" onClick={() => {
                        triggerHaptic('heavy');
                        window.location.reload();
                     }}>
                        <RefreshCw size={12} /> Force Reload
                     </Button>
                   </div>
                </div>
             </div>
          </div>
        );

      case "help":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SettingRow icon={HelpCircle} title="Guides" description="Intelligence base." onClick={() => setLocation("/support")} />
            <SettingRow icon={Smartphone} title="Support" description="Engineering team." onClick={() => setLocation("/support")} />
            <div className="md:col-span-2 p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary"><Navigation size={20} /></div>
                  <div className="min-w-0 text-left">
                     <h3 className="text-[11px] font-black uppercase tracking-tight">Roadify Zimbabwe</h3>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Build 1.0.0 (Gold)</p>
                  </div>
               </div>
               <Button variant="link" className="text-[9px] font-black uppercase tracking-widest text-primary p-0 h-auto" onClick={() => window.open('https://roadify.co.zw', '_blank')}>Web Portal</Button>
            </div>
          </div>
        );

      case "danger":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <AlertDialog>
                <AlertDialogTrigger asChild>
                   <div className="md:col-span-2">
                     <SettingRow
                       icon={Trash2}
                       title="Wipe Engine"
                       description="Erase all local and cloud telemetry."
                       danger
                       className="cursor-pointer"
                     />
                   </div>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8 max-w-xs">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4"><Trash2 size={24} /></div>
                  <AlertDialogHeader><AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-center">Execute Wipe?</AlertDialogTitle><AlertDialogDescription className="font-bold text-[9px] text-slate-400 uppercase tracking-widest text-center leading-relaxed px-4">Telemetry deletion is permanent and cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2 pt-6">
                    <AlertDialogAction className="bg-red-500 text-white rounded-xl h-11 font-black uppercase text-[9px] tracking-widest" onClick={async () => {
                        triggerHaptic('heavy');
                        try {
                          const isGuest = localStorage.getItem('vid_token')?.includes('emergency') || localStorage.getItem('vid_token')?.includes('guest');
                          if (!isGuest) await customFetch('/api/progress/reset', { method: 'POST' });
                          ['vid_cached_dashboard','vid_cached_stats','vid_cached_categories','vid_pending_results'].forEach(k => localStorage.removeItem(k));
                          toast({ title: "Engine Zeroed" });
                          setTimeout(() => window.location.reload(), 800);
                        } catch (e) { toast({ title: "Error", variant: "destructive" }); }
                      }}>Confirm Deletion</AlertDialogAction>
                    <AlertDialogCancel className="rounded-xl h-11 font-bold uppercase text-[9px] border-2">Keep My Data</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>

             <SettingRow icon={LogOut} title="Terminate Session" description="Securely disconnect this device." onClick={() => {
                 triggerHaptic('medium');
                 setSecureToken(null);
                 clearAllCache();
                 window.location.href = "/";
             }} danger className="md:col-span-2" />
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="p-3 md:p-6 lg:p-10 max-w-6xl mx-auto space-y-6 pb-32">
      {/* Dynamic Slim Header */}
      <div className="flex items-center justify-between bg-white p-4 md:p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          {currentCategory && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 -ml-1 mr-1"
              onClick={() => setCurrentCategory(null)}
            >
              <ArrowLeft size={18} />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-black tracking-tighter text-slate-900 leading-none uppercase truncate">
              {currentCategory ? categories.find(c => c.id === currentCategory)?.label : "Preferences"}
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">
              {currentCategory ? categories.find(c => c.id === currentCategory)?.desc : "Configure your simulation space"}
            </p>
          </div>
        </div>

        {currentCategory && (
           <Button
             onClick={form.handleSubmit((d) => updateProfile.mutate(d))}
             className="h-9 px-5 rounded-lg bg-primary text-white font-black uppercase text-[9px] tracking-widest gap-2 shrink-0 shadow-lg active:scale-95 transition-all"
             disabled={updateProfile.isPending}
           >
             {updateProfile.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
             Apply Changes
           </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <AnimatePresence mode="wait">
          {!currentCategory || window.innerWidth >= 1024 ? (
            <motion.div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3", currentCategory ? "lg:col-span-4 hidden lg:grid" : "lg:col-span-12")} initial="hidden" animate="show" variants={variants.listContainer}>
              {categories.map((cat, i) => (
                <motion.div key={cat.id} variants={variants.listItem} onClick={() => { triggerHaptic('light'); setCurrentCategory(cat.id); }} className={cn(
                  "p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col lg:flex-row items-center lg:justify-between text-center lg:text-left gap-3 relative overflow-hidden group/item",
                  currentCategory === cat.id ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02] z-10" : "bg-white border-slate-100 hover:border-primary/20"
                )}>
                  {/* Subtle 4K Hover Background */}
                  <div className="absolute inset-0 opacity-0 group-hover/item:opacity-10 transition-opacity duration-500 pointer-events-none">
                     <img src={cat.image} className="w-full h-full object-cover" alt="" />
                  </div>

                  <div className="flex flex-col lg:flex-row items-center gap-2.5 min-w-0 relative z-10">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0", currentCategory === cat.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400")}>
                      <cat.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-[10px] uppercase tracking-widest truncate">{cat.label}</h3>
                      <p className={cn("text-[7px] font-bold uppercase opacity-50 mt-0.5", currentCategory === cat.id ? "text-slate-300" : "text-slate-400")}>{cat.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className={cn("hidden lg:block w-3.5 h-3.5 transition-all shrink-0", currentCategory === cat.id ? "text-primary translate-x-1" : "text-slate-200")} />
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentCategory && (
            <motion.div className="lg:col-span-8 w-full" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={transitions.fast}>
              <div className="p-1 space-y-6">
                 {/* 4K Hero Banner for Category */}
                 <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-32 md:h-40 w-full rounded-2xl md:rounded-3xl overflow-hidden relative shadow-2xl border border-white/10 group/hero"
                 >
                    <img
                      src={categories.find(c => c.id === currentCategory)?.image}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover/hero:scale-110"
                      alt="Banner"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex items-end p-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg">
                             {React.createElement(categories.find(c => c.id === currentCategory)?.icon, { size: 20 })}
                          </div>
                          <div>
                             <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                               {categories.find(c => c.id === currentCategory)?.label}
                             </h2>
                             <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-1 drop-shadow-md">
                               {categories.find(c => c.id === currentCategory)?.desc}
                             </p>
                          </div>
                       </div>
                    </div>
                 </motion.div>

                 <Form {...form}>
                   <form className="grid gap-3" onSubmit={form.handleSubmit((d) => updateProfile.mutate(d))}>
                     {renderCategoryContent()}

                     {/* Footer Action for Mobile/Flow */}
                     <div className="pt-6 border-t mt-4 flex flex-col gap-3">
                        <Button
                          type="submit"
                          className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                          Commit Changes to Profile
                        </Button>
                        <p className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-widest">
                          Last synchronized: {new Date().toLocaleTimeString()}
                        </p>
                     </div>
                   </form>
                 </Form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <AlertDialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8 max-w-xs">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 shadow-inner"><MapPin size={28} /></div>
          <div className="text-center space-y-2 mb-6">
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Geo Access?</AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">Required for Regional Mock Exam calibration.</AlertDialogDescription>
          </div>
          <div className="flex flex-col gap-2">
            <AlertDialogAction className="bg-slate-900 text-white rounded-xl h-11 font-black uppercase text-[9px] tracking-widest shadow-xl" onClick={async () => {
                setIsLocating(true); setShowLocationDialog(false);
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
                    const data = await res.json();
                    form.setValue("city", data.city || data.locality || "Zimbabwe", { shouldDirty: true });
                    toast({ title: "City Locked" });
                    setIsLocating(false);
                  }, () => setIsLocating(false));
                }
            }}>Authorize GPS</AlertDialogAction>
            <AlertDialogCancel className="rounded-xl h-11 font-bold uppercase text-[9px] border-2">Typing manually</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
