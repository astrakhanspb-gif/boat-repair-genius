import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ensureAdminUser } from "@/lib/admin.functions";
import { Anchor, LogOut, Shield, X } from "lucide-react";
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
        await ensureAdminUser();
      }
      const retry = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_AUTH_PASSWORD });
      error = retry.error;
    }
    await ensureAdminUser();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Добро пожаловать, администратор");
    setOpen(false); setPassword("");
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-primary/30 hover:border-primary transition"
      >
        <Anchor className="w-4 h-4 text-primary" />
        <span className="text-sm font-display text-gold">LoveЛодка</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] pointer-events-auto">
          <button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-deep">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gold">Вход администратора</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              <Button type="submit" disabled={loading} className="w-full bg-gold text-primary-foreground">
                {loading ? "..." : "Войти"}
              </Button>
            </form>
          </div>
        </div>
      )}

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
