import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FloatingMaster } from "@/components/FloatingMaster";
import { AdminAddDialog } from "@/components/AdminAddDialog";
import { LogoLogin } from "@/components/LogoLogin";
import { EditableText } from "@/components/EditableText";
import { AdminEditableValue } from "@/components/AdminEditableValue";
import { Wrench, MessageSquareQuote, Star, ChevronDown, Trash2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ремонт лодок — мастерская у воды" },
      { name: "description", content: "Профессиональный ремонт лодок и катеров. Корпус, двигатель, покраска. Оставьте заявку — мастер перезвонит." },
    ],
  }),
  component: Index,
});

interface Service { id: string; title: string; description: string; price: string; image_url: string | null }
interface Review { id: string; author_name: string; text: string; proof_image_url: string | null }
interface Objection { id: string; question: string; answer: string }

function Index() {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [objections, setObjections] = useState<Objection[]>([]);

  const loadAll = () => {
    supabase.from("services").select("*").order("sort_order").order("created_at").then(({ data }) => setServices(data || []));
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).then(({ data }) => setReviews(data || []));
    supabase.from("objections").select("*").order("created_at").then(({ data }) => setObjections(data || []));
  };

  useEffect(() => { loadAll(); }, []);

  const remove = async (table: "services" | "reviews" | "objections", id: string) => {
    await supabase.from(table).delete().eq("id", id);
    loadAll();
  };

  return (
    <>
      <LogoLogin />
      <div className="snap-page">
        {/* SECTION 1 — SERVICES */}
        <section className="snap-section relative px-4 py-20 pt-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Wrench className="w-8 h-8 text-primary mx-auto mb-3" />
              <EditableText as="h1" textKey="services_title" defaultValue="Услуги" className="text-4xl sm:text-5xl font-display text-gold" />
              <EditableText as="p" textKey="services_subtitle" defaultValue="Прозрачные цены и реальные сроки" className="text-muted-foreground mt-2 block" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <article key={s.id} className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all shadow-deep">
                  {s.image_url && <img src={s.image_url} alt={s.title} className="w-full h-44 object-cover" loading="lazy" />}
                  <div className="p-5 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <AdminEditableValue table="services" rowId={s.id} field="title" value={s.title} as="h3" className="text-lg font-semibold" />
                      <AdminEditableValue table="services" rowId={s.id} field="price" value={s.price} className="text-gold font-bold whitespace-nowrap" />
                    </div>
                    <AdminEditableValue table="services" rowId={s.id} field="description" value={s.description} as="p" className="text-sm text-muted-foreground" multiline />
                  </div>
                  {isAdmin && (
                    <button onClick={() => remove("services", s.id)} className="absolute top-2 right-2 p-1.5 rounded-md bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </article>
              ))}
              {services.length === 0 && (
                <p className="text-center text-muted-foreground col-span-full py-12">Пока нет услуг{isAdmin && " — добавьте первую через +"}.</p>
              )}
            </div>
            {isAdmin && (
              <div className="mt-8 flex justify-center">
                <AdminAddDialog
                  label="Новая услуга"
                  table="services"
                  fields={[
                    { name: "title", label: "Название", required: true },
                    { name: "price", label: "Цена (например, от 5 000 ₽)", required: true },
                    { name: "description", label: "Описание", type: "textarea", required: true },
                    { name: "image_url", label: "Фото", type: "file" },
                  ]}
                  onDone={loadAll}
                />
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2 — REVIEWS */}
        <section className="snap-section relative px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Star className="w-8 h-8 text-primary mx-auto mb-3" />
              <EditableText as="h2" textKey="reviews_title" defaultValue="Отзывы" className="text-4xl sm:text-5xl font-display text-gold" />
              <EditableText as="p" textKey="reviews_subtitle" defaultValue="Реальные клиенты, реальные пруфы" className="text-muted-foreground mt-2 block" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((r) => (
                <article key={r.id} className="group relative rounded-2xl bg-card border border-border p-5 shadow-deep hover:border-primary/50 transition">
                  {r.proof_image_url && <img src={r.proof_image_url} alt={`Пруф от ${r.author_name}`} className="w-full h-48 object-cover rounded-lg mb-3" loading="lazy" />}
                  <AdminEditableValue table="reviews" rowId={r.id} field="text" value={r.text} as="p" className="text-sm text-foreground/90 mb-3 italic" multiline />
                  <AdminEditableValue table="reviews" rowId={r.id} field="author_name" value={r.author_name} as="p" className="text-xs text-primary font-semibold" />
                  {isAdmin && (
                    <button onClick={() => remove("reviews", r.id)} className="absolute top-2 right-2 p-1.5 rounded-md bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </article>
              ))}
              {reviews.length === 0 && (
                <p className="text-center text-muted-foreground col-span-full py-12">Отзывы появятся здесь.</p>
              )}
            </div>
            {isAdmin && (
              <div className="mt-8 flex justify-center">
                <AdminAddDialog
                  label="Новый отзыв"
                  table="reviews"
                  fields={[
                    { name: "author_name", label: "Имя клиента", required: true },
                    { name: "text", label: "Текст отзыва", type: "textarea", required: true },
                    { name: "proof_image_url", label: "Фото-пруф", type: "file" },
                  ]}
                  onDone={loadAll}
                />
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3 — OBJECTIONS */}
        <section className="snap-section relative px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <MessageSquareQuote className="w-8 h-8 text-primary mx-auto mb-3" />
              <EditableText as="h2" textKey="objections_title" defaultValue="Возражения" className="text-4xl sm:text-5xl font-display text-gold" />
              <EditableText as="p" textKey="objections_subtitle" defaultValue="Ответы на частые сомнения" className="text-muted-foreground mt-2 block" />
            </div>
            <div className="space-y-3">
              {objections.map((o) => (
                <details key={o.id} className="group rounded-2xl bg-card border border-border p-5 shadow-deep open:border-primary/50 transition">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <AdminEditableValue table="objections" rowId={o.id} field="question" value={o.question} as="span" className="font-semibold pr-4" />
                    <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                  </summary>
                  <AdminEditableValue table="objections" rowId={o.id} field="answer" value={o.answer} as="p" className="mt-3 text-muted-foreground leading-relaxed" multiline />
                  {isAdmin && (
                    <button onClick={() => remove("objections", o.id)} className="mt-3 text-xs text-destructive hover:underline inline-flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Удалить
                    </button>
                  )}
                </details>
              ))}
              {objections.length === 0 && (
                <p className="text-center text-muted-foreground py-12">Здесь будут ответы на возражения.</p>
              )}
            </div>
            {isAdmin && (
              <div className="mt-8 flex justify-center">
                <AdminAddDialog
                  label="Новое возражение"
                  table="objections"
                  fields={[
                    { name: "question", label: "Возражение / вопрос", required: true },
                    { name: "answer", label: "Ответ", type: "textarea", required: true },
                  ]}
                  onDone={loadAll}
                />
              </div>
            )}
            <div className="mt-16 text-center">
              <p className="text-xs text-muted-foreground/60">© Мастерская ремонта лодок</p>
            </div>
          </div>
        </section>
      </div>
      <FloatingMaster />
    </>
  );
}
