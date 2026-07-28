import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { useOwner } from "@/hooks/use-owner";
import { usePhotoAdmin } from "@/hooks/use-photo-admin";
import { EditableText } from "@/components/portfolio/EditableText";
import { GalleryItem } from "@/components/portfolio/GalleryItem";
import { SocialLinks } from "@/components/portfolio/SocialLinks";
import {
  CONTENT_DEFAULTS,
  fetchContent,
  fetchPhotos,
  saveContent,
} from "@/lib/portfolio";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — terry masila" },
      {
        name: "description",
        content:
          "Full gallery archive of editorial, campaign and runway photographs by fashion model terry masila.",
      },
      { property: "og:title", content: "Gallery — terry masila" },
      {
        property: "og:description",
        content:
          "Browse the complete photographic archive of model terry masila.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { isOwner } = useOwner();
  const [editMode, setEditMode] = useState(false);
  const canEdit = isOwner && editMode;
  const queryClient = useQueryClient();
  const addInputRef = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);

  const contentQuery = useQuery({
    queryKey: ["site_content"],
    queryFn: fetchContent,
  });
  const photosQuery = useQuery({ queryKey: ["photos"], queryFn: fetchPhotos });
  const content = contentQuery.data ?? CONTENT_DEFAULTS;
  const gallery = (photosQuery.data ?? []).filter(
    (p) => p.section === "editorial",
  );

  const { replacePhotoImage, updatePhotoField, deletePhoto, addPhotos } =
    usePhotoAdmin();

  const contentMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      saveContent(key, value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["site_content"] });
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setText = (key: string) => async (value: string) => {
    await contentMutation.mutateAsync({ key, value });
  };

  const handleAdd = async (files: FileList | null) => {
    setAdding(true);
    try {
      await addPhotos(files, gallery.length);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <nav className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-border bg-background/85 px-6 py-5 backdrop-blur">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-opacity hover:opacity-60"
        >
          <ArrowLeft className="size-3" /> {content.first_name}{" "}
          {content.last_name}
        </Link>
        {isOwner && (
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-accent"
          >
            <span
              className={`size-1.5 rounded-full bg-accent ${editMode ? "animate-pulse" : "opacity-40"}`}
            />
            {editMode ? "Done editing" : "Edit mode"}
          </button>
        )}
      </nav>

      <header className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pt-28">
        <h1 className="font-serif text-6xl italic leading-[0.9] tracking-tighter md:text-8xl">
          <EditableText
            value={content.gallery_title}
            onSave={setText("gallery_title")}
            canEdit={canEdit}
            label="gallery title"
          />
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          <EditableText
            value={content.gallery_intro}
            onSave={setText("gallery_intro")}
            canEdit={canEdit}
            label="gallery intro"
          />
        </p>
        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {gallery.length} photographs
        </p>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-28">
        {photosQuery.isLoading ? (
          <div className="flex justify-center py-24 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((photo, i) => (
              <GalleryItem
                key={photo.id}
                photo={photo}
                canEdit={canEdit}
                aspect={i % 5 === 0 ? "aspect-[2/3]" : "aspect-[4/5]"}
                onReplace={(file) => replacePhotoImage(photo, file)}
                onField={(field, value) =>
                  updatePhotoField(photo, field, value)
                }
                onDelete={() => deletePhoto(photo)}
              />
            ))}

            {canEdit && (
              <div>
                <input
                  ref={addInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void handleAdd(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => addInputRef.current?.click()}
                  disabled={adding}
                  className="grid aspect-[4/5] w-full place-items-center border border-dashed border-foreground/25 transition-colors hover:border-accent/50"
                >
                  <span className="text-center">
                    {adding ? (
                      <Loader2 className="mx-auto size-5 animate-spin text-accent" />
                    ) : (
                      <Plus className="mx-auto size-5 text-muted-foreground" />
                    )}
                    <span className="mt-3 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {adding ? "Uploading" : "Add photographs"}
                    </span>
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {gallery.length === 0 && !canEdit && !photosQuery.isLoading && (
          <p className="py-24 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            New work coming soon
          </p>
        )}

        <div className="text-center">
          <SocialLinks canEdit={canEdit} title={content.social_title} />
        </div>
      </main>
    </div>
  );
}
