import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Smartphone, ShieldCheck, CheckCircle2, Save, Rocket } from "lucide-react";
import { useState } from "react";

export default function AppVersionManager() {
  const { toast } = useToast();

  const [versionConfig, setVersionConfig] = useState({
    latestVersion: "1.0.1",
    minimumSupportedVersion: "1.0.0",
    mandatoryUpdate: false,
    releaseNotes: "Initial 2026 VID Zimbabwe provisional licence update with full SADC road signs and offline exam mode."
  });

  const [isSaving, setIsSending] = useState(false);

  const handleSaveVersion = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "App Version Policy Updated",
        description: `Version ${versionConfig.latestVersion} set as target release.`
      });
    }, 600);
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-0.5 border-0">
              App Version Policy
            </Badge>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mobile Release Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">App Version Control</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
            Minimum Version Enforcement &bull; Mandatory Update Toggles &bull; Release Notes
          </p>
        </div>

        <div className="relative z-10 w-full sm:w-auto">
          <Button
            onClick={handleSaveVersion}
            disabled={isSaving}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest gap-2 shadow-xl hover:bg-primary/90"
          >
            <Save size={16} /> Save Policy
          </Button>
        </div>
      </div>

      {/* Version Form */}
      <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Latest Released Version</label>
            <Input
              value={versionConfig.latestVersion}
              onChange={e => setVersionConfig({...versionConfig, latestVersion: e.target.value})}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Minimum Supported Version</label>
            <Input
              value={versionConfig.minimumSupportedVersion}
              onChange={e => setVersionConfig({...versionConfig, minimumSupportedVersion: e.target.value})}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono font-bold"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div>
            <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Enforce Mandatory Update</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Block outdated client APK versions from launching</p>
          </div>
          <Switch
            checked={versionConfig.mandatoryUpdate}
            onCheckedChange={v => setVersionConfig({...versionConfig, mandatoryUpdate: v})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Release Notes</label>
          <Textarea
            value={versionConfig.releaseNotes}
            onChange={e => setVersionConfig({...versionConfig, releaseNotes: e.target.value})}
            className="min-h-[120px] rounded-xl bg-slate-50 dark:bg-slate-800 font-medium text-xs"
          />
        </div>
      </Card>
    </div>
  );
}
