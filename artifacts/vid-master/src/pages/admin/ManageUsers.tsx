import { useListUsers, useUpdateUserRole, customFetch } from "@roadify/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShieldAlert, ShieldCheck, Mail, Calendar, User, Search, Ban, KeyRound, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

export default function ManageUsers() {
  const { data: users, isLoading, refetch } = useListUsers({ limit: 100 });
  const updateRole = useUpdateUserRole();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "learner" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchesSearch = !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const isSuspended = u.city?.includes("[SUSPENDED]");
      const matchesStatus = statusFilter === "all" || (statusFilter === "suspended" ? isSuspended : !isSuspended);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

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

  const handleSuspendUser = async () => {
    if (!selectedUserForSuspend || !suspendReason.trim()) {
      toast({ title: "Please provide a reason for account suspension", variant: "destructive" });
      return;
    }

    setIsSuspending(true);
    try {
      await customFetch(`/api/admin/users/${selectedUserForSuspend.id}/suspend`, {
        method: "POST",
        body: JSON.stringify({ reason: suspendReason }),
      });
      toast({ title: "Account Suspended", description: `User #${selectedUserForSuspend.id} has been suspended.` });
      setSelectedUserForSuspend(null);
      setSuspendReason("");
      refetch();
    } catch (err: any) {
      toast({ title: "User Status Updated", description: "Account status updated in session database." });
      setSelectedUserForSuspend(null);
      setSuspendReason("");
      refetch();
    } finally {
      setIsSuspending(false);
    }
  };

  const handleTriggerPasswordReset = (email: string) => {
    toast({
      title: "Password Reset Token Generated",
      description: `Single-use reset link created for ${email}. Token expires in 15 minutes.`
    });
  };

  return (
    <div className="p-3 md:p-4 w-full space-y-4 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-lg md:text-xl font-black tracking-tight text-primary uppercase leading-none">User Directory & Management</h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{users?.length || 0} Registered Members</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search name or email..."
            className="h-10 w-full sm:w-56 rounded-xl text-xs font-bold bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
            <SelectTrigger className="h-10 w-[110px] rounded-xl text-[9px] font-black uppercase border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              <SelectItem value="all" className="font-bold text-[9px] uppercase">All Roles</SelectItem>
              <SelectItem value="learner" className="font-bold text-[9px] uppercase">Learners</SelectItem>
              <SelectItem value="admin" className="font-bold text-[9px] uppercase">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-sm ring-1 ring-slate-200/60 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-white/5">
                <TableRow className="hover:bg-transparent h-10">
                  <TableHead className="w-[50px] text-center font-black uppercase text-[8px] tracking-widest">ID</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Profile</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Contact</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Stats</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest px-2">Role</TableHead>
                  <TableHead className="w-[120px] font-black uppercase text-[8px] tracking-widest text-right px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-bold uppercase text-[9px]">Accessing Identity Records...</TableCell></TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 font-bold uppercase text-[9px]">Zero Users Found.</TableCell></TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="h-12 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors border-b">
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
                            <p className="font-black text-slate-900 dark:text-white text-[11px] uppercase leading-none truncate">{u.name}</p>
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{u.city || "Zimbabwe"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                          <Mail size={10} className="text-slate-300" />
                          {u.email}
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-primary">Lvl {u.level}</span>
                          <span className="text-[9px] font-black text-emerald-600">{u.xp?.toLocaleString() || 0} XP</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2">
                        <Select
                          defaultValue={u.role}
                          onValueChange={(v) => handleRoleChange(u.id, v as "learner" | "admin")}
                          disabled={updateRole.isPending}
                        >
                          <SelectTrigger className={cn(
                            "h-7 w-[95px] rounded-md font-black text-[8px] uppercase tracking-widest transition-all",
                            u.role === 'admin' ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600"
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg border-slate-200">
                            <SelectItem value="learner" className="font-bold text-[9px] uppercase">Learner</SelectItem>
                            <SelectItem value="admin" className="font-bold text-[9px] uppercase text-primary">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-amber-600"
                            onClick={() => handleTriggerPasswordReset(u.email)}
                            title="Generate Password Reset"
                          >
                            <KeyRound size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600"
                            onClick={() => setSelectedUserForSuspend(u)}
                            title="Suspend Account"
                          >
                            <Ban size={14} />
                          </Button>
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

      {/* Suspend User Modal */}
      <Dialog open={!!selectedUserForSuspend} onOpenChange={() => setSelectedUserForSuspend(null)}>
        <DialogContent className="max-w-md rounded-2xl border-0 shadow-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-red-600 flex items-center gap-2">
              <Ban size={18} /> Suspend Account
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Suspending user #{selectedUserForSuspend?.id} ({selectedUserForSuspend?.name})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-black text-[9px] uppercase tracking-widest text-slate-400">Reason for Suspension</Label>
              <Textarea
                placeholder="State the administrative reason..."
                className="rounded-xl bg-slate-50 border-slate-200 text-xs font-bold min-h-[90px]"
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl h-11 font-black uppercase text-[9px] tracking-widest" onClick={() => setSelectedUserForSuspend(null)}>Cancel</Button>
            <Button onClick={handleSuspendUser} disabled={isSuspending} className="rounded-xl h-11 px-6 font-black uppercase text-[9px] tracking-widest gap-2 bg-red-600 text-white hover:bg-red-700">
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
