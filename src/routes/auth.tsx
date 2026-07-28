import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { ID, OAuthProvider } from "appwrite";

import { account } from "@/integrations/appwrite/client";
import { useOwner } from "@/hooks/use-owner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Owner access — terry masila Portfolio" },
      {
        name: "description",
        content:
          "Private sign-in for the portfolio owner to update photos, measurements and booking details.",
      },
      {
        property: "og:title",
        content: "Owner access — terry masila Portfolio",
      },
      {
        property: "og:description",
        content: "Private sign-in for the portfolio owner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useOwner();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: "/" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await account.create(ID.unique(), email, password);
        await account.createEmailPasswordSession(email, password);
        toast.success("Account created successfully!");
        void navigate({ to: "/" });
      } else {
        await account.createEmailPasswordSession(email, password);
        toast.success("Signed in successfully!");
        void navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      account.createOAuth2Session(
        OAuthProvider.Google,
        window.location.origin,
        window.location.origin,
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-24">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-accent"
        >
          ← Back to portfolio
        </Link>
        <h1 className="mt-8 font-serif text-5xl italic leading-none">
          {mode === "signin" ? "Sign in" : "Create owner"}
        </h1>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Private access for the portfolio owner
        </p>

        <form onSubmit={submit} className="mt-10 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-input bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-input bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-foreground px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {busy ? "One moment" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void google()}
          className="mt-3 w-full border border-input bg-card px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em] transition-colors hover:bg-secondary"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-8 w-full font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent"
        >
          {mode === "signin" ? "Need an owner account?" : "Already have an account?"}
        </button>
      </div>
    </main>
  );
}
