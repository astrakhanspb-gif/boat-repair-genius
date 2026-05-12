import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LeadForm } from "@/components/LeadForm";
import { FloatingMaster } from "@/components/FloatingMaster";
import { AdminAddDialog } from "@/components/AdminAddDialog";
import { AdminBar } from "@/components/AdminBar";
import { Anchor, Wrench, MessageSquareQuote, Star, ChevronDown, Trash2 } from "lucide-react";
import heroImg from "@/assets/hero-boat.jpg";
import { Button } from "@/components/ui/button";

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
      <AdminBar />
      <div className="snap-page">
        {/* SECTION 1 — HERO */}
        <section className="snap-section relative flex items-center justify-center px-4 pb-32 overflow-hidden">
          <img src={heroImg} alt="Мастерская по ремонту лодок" className="absolute inset-0 w-full h-full object-cover opacity-40" width={1920} height={1280} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          <div className="relative z-10 max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-card/40 backdrop-blur">
              <Anchor className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-primary">Мастерская у воды</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-display leading-[0.95]">
              Ремонт лодок,<br /><span className="text-gold">которым доверяют</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Корпус, мотор, покраска и тюнинг. Оставьте имя и номер — мастер перезвонит за 15 минут.
            </p>
            <div className="max-w-md mx-auto rounded-2xl bg-card/70 backdrop-blur-xl border border-primary/30 p-5 shadow-glow">
              <LeadForm source="hero" />
            </div>
            <div className="pt-8 flex justify-center text-muted-foreground/60 animate-bounce">
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* SECTION 2 — SERVICES */}
        <section className="snap-section relative px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Wrench className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-4xl sm:text-5xl font-display text-gold">Услуги</h2>
              <p className="text-muted-foreground mt-2">Прозрачные цены и реальные сроки</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <article key={s.id} className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all shadow-deep">
                  {s.image_url && <img src={s.image_url} alt={s.title} className="w-full h-44 object-cover" loading="lazy" />}
                  <div className="p-5 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      <span className="text-gold font-bold whitespace-nowrap">{s.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
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

        {/* SECTION 3 — REVIEWS */}
        <section className="snap-section relative px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Star className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-4xl sm:text-5xl font-display text-gold">Отзывы</h2>
              <p className="text-muted-foreground mt-2">Реальные клиенты, реальные пруфы</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((r) => (
                <article key={r.id} className="group relative rounded-2xl bg-card border border-border p-5 shadow-deep hover:border-primary/50 transition">
                  {r.proof_image_url && <img src={r.proof_image_url} alt={`Пруф от ${r.author_name}`} className="w-full h-48 object-cover rounded-lg mb-3" loading="lazy" />}
                  <p className="text-sm text-foreground/90 mb-3 italic">«{r.text}»</p>
                  <p className="text-xs text-primary font-semibold">— {r.author_name}</p>
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

        {/* SECTION 4 — OBJECTIONS */}
        <section className="snap-section relative px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <MessageSquareQuote className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-4xl sm:text-5xl font-display text-gold">Возражения</h2>
              <p className="text-muted-foreground mt-2">Ответы на частые сомнения</p>
            </div>
            <div className="space-y-3">
              {objections.map((o) => (
                <details key={o.id} className="group rounded-2xl bg-card border border-border p-5 shadow-deep open:border-primary/50 transition">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-semibold pr-4">{o.question}</span>
                    <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{o.answer}</p>
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
