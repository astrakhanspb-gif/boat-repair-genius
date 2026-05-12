import { LeadForm } from "./LeadForm";
import { Anchor } from "lucide-react";

export function FloatingMaster() {
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-auto">
      <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-primary/30 shadow-deep p-4">
        <div className="flex items-center gap-2 mb-3">
          <Anchor className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-gold">Задай вопрос мастеру</p>
        </div>
        <LeadForm source="floating-master" variant="compact" />
      </div>
    </div>
  );
}
