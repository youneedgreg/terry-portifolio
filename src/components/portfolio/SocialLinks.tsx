import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ID } from "appwrite";

import { databases, APPWRITE_DATABASE_ID, COLLECTIONS } from "@/integrations/appwrite/client";
import { EditableText } from "@/components/portfolio/EditableText";
import { fetchSocialLinks, type SocialLink } from "@/lib/portfolio";

export function SocialLinks({ canEdit, title }: { canEdit: boolean; title: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { data: links = [] } = useQuery({ queryKey: ["social_links"], queryFn: fetchSocialLinks });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["social_links"] });

  const addLink = useMutation({
    mutationFn: async () => {
      await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.SOCIAL_LINKS, ID.unique(), {
        platform: "New link",
        url: "https://",
        sort_order: links.length,
      });
    },
    onSuccess: () => void invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  const update = async (link: SocialLink, patch: Partial<SocialLink>): Promise<void> => {
    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.SOCIAL_LINKS,
        link.id,
        patch,
      );
      void invalidate();
      toast.success("Saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (link: SocialLink): Promise<void> => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.SOCIAL_LINKS, link.id);
      void invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (!links.length && !canEdit) return null;

  return (
    <div className="mt-16 border-t border-border pt-12">
      <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {title}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {links.map((link) => (
          <li key={link.id} className="flex items-center gap-2">
            {canEdit ? (
              <span className="flex flex-col items-start gap-1 text-left">
                <span className="font-serif text-xl italic">
                  <EditableText
                    value={link.platform}
                    onSave={(v) => update(link, { platform: v })}
                    canEdit
                    label="platform"
                  />
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  <EditableText
                    value={link.url}
                    onSave={(v) => update(link, { url: v })}
                    canEdit
                    label="url"
                  />
                </span>
              </span>
            ) : (
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-serif text-xl italic underline decoration-accent/40 underline-offset-4 transition-opacity hover:opacity-60"
              >
                {link.platform}
              </a>
            )}
            {canEdit && (
              <button
                type="button"
                aria-label="Remove link"
                onClick={() => void remove(link)}
                className="text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </li>
        ))}
        {canEdit && (
          <li>
            <button
              type="button"
              onClick={() => addLink.mutate()}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-accent"
            >
              <Plus className="size-3" /> Add link
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
