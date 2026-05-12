import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

export function AdminBar() {
  const { isAdmin, user } = useAuth();
  return (
    <div className="fixed top-4 right-4 z-50">
      {user && isAdmin ? (
        <div className="flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border border-primary/40 px-3 py-1.5">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs text-foreground/80">Admin</span>
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => supabase.auth.signOut()}>
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        <Link to="/admin" className="text-xs text-muted-foreground/70 hover:text-primary transition-colors">
          ·
        </Link>
      )}
    </div>
  );
}
