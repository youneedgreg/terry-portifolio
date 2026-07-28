import { useEffect, useState } from "react";
import { account } from "@/integrations/appwrite/client";
import type { Models } from "appwrite";

export function useOwner() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkUser() {
      try {
        const current = await account.get();
        if (!active) return;
        setUser(current);
        setIsOwner(Boolean(current));
      } catch {
        if (!active) return;
        setUser(null);
        setIsOwner(false);
      } finally {
        if (active) setLoading(false);
      }
    }

    void checkUser();

    return () => {
      active = false;
    };
  }, []);

  return { user, isOwner, loading };
}
