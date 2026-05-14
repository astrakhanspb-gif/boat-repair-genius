import { useEffect, useRef, useState, type ElementType } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

type EditableTable = "services" | "reviews" | "objections";

export function AdminEditableValue({
  table,
  rowId,
  field,
  value,
  as = "span",
  className = "",
  multiline = false,
}: {
  table: EditableTable;
  rowId: string;
  field: string;
  value: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
}) {
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const Tag = as as any;

  const save = async () => {
    const newVal = ref.current?.innerText ?? "";
    setEditing(false);
    if (newVal === localValue) return;

    const { error } = await supabase.from(table).update({ [field]: newVal } as never).eq("id", rowId);
    if (error) {
      toast.error(error.message);
      if (ref.current) ref.current.innerText = localValue;
      return;
    }

    setLocalValue(newVal);
    toast.success("Сохранено");
  };

  if (!isAdmin) {
    return <Tag className={className}>{localValue}</Tag>;
  }

  return (
    <span className="relative inline-flex max-w-full items-start gap-1 group/edit align-top">
      <Tag
        ref={ref as never}
        className={`${className} ${editing ? "outline outline-2 outline-primary rounded px-1" : "cursor-text hover:outline hover:outline-1 hover:outline-primary/40 rounded px-1 -mx-1"} inline-block max-w-full`}
        contentEditable
        suppressContentEditableWarning
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onFocus={() => setEditing(true)}
        onBlur={save}
        onKeyDown={(e: React.KeyboardEvent) => {
          e.stopPropagation();
          if (!multiline && e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLElement).blur();
          }
          if (e.key === "Escape") {
            if (ref.current) ref.current.innerText = localValue;
            (e.target as HTMLElement).blur();
          }
        }}
      >
        {localValue}
      </Tag>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          ref.current?.focus();
        }}
        className="mt-0.5 opacity-60 hover:opacity-100 group-hover/edit:opacity-100 text-primary transition shrink-0"
        title="Редактировать"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}