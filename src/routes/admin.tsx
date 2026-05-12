import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: AdminLogin });

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("user_roles").insert({ user_id: data.user.id, role: "admin" });
      }
      toast.success("Аккаунт создан");
      navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success("Добро пожаловать");
      navigate({ to: "/" });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card/80 backdrop-blur border border-border p-8 shadow-deep">
        <h1 className="text-2xl font-display text-gold mb-1">Админ</h1>
        <p className="text-sm text-muted-foreground mb-6">{mode === "login" ? "Вход для администратора" : "Создание администратора"}</p>
        <form onSubmit={submit} className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          <Button type="submit" disabled={loading} className="w-full bg-gold text-primary-foreground">
            {loading ? "..." : mode === "login" ? "Войти" : "Создать"}
          </Button>
        </form>
        <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 text-xs text-muted-foreground hover:text-primary w-full text-center">
          {mode === "login" ? "Создать первого администратора" : "У меня уже есть аккаунт"}
        </button>
      </div>
    </main>
  );
}
