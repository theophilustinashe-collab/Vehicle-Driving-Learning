import { useListUsers, useUpdateUserRole } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Shield, Mail, Calendar, Trophy, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
    <div className="p-4 md:p-8 w-full space-y-10 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">User Directory</h1>
          <p className="text-lg font-medium text-muted-foreground mt-2">Managing {users?.length || 0} registered members across Zimbabwe.</p>
        </div>
        <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl border border-primary/10">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Active Learners</p>
            <p className="text-2xl font-black text-slate-900">{users?.filter(u => u.role === 'learner')?.length || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-2xl ring-1 ring-slate-200/60 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[80px] h-16 text-center font-black uppercase text-[10px] tracking-widest">ID</TableHead>
                  <TableHead className="h-16 font-black uppercase text-[10px] tracking-widest">User Profile</TableHead>
                  <TableHead className="h-16 font-black uppercase text-[10px] tracking-widest">Contact Information</TableHead>
                  <TableHead className="h-16 font-black uppercase text-[10px] tracking-widest">Growth & Stats</TableHead>
                  <TableHead className="w-[200px] h-16 font-black uppercase text-[10px] tracking-widest text-right px-8">Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold">
                      Fetching encrypted user data...
                    </TableCell>
                  </TableRow>
                ) : !users || users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold">No users registered yet.</TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className="h-24 hover:bg-slate-50/50 transition-colors border-b">
                      <TableCell className="font-mono text-xs text-center text-slate-400 font-bold">#{u.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 rounded-2xl shadow-sm border-2 border-white ring-1 ring-slate-100">
                            {u.avatarUrl && <AvatarImage src={u.avatarUrl} className="object-cover" />}
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
                              {u.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-none">{u.name}</p>
                            <Badge variant="outline" className="mt-1.5 text-[9px] font-black uppercase tracking-widest py-0 h-4 border-slate-200">
                              {u.city || "Zimbabwe"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {u.email}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" /> Joined {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Level</span>
                              <span className="font-black text-primary text-xl leading-none">{u.level}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Tests</span>
                              <span className="font-black text-slate-900 text-xl leading-none">{u.totalTests || 0}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total XP</span>
                              <span className="font-black text-emerald-600 text-xl leading-none">{u.xp?.toLocaleString() || 0}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <div className="flex justify-end">
                          <Select
                            defaultValue={u.role}
                            onValueChange={(v) => handleRoleChange(u.id, v as "learner" | "admin")}
                            disabled={updateRole.isPending}
                          >
                            <SelectTrigger className={cn(
                              "h-12 w-[160px] rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                              u.role === 'admin' ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-slate-200 text-slate-600"
                            )}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
                              <SelectItem value="learner" className="font-bold py-3">Standard Learner</SelectItem>
                              <SelectItem value="admin" className="font-bold py-3 text-primary">
                                <div className="flex items-center">
                                  <ShieldAlert className="w-4 h-4 mr-2" /> Administrator
                                </div>
                              </SelectItem>
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
