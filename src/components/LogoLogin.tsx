import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Anchor, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "love";
const ADMIN_EMAIL = "love@lovelodka.app";
const ADMIN_AUTH_PASSWORD = "love-lovelodka-admin-2026";

export function LogoLogin() {
  const { isAdmin, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      toast.error("Неверный пароль");
      return;
    }
    setLoading(true);
    let { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_AUTH_PASSWORD });
    if (error) {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: ADMIN_EMAIL, password: ADMIN_AUTH_PASSWORD,
      });
      if (signUpErr) { toast.error(signUpErr.message); setLoading(false); return; }
      if (signUpData.user) {
        await supabase.from("user_roles").insert({ user_id: signUpData.user.id, role: "admin" });
      }
      const retry = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_AUTH_PASSWORD });
      error = retry.error;
    }
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Добро пожаловать, администратор");
    setOpen(false); setPassword("");
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-primary/30 hover:border-primary transition">
            <Anchor className="w-4 h-4 text-primary" />
            <span className="text-sm font-display text-gold">LoveЛодка</span>
          </button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="text-gold">Вход администратора</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            <Button type="submit" disabled={loading} className="w-full bg-gold text-primary-foreground">
              {loading ? "..." : "Войти"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {user && isAdmin && (
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border border-primary/40 px-3 py-1.5">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs text-foreground/80">Админ</span>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => supabase.auth.signOut()}>
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
