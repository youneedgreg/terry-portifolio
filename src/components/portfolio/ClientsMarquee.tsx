import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ImageUp, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ID } from "appwrite";

import { databases, APPWRITE_DATABASE_ID, COLLECTIONS } from "@/integrations/appwrite/client";
import { EditableText } from "@/components/portfolio/EditableText";
import { fetchClients, photoSrc, uploadPhotoFile, type Client } from "@/lib/portfolio";

export function ClientsMarquee({ canEdit, title }: { canEdit: boolean; title: React.ReactNode }) {
  const queryClient = useQueryClient();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: fetchClients });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["clients"] });

  const addClient = useMutation({
    mutationFn: async () => {
      await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.CLIENTS, ID.unique(), {
        name: "New client",
        sort_order: clients.length,
      });
    },
    onSuccess: () => void invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  const updateClient = async (client: Client, patch: Partial<Client>): Promise<void> => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.CLIENTS, client.id, patch);
      void invalidate();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const removeClient = async (client: Client): Promise<void> => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.CLIENTS, client.id);
      void invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const scrollBy = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const uploadLogo = async (client: Client, file?: File | null) => {
    if (!file) return;
    setUploading(client.id);
    try {
      const path = await uploadPhotoFile(file);
      await updateClient(client, { logo_url: path });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(null);
    }
  };

  const loop = clients.length > 3 ? [...clients, ...clients] : clients;

  return (
    <section id="clients" className="border-y border-border py-20 md:py-24">
      <div className="mx-auto mb-12 flex max-w-7xl items-end justify-between gap-6 px-6">
        <h2 className="font-serif text-3xl italic md:text-4xl">{title}</h2>
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => addClient.mutate()}
              className="mr-2 inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-accent"
            >
              <Plus className="size-3" /> Add client
            </button>
          )}
          <button
            type="button"
            aria-label="Scroll clients left"
            onClick={() => scrollBy(-1)}
            className="rounded-full border border-border p-2 transition-colors hover:bg-secondary"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll clients right"
            onClick={() => scrollBy(1)}
            className="rounded-full border border-border p-2 transition-colors hover:bg-secondary"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex gap-14 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="flex min-w-full shrink-0 items-center gap-14"
          style={
            !canEdit && loop.length > 6
              ? {
                  animation: "marquee 38s linear infinite",
                  animationPlayState: paused ? "paused" : "running",
                }
              : undefined
          }
        >
          {(canEdit ? clients : loop).map((client, i) => {
            const visual = client.logo_url ? (
              <img
                src={photoSrc(client.logo_url)}
                alt={client.name}
                loading="lazy"
                className="h-8 w-auto opacity-60 transition-opacity hover:opacity-100"
              />
            ) : (
              <span className="whitespace-nowrap font-serif text-2xl italic text-muted-foreground transition-colors hover:text-foreground md:text-3xl">
                {client.name}
              </span>
            );

            return (
              <div key={`${client.id}-${i}`} className="flex shrink-0 items-center gap-3">
                {canEdit ? (
                  <div className="flex shrink-0 flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {client.logo_url ? (
                        visual
                      ) : (
                        <span className="whitespace-nowrap font-serif text-2xl italic text-muted-foreground md:text-3xl">
                          <EditableText
                            value={client.name}
                            onSave={(v) => updateClient(client, { name: v })}
                            canEdit
                            label="client name"
                          />
                        </span>
                      )}
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        {uploading === client.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <ImageUp className="size-3" />
                        )}
                        {client.logo_url ? "Logo" : "Add logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => void uploadLogo(client, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      <span className="w-full max-w-[240px] normal-case">
                        <EditableText
                          value={client.link || "https://"}
                          onSave={(v) => updateClient(client, { link: v })}
                          canEdit
                          label="client link"
                        />
                      </span>
                      {client.logo_url && (
                        <button
                          type="button"
                          onClick={() => void updateClient(client, { logo_url: "" })}
                          className="underline"
                        >
                          Clear logo
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Remove client"
                        onClick={() => void removeClient(client)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ) : client.link ? (
                  <a
                    href={client.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={client.name}
                  >
                    {visual}
                  </a>
                ) : (
                  visual
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl justify-center px-6">
        <Link
          to="/clients"
          className="border-b border-foreground/30 pb-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:border-accent hover:text-accent"
        >
          View all clients
        </Link>
      </div>
    </section>
  );
}
