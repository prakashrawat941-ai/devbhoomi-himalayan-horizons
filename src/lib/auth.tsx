import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "customer" | "partner" | "driver";

interface AuthState {
  user: User | null;
  roles: Role[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthState>({ user: null, roles: [], loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRoles(u: User | null) {
    if (!u) return setRoles([]);
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
    setRoles((data ?? []).map((r) => r.role as Role));
  }

  async function refresh() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    await loadRoles(data.user);
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      const u = session?.user ?? null;
      setUser(u);
      setTimeout(() => loadRoles(u).finally(() => setLoading(false)), 0);
    });
    refresh().finally(() => setLoading(false));
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthCtx.Provider value={{ user, roles, loading, refresh }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
