import { useListUsers, useUpdateUserRole } from "@roadify/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Shield, Mail, Calendar, Trophy, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function ManageUsers() {
  const { data: users, isLoading, refetch } = useListUsers({ limit: 100 });
  const updateRole = useUpdateUserRole();
  const { toast } = useToast();

  const handleRoleChange = (id: number, newRole: "learner" | "admin") => {
    updateRole.mutate(
      { id, data: { role: newRole } },
      {
        onSuccess: () => {
          toast({ title: "Role updated successfully" });
          refetch();
        },
        onError: (err) => {
          toast({ title: "Failed to update role", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="p-3 md:p-4 w-full space-y-3 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg md:text-xl font-black tracking-tight text-primary uppercase leading-none">User Directory</h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{users?.length || 0} Registered Members</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
           <User size={12} className="text-primary" />
           <span className="text-[9px] font-black uppercase text-primary tracking-widest">{users?.filter(u => u.role === 'learner')?.length || 0} Active Learners</span>
        </div>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent h-9">
                  <TableHead className="w-[50px] text-center font-black uppercase text-[8px] tracking-widest">ID</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Profile</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Contact</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Stats</TableHead>
                  <TableHead className="w-[140px] font-black uppercase text-[8px] tracking-widest text-right px-4">Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold uppercase text-[9px]">Accessing Identity Records...</TableCell></TableRow>
                ) : !users || users.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold uppercase text-[9px]">Zero Users Indexed.</TableCell></TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className="h-12 hover:bg-slate-50/50 transition-colors border-b">
                      <TableCell className="font-mono text-[9px] text-center text-slate-300 font-bold px-1">#{u.id}</TableCell>
                      <TableCell className="px-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8 rounded-lg shadow-sm border border-slate-100">
                            {u.avatarUrl && <AvatarImage src={u.avatarUrl} className="object-cover" />}
                            <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-[9px]">
                              {u.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-[11px] uppercase leading-none truncate">{u.name}</p>
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{u.city || "Zimbabwe"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 truncate max-w-[150px]">
                            <Mail size={10} className="text-slate-300" />
                            {u.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="flex items-center gap-3">
                           <div className="flex flex-col">
                              <span className="text-[6px] font-black text-slate-400 uppercase">Lv</span>
                              <span className="font-black text-primary text-xs leading-none">{u.level}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[6px] font-black text-slate-400 uppercase">Sims</span>
                              <span className="font-black text-slate-900 text-xs leading-none">{u.totalTests || 0}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[6px] font-black text-slate-400 uppercase">XP</span>
                              <span className="font-black text-emerald-600 text-xs leading-none">{u.xp?.toLocaleString() || 0}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex justify-end">
                          <Select
                            defaultValue={u.role}
                            onValueChange={(v) => handleRoleChange(u.id, v as "learner" | "admin")}
                            disabled={updateRole.isPending}
                          >
                            <SelectTrigger className={cn(
                              "h-7 w-[100px] rounded-md font-black text-[8px] uppercase tracking-widest transition-all",
                              u.role === 'admin' ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white border-slate-100 text-slate-500"
                            )}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-slate-200 shadow-xl">
                              <SelectItem value="learner" className="font-bold text-[9px] uppercase">Learner</SelectItem>
                              <SelectItem value="admin" className="font-bold text-[9px] uppercase text-primary">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
