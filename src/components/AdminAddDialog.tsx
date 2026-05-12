import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";

async function uploadImage(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) { toast.error("Ошибка загрузки фото"); return null; }
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

interface Field { name: string; label: string; type?: "text" | "textarea" | "file"; required?: boolean }

export function AdminAddDialog({
  label, fields, table, onDone,
}: {
  label: string;
  fields: Field[];
  table: "services" | "reviews" | "objections";
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: Record<string, string | null> = { ...values };
    const fileField = fields.find((f) => f.type === "file");
    if (fileField && file) {
      const url = await uploadImage(file);
      payload[fileField.name] = url;
    }
    const { error } = await supabase.from(table).insert(payload as never);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Добавлено");
    setOpen(false); setValues({}); setFile(null);
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="bg-gold text-primary-foreground rounded-full w-14 h-14 shadow-glow hover:scale-105 transition-transform">
          <Plus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader><DialogTitle className="text-gold">{label}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {fields.map((f) => (
            <div key={f.name} className="space-y-1">
              <label className="text-sm text-muted-foreground">{f.label}</label>
              {f.type === "textarea" ? (
                <Textarea value={values[f.name] || ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} required={f.required} />
              ) : f.type === "file" ? (
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              ) : (
                <Input value={values[f.name] || ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} required={f.required} />
              )}
            </div>
          ))}
          <Button type="submit" disabled={loading} className="bg-gold text-primary-foreground w-full">
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
