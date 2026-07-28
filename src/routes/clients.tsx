import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ImageUp, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ID } from "appwrite";

import { databases, APPWRITE_DATABASE_ID, COLLECTIONS } from "@/integrations/appwrite/client";
import { useOwner } from "@/hooks/use-owner";
import { EditableText } from "@/components/portfolio/EditableText";
import {
  CONTENT_DEFAULTS,
  fetchClients,
  fetchContent,
  photoSrc,
  saveContent,
  uploadPhotoFile,
  type Client,
} from "@/lib/portfolio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Selected Clients — terry masila Portfolio" },
      {
        name: "description",
        content:
          "Fashion brands, publications and commercial clients represented in archive campaigns and editorials.",
      },
      { property: "og:title", content: "Clients — terry masila" },
      {
        property: "og:description",
        content: "Brands, houses and publications from terry masila's archive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const { isOwner } = useOwner();
  const [editMode, setEditMode] = useState(false);
  const canEdit = isOwner && editMode;
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: content = CONTENT_DEFAULTS } = useQuery({
    queryKey: ["site_content"],
    queryFn: fetchContent,
  });
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["clients"] });

  const contentMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => saveContent(key, value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["site_content"] });
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setText = (key: string) => async (value: string) => {
    await contentMutation.mutateAsync({ key, value });
  };

  const updateClient = async (client: Client, patch: Partial<Client>) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.CLIENTS, client.id, patch);
      void invalidate();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const removeClient = async (client: Client) => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.CLIENTS, client.id);
      void invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const addClient = async () => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.CLIENTS, ID.unique(), {
        name: "New client",
        sort_order: clients.length,
      });
      void invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
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

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <nav className="flex w-full items-center justify-between px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
        {isOwner && (
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent"
          >
            <span
              className={`size-1.5 rounded-full bg-accent ${editMode ? "animate-pulse" : "opacity-40"}`}
            />
            {editMode ? "Done editing" : "Edit mode"}
          </button>
        )}
      </nav>

      <header className="mx-auto max-w-7xl px-6 pb-16 pt-8">
        <h1 className="font-serif text-5xl italic md:text-7xl">
          <EditableText
            value={content.clients_title}
            onSave={setText("clients_title")}
            canEdit={canEdit}
            label="clients title"
          />
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          <EditableText
            value={content.clients_page_intro}
            onSave={setText("clients_page_intro")}
            canEdit={canEdit}
            multiline
            label="clients intro"
          />
        </p>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-32">
        {isLoading ? (
          <div className="flex justify-center py-24 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
            {clients.map((client) => {
              const visual = client.logo_url ? (
                <img
                  src={photoSrc(client.logo_url)}
                  alt={client.name}
                  loading="lazy"
                  className="max-h-12 w-auto max-w-[70%] object-contain opacity-70 transition-opacity group-hover:opacity-100"
                />
              ) : (
                <span className="px-4 text-center font-serif text-xl italic text-muted-foreground transition-colors group-hover:text-foreground md:text-2xl">
                  {client.name}
                </span>
              );

              return (
                <div
                  key={client.id}
                  className="group grid aspect-[4/3] place-items-center bg-background p-6"
                >
                  {canEdit ? (
                    <div className="flex w-full flex-col items-center gap-3">
                      {client.logo_url ? (
                        visual
                      ) : (
                        <span className="text-center font-serif text-xl italic">
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
                        {client.logo_url ? "Replace logo" : "Add logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => void uploadLogo(client, e.target.files?.[0])}
                        />
                      </label>
                      <span className="w-full text-center text-[11px] text-muted-foreground">
                        <EditableText
                          value={client.link || "https://"}
                          onSave={(v) => updateClient(client, { link: v })}
                          canEdit
                          label="client link"
                        />
                      </span>
                      <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
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
                      className="grid size-full place-items-center"
                    >
                      {visual}
                    </a>
                  ) : (
                    visual
                  )}
                </div>
              );
            })}

            {canEdit && (
              <button
                type="button"
                onClick={() => void addClient()}
                className="grid aspect-[4/3] place-items-center bg-background text-muted-foreground transition-colors hover:text-accent"
              >
                <span className="text-center">
                  <Plus className="mx-auto size-5" />
                  <span className="mt-3 block font-mono text-[9px] uppercase tracking-widest">
                    Add client
                  </span>
                </span>
              </button>
            )}
          </div>
        )}

        {!isLoading && clients.length === 0 && !canEdit && (
          <p className="py-24 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Client list coming soon
          </p>
        )}
      </main>
    </div>
  );
}
