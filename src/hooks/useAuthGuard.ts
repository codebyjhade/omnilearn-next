"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuthGuard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function checkUser() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!active) return;

        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Auth guard error:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkUser();

    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
