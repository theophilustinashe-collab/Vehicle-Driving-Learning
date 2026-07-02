import { useState, useEffect } from "react";
import { useGetMe, useGetDashboard } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Trophy, Star, Shield, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
});

export default function SettingsPage() {
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const { data: dashboard, isLoading: isDashLoading } = useGetDashboard();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      city: user?.city || "",
    },
  });

  // Update default values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        city: user.city || "",
      });
    }
  }, [user, form]);

  const updateProfile = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      // Use the global URL set in App.tsx, which handles local/prod logic
      const baseUrl = (window as any).apiUrl ||
                     `http://${window.location.hostname || 'localhost'}:8080`;

      const cleanBaseUrl = baseUrl.replace(/\/$/, "");
      const fullUrl = `${cleanBaseUrl}/api/auth/profile`;

      console.log(`[Settings] Updating profile at: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("vid_token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getMe"] });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfile.mutate(data);
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
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile and track your competitive standing.</p>
      </div>

      {/* Leaderboard Status Card */}
      <Card className="border-0 shadow-lg ring-1 ring-border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Trophy className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            Your Ranking
          </CardTitle>
          <CardDescription className="text-primary-foreground/70">
            Current standing among all learners in Zimbabwe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-5xl font-black tracking-tighter mb-1">
                #{ (dashboard as any)?.numericRank || "N/A"}
              </div>
              <p className="text-sm font-bold uppercase tracking-widest opacity-80 flex items-center justify-center md:justify-start gap-1">
                <Shield className="w-3 h-3" /> {dashboard?.rank || "Beginner"} Status
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 text-center">
                <div className="text-xl font-bold">{user?.xp || 0}</div>
                <div className="text-[10px] uppercase font-black opacity-60">Total XP</div>
              </div>
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 text-center">
                <div className="text-xl font-bold">{user?.level || 1}</div>
                <div className="text-[10px] uppercase font-black opacity-60">Current Level</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center md:text-left">
            <p className="text-sm font-medium italic opacity-90">
              "Keep practicing! You're only {1000 - ((user?.xp || 0) % 1000)} XP away from your next level up."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="border-0 shadow-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information displayed on the leaderboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Display Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
                        <Input placeholder="Your full name" className="pl-10 h-11" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      This is how your name will appear on the national leaderboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">City / Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground" />
                        <Input placeholder="e.g. Harare, Bulawayo" className="pl-10 h-11" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Help us group you with other learners in your region.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 font-black text-base shadow-lg shadow-primary/20"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : "Update Profile"}
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
          <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10 w-full md:w-auto font-bold">
            Delete My Progress Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
