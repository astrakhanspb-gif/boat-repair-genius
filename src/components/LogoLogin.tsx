import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ensureAdminUser } from "@/lib/admin.functions";
import { Anchor, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";

const ADMIN_PASSWORD = "love";
const ADMIN_EMAIL = "love@lovelodka.app";
const ADMIN_AUTH_PASSWORD = "love-lovelodka-admin-2026";

export function LogoLogin() {
  const { isAdmin, user } = useAuth();

  const submit = async (password: string) => {
    if (password !== ADMIN_PASSWORD) {
      toast.error("Неверный пароль");
      return;
    }
    let { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_AUTH_PASSWORD });
    if (error) {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: ADMIN_EMAIL, password: ADMIN_AUTH_PASSWORD,
      });
      if (signUpErr) { toast.error(signUpErr.message); return; }
      if (signUpData.user) {
        await ensureAdminUser();
      }
      const retry = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_AUTH_PASSWORD });
      error = retry.error;
    }
    await ensureAdminUser();
    if (error) { toast.error(error.message); return; }
    toast.success("Добро пожаловать, администратор");
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
      <button
        type="button"
        onClick={async () => {
          const password = window.prompt("Введите пароль администратора", "");
          if (password == null) return;
          await submit(password);
        }}
        className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-primary/30 hover:border-primary transition"
      >
        <Anchor className="w-4 h-4 text-primary" />
        <span className="text-sm font-display text-gold">LoveЛодка</span>
      </button>

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
