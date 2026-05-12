import { useEffect, useRef, useState, type ElementType } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const cache = new Map<string, string>();
const listeners = new Set<() => void>();

async function loadAll() {
  const { data } = await supabase.from("site_texts").select("key,value");
  cache.clear();
  (data || []).forEach((r: { key: string; value: string }) => cache.set(r.key, r.value));
  listeners.forEach((l) => l());
}
loadAll();

export function EditableText({
  textKey,
  defaultValue,
  as = "span",
  className = "",
  multiline = false,
}: {
  textKey: string;
  defaultValue: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
}) {
  const { isAdmin } = useAuth();
  const [, force] = useState(0);
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  const value = cache.get(textKey) ?? defaultValue;
  const Tag = as as any;

  const save = async () => {
    const newVal = (ref.current?.innerText || "").trim();
    setEditing(false);
    if (!newVal || newVal === value) return;
    const { error } = await supabase.from("site_texts").upsert({ key: textKey, value: newVal });
    if (error) { toast.error(error.message); return; }
    cache.set(textKey, newVal);
    listeners.forEach((l) => l());
    toast.success("Сохранено");
  };

  if (!isAdmin) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={ref as never}
      className={`${className} ${editing ? "outline outline-2 outline-primary rounded px-1" : "cursor-text hover:outline hover:outline-1 hover:outline-primary/40 rounded"} relative inline-block`}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setEditing(true)}
      onBlur={save}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (!multiline && e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); }
        if (e.key === "Escape") { (e.target as HTMLElement).blur(); }
      }}
      title="Кликните, чтобы изменить"
    >
      {value}
    </Tag>
  );
}
