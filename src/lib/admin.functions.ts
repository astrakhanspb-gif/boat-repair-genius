import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const ensureAdminUser = createServerFn({ method: "POST" }).handler(async () => {
  const adminEmail = "love@lovelodka.app";

  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;

  const adminUser = usersData.users.find((user) => user.email === adminEmail);
  if (!adminUser) {
    throw new Error("Администратор не найден");
  }

  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: adminUser.id, role: "admin" }, { onConflict: "user_id,role" });

  if (roleError) throw roleError;

  return { ok: true };
});