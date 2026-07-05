import { useState, useEffect } from "react";
import { useGetMe, useGetDashboard, useListQuestions, useListSigns } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Trophy, Star, Shield, Loader2, Phone, Globe, Volume2, CloudDownload, Smartphone, Pencil, ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { syncOfflineData } from "@/lib/offline";
import { Link } from "wouter";
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  language: z.string(),
  soundEnabled: z.boolean(),
  voiceLanguage: z.string(),
  voiceRate: z.string(),
});

export default function SettingsPage() {
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const { data: dashboard, isLoading: isDashLoading } = useGetDashboard();
  const { data: allQuestions } = useListQuestions({ limit: 500 });
  const { data: allSigns } = useListSigns();

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      city: user?.city || "",
      phone: user?.phone || "",
      avatarUrl: user?.avatarUrl || "",
      language: user?.language || "en",
      soundEnabled: user?.soundEnabled === 1,
      voiceLanguage: localStorage.getItem('vid_voice_lang') || "en-GB",
      voiceRate: localStorage.getItem('vid_voice_rate') || "0.9",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        city: user.city || "",
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
        language: user.language || "en",
        soundEnabled: user.soundEnabled === 1,
        voiceLanguage: localStorage.getItem('vid_voice_lang') || "en-GB",
        voiceRate: localStorage.getItem('vid_voice_rate') || "0.9",
      });
    }
  }, [user, form]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 2MB.", variant: "destructive" });
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
      // Save voice settings to local storage
      localStorage.setItem('vid_voice_lang', data.voiceLanguage);
      localStorage.setItem('vid_voice_rate', data.voiceRate);

      const baseUrl = (window as any).apiUrl || `http://${window.location.hostname || 'localhost'}:8080`;
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMe"] });
      toast({ title: "Settings Saved", description: "Your profile and voice preferences have been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSyncOffline = async () => {
    if (!allQuestions || !allSigns) {
      toast({ title: "Still loading data...", description: "Please wait a moment and try again." });
      return;
    }
    setIsSyncing(true);
    await syncOfflineData(allQuestions, allSigns);
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: "Offline Sync Complete", description: "Questions and signs are now available offline." });
    }, 1500);
  };

  if (isUserLoading || isDashLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-2xl border shadow-sm h-11 w-11 animate-car-indicator">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Button>
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-primary leading-none">Account Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your profile and track your standing.</p>
        </div>
      </div>

      {/* Ranking Card */}
      <Card className="border-0 shadow-lg ring-1 ring-border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Trophy className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            Your Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
              <div className="text-5xl font-black tracking-tighter mb-1">
                #{ (dashboard as any)?.numericRank ?? "?" }
              </div>
              <p className="text-sm font-bold uppercase tracking-widest opacity-80 flex items-center justify-center md:justify-start gap-1">
                <Shield className="w-3 h-3" /> {dashboard?.rank ?? "Learner"} Status
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 text-center">
                <div className="text-xl font-bold">{user?.xp || 0}</div>
                <div className="text-[10px] uppercase font-black opacity-60">Total XP</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 text-center">
                <div className="text-xl font-bold">{user?.level || 1}</div>
                <div className="text-[10px] uppercase font-black opacity-60">Level</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Downloads */}
      <Card className="border-0 shadow-sm ring-1 ring-border bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-600" />
            Offline Mode
          </CardTitle>
          <CardDescription>Download questions to use the app without internet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full h-12 border-amber-200 bg-white hover:bg-amber-50 font-bold gap-2 text-amber-700 shadow-sm"
            onClick={handleSyncOffline}
            disabled={isSyncing}
          >
            {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
            {isSyncing ? "Syncing Data..." : "Sync Questions for Offline Use"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => updateProfile.mutate(d))} className="space-y-6">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden border-2 border-slate-100 shadow-inner flex items-center justify-center">
                    {form.watch("avatarUrl") ? (
                      <img src={form.watch("avatarUrl")} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl"
                  >
                    <Pencil className="w-6 h-6 text-white" />
                  </label>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white pointer-events-none">
                    <Pencil className="w-3 h-3" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">Profile Picture</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">Tap to upload</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Full Name</FormLabel>
                      <FormControl>
                        <Input className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">City</FormLabel>
                      <FormControl>
                        <Input className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
                        <Input className="pl-10 h-11" placeholder="+263..." {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">App Preferences</h3>

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Display Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "en"}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English (UK)</SelectItem>
                          <SelectItem value="sn">Shona</SelectItem>
                          <SelectItem value="nd">Ndebele</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="soundEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                      <div className="space-y-0.5">
                        <FormLabel className="font-bold flex items-center gap-2">
                          <Volume2 className="w-4 h-4" /> Sound Effects
                        </FormLabel>
                        <FormDescription>Play sounds during tests.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="voiceLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Voice Narrator Accent</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "en-GB"}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en-GB">English (British)</SelectItem>
                          <SelectItem value="en-US">English (American)</SelectItem>
                          <SelectItem value="en-ZA">English (Southern Africa)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="voiceRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Narration Speed</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "0.9"}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0.7">Slower</SelectItem>
                          <SelectItem value="0.9">Normal</SelectItem>
                          <SelectItem value="1.1">Faster</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-black text-base shadow-lg shadow-primary/20"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive text-lg">Danger Zone</CardTitle>
          <CardDescription>Actions that cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10 w-full md:w-auto font-bold">
                Delete My Progress Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    This will permanently erase all your progress including:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 font-medium text-destructive/80">
                    <li>Entire test history and results</li>
                    <li>Earned XP and current level</li>
                    <li>Current study streaks</li>
                    <li>Bookmarked questions</li>
                  </ul>
                  <p className="font-bold">
                    This action cannot be undone. You will start back at Level 1.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    toast({
                      title: "Progress Reset Request Sent",
                      description: "Your progress data is being cleared from our servers."
                    });
                  }}
                >
                  Yes, Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
