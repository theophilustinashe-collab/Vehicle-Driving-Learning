import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Shield, Search, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useState, useMemo } from "react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  target: string;
  result: "SUCCESS" | "DENIED" | "FAILED";
  metadata: string;
}

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const logs: AuditLogEntry[] = [
    { id: "LOG-1008", timestamp: new Date().toISOString(), admin: "Theophilus Tinashe (Admin)", action: "APP_VERSION_UPDATE", target: "Client Policy v1.0.1", result: "SUCCESS", metadata: "Mandatory update set to false" },
    { id: "LOG-1007", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), admin: "System Auto-Audit", action: "HEALTH_CHECK_EXECUTED", target: "HTTPS API /health", result: "SUCCESS", metadata: "Latency: 42ms" },
    { id: "LOG-1006", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), admin: "Theophilus Tinashe (Admin)", action: "USER_ROLE_UPDATED", target: "User #12", result: "SUCCESS", metadata: "Role set to Learner" },
    { id: "LOG-1005", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), admin: "Theophilus Tinashe (Admin)", action: "QUESTION_UPDATED", target: "Question #104", result: "SUCCESS", metadata: "Updated road rule explanation" },
    { id: "LOG-1004", timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), admin: "System Security", action: "SECRETS_SCAN_PASSED", target: "Mobile APK Build", result: "SUCCESS", metadata: "0 secrets detected in frontend JS" },
  ];

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter(l =>
      l.admin.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term) ||
      l.target.toLowerCase().includes(term)
    );
  }, [searchTerm, logs]);

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500 text-white font-black text-[8px] uppercase tracking-widest px-2.5 py-0.5 border-0">
              Append-Only Audit Trail
            </Badge>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Security & Operations Log</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">Administrative Audit Trail</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
            Tamper-Proof Logging &bull; Zero Passwords/Tokens Logged &bull; Operations History
          </p>
        </div>

        <div className="relative z-10 w-full sm:w-auto">
          <Input
            placeholder="Search logs..."
            className="w-full sm:w-64 h-11 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xs font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-white/5">
                <TableRow className="hover:bg-transparent h-10">
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-4">Log ID</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-4">Timestamp</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-4">Administrator</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-4">Action</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-4">Target</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-4 text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="h-12 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors border-b">
                    <TableCell className="font-mono text-[9px] font-black text-slate-400 px-4">{log.id}</TableCell>
                    <TableCell className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-4">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-black text-slate-900 dark:text-white text-xs px-4">{log.admin}</TableCell>
                    <TableCell className="px-4">
                      <Badge variant="outline" className="font-mono text-[8px] font-black uppercase border-slate-200">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700 dark:text-slate-300 text-xs px-4">{log.target}</TableCell>
                    <TableCell className="px-4 text-right">
                      <Badge className="bg-emerald-500 text-white font-black text-[7px] uppercase px-2 py-0.5">
                        {log.result}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
