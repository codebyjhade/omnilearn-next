"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      router.push("/");
      return;
    }

    let active = true;

    async function checkUser() {
      const { data: { user: currentUser } } = await supabase!.auth.getUser();
      if (!active) return;

      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    }

    checkUser();

    return () => {
      active = false;
    };
  }, [router]);

  return { user, loading };
}
