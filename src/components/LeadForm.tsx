import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function LeadForm({ source, variant = "default" }: { source: string; variant?: "default" | "compact" }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Заполните имя и телефон");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({ name: name.trim(), phone: phone.trim(), source });
    setLoading(false);
    if (error) {
      toast.error("Не удалось отправить. Попробуйте ещё раз");
    } else {
      toast.success("Спасибо! Мастер свяжется с вами в ближайшее время.");
      setName(""); setPhone("");
    }
  };

  return (
    <form onSubmit={submit} className={variant === "compact" ? "flex flex-col sm:flex-row gap-2" : "space-y-3"}>
      <Input
        placeholder="Ваше имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={80}
        className="bg-background/60 border-border backdrop-blur"
      />
      <Input
        placeholder="+7 (___) ___-__-__"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        maxLength={30}
        type="tel"
        className="bg-background/60 border-border backdrop-blur"
      />
      <Button type="submit" disabled={loading} className="bg-gold text-primary-foreground font-semibold hover:opacity-90 shadow-glow">
        {loading ? "Отправка..." : "Заявка"}
      </Button>
    </form>
  );
}
