import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { ID } from "appwrite";
import { databases, APPWRITE_DATABASE_ID, COLLECTIONS } from "@/integrations/appwrite/client";
import { useOwner } from "@/hooks/use-owner";
import { usePhotoAdmin } from "@/hooks/use-photo-admin";
import { EditableText } from "@/components/portfolio/EditableText";
import { ImageSlot } from "@/components/portfolio/ImageSlot";
import { GalleryItem } from "@/components/portfolio/GalleryItem";
import { ClientsMarquee } from "@/components/portfolio/ClientsMarquee";
import { SocialLinks } from "@/components/portfolio/SocialLinks";
import {
  CONTENT_DEFAULTS,
  fetchContent,
  fetchPhotos,
  photoSrc,
  saveContent,
  uploadPhotoFile,
  type Photo,
} from "@/lib/portfolio";
import heroFallback from "@/assets/hero.jpg";
import editorial1 from "@/assets/editorial-1.jpg";
import editorial2 from "@/assets/editorial-2.jpg";
import editorial3 from "@/assets/editorial-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "terry masila — Model Portfolio" },
      {
        name: "description",
        content:
          "Editorial portfolio of fashion model terry masila: campaigns, beauty work, digitals and booking details.",
      },
      { property: "og:title", content: "terry masila — Model Portfolio" },
      {
        property: "og:description",
        content:
          "Editorial portfolio, digitals and booking details for fashion model terry masila.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FALLBACK_GALLERY = [editorial1, editorial2, editorial3];

function Index() {
  const { isOwner, user } = useOwner();
  const [editMode, setEditMode] = useState(false);
  const queryClient = useQueryClient();
  const addInputRef = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);

  const canEdit = isOwner && editMode;

  const contentQuery = useQuery({
    queryKey: ["site_content"],
    queryFn: fetchContent,
  });
  const photosQuery = useQuery({ queryKey: ["photos"], queryFn: fetchPhotos });

  const content = contentQuery.data ?? CONTENT_DEFAULTS;
  const photos = photosQuery.data ?? [];
  const gallery = photos.filter((p) => p.section === "editorial" && p.show_on_home);

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

  const replaceContentImage = (key: string) => async (file: File) => {
    try {
      const path = await uploadPhotoFile(file);
      await contentMutation.mutateAsync({ key, value: path });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const { replacePhotoImage, updatePhotoField, deletePhoto, addPhotos, togglePhotoHome } =
    usePhotoAdmin();

  const handleAdd = async (files: FileList | null) => {
    setAdding(true);
    try {
      await addPhotos(files, gallery.length);
    } finally {
      setAdding(false);
    }
  };

  const heroImage = photoSrc(content.hero_url, heroFallback);
  const digitalsImage = photoSrc(content.digitals_url, editorial2);

  const measurements: Array<[string, string]> = [
    ["Height", "measurements_height"],
    ["Bust", "measurements_bust"],
    ["Waist", "measurements_waist"],
    ["Hips", "measurements_hips"],
    ["Hair", "measurements_hair"],
    ["Eyes", "measurements_eyes"],
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent selection:text-accent-foreground">
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-8 mix-blend-difference">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
          {content.nav_label}
        </span>
        <div className="flex items-center gap-6 text-[11px] font-medium uppercase tracking-widest text-secondary sm:gap-8">
          <a href="#editorial" className="transition-opacity hover:opacity-60">
            Works
          </a>
          <Link to="/gallery" className="transition-opacity hover:opacity-60">
            Gallery
          </Link>
          <a href="#about" className="hidden transition-opacity hover:opacity-60 sm:inline">
            About
          </a>
          <a href="#digitals" className="hidden transition-opacity hover:opacity-60 sm:inline">
            Digitals
          </a>
          <a href="#contact" className="hidden transition-opacity hover:opacity-60 sm:inline">
            Contact
          </a>
          {isOwner ? (
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className="flex items-center gap-2 text-accent"
            >
              <span
                className={`size-1.5 rounded-full bg-accent ${editMode ? "animate-pulse" : "opacity-40"}`}
              />
              {editMode ? "Done editing" : "Edit mode"}
            </button>
          ) : (
            <Link to="/auth" className="text-secondary transition-opacity hover:opacity-60">
              {user ? "Account" : "Owner"}
            </Link>
          )}
        </div>
      </nav>

      {canEdit && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-background shadow-lg">
          Editing — click any pencil or upload button
        </div>
      )}

      <header className="relative h-screen w-full overflow-hidden">
        <ImageSlot
          src={heroImage}
          alt="Hero portrait"
          canEdit={canEdit}
          onUpload={replaceContentImage("hero_url")}
          priority
          label="Replace hero"
          buttonClassName="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          className="absolute inset-0 h-full w-full animate-[scale-in_1.4s_cubic-bezier(0.16,1,0.3,1)_both]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-foreground/20" />
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-6 pb-16 md:p-12 md:pb-20">
          <h1 className="pointer-events-auto animate-[fade-up_0.9s_cubic-bezier(0.16,1,0.3,1)_both] font-serif text-[16vw] italic leading-[0.85] tracking-tighter text-background md:text-[12vw]">
            <EditableText
              as="span"
              value={content.first_name}
              onSave={setText("first_name")}
              canEdit={canEdit}
              label="first name"
            />
            <br />
            <EditableText
              as="span"
              value={content.last_name}
              onSave={setText("last_name")}
              canEdit={canEdit}
              label="last name"
            />
          </h1>
        </div>
      </header>

      <section id="about" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="grid grid-cols-12 gap-8 border-b border-border pb-24">
          <h2 className="col-span-12 font-serif text-3xl italic md:col-span-4 md:text-4xl">
            <EditableText
              value={content.about_title}
              onSave={setText("about_title")}
              canEdit={canEdit}
              label="about title"
            />
          </h2>
          <div className="col-span-12 md:col-span-8">
            <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              <EditableText
                value={content.about_body}
                onSave={setText("about_body")}
                canEdit={canEdit}
                multiline
                label="about text"
              />
            </p>
          </div>
        </div>
      </section>

      <section id="editorial" className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
        <div className="mb-16 flex items-end justify-between gap-6">
          <h2 className="font-serif text-4xl italic md:text-5xl">
            <EditableText
              value={content.editorial_title}
              onSave={setText("editorial_title")}
              canEdit={canEdit}
              label="section title"
            />
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {gallery.length || FALLBACK_GALLERY.length} works
          </span>
        </div>

        {photosQuery.isLoading ? (
          <div className="flex justify-center py-24 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : gallery.length === 0 && !canEdit ? (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 space-y-24 md:col-span-7">
              <img
                src={editorial1}
                alt="Editorial work"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
              <img
                src={editorial2}
                alt="Beauty work"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover md:ml-24 md:w-[calc(100%-6rem)]"
              />
            </div>
            <div className="col-span-12 md:col-span-5 md:pt-48">
              <img
                src={editorial3}
                alt="Full body work"
                loading="lazy"
                className="aspect-[2/3] w-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 space-y-24 md:col-span-7">
              {gallery
                .filter((_, i) => i % 2 === 0)
                .map((photo, i) => (
                  <GalleryItem
                    key={photo.id}
                    photo={photo}
                    canEdit={canEdit}
                    aspect="aspect-[4/5]"
                    indented={i % 2 === 1}
                    onReplace={(file) => replacePhotoImage(photo, file)}
                    onField={(field, value) => updatePhotoField(photo, field, value)}
                    onDelete={() => deletePhoto(photo)}
                    onToggleHome={(val) => togglePhotoHome(photo, val)}
                  />
                ))}
            </div>
            <div className="col-span-12 space-y-24 md:col-span-5 md:pt-48">
              {gallery
                .filter((_, i) => i % 2 === 1)
                .map((photo) => (
                  <GalleryItem
                    key={photo.id}
                    photo={photo}
                    canEdit={canEdit}
                    aspect="aspect-[2/3]"
                    onReplace={(file) => replacePhotoImage(photo, file)}
                    onField={(field, value) => updatePhotoField(photo, field, value)}
                    onDelete={() => deletePhoto(photo)}
                    onToggleHome={(val) => togglePhotoHome(photo, val)}
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
                        {adding ? "Uploading" : "Add to gallery"}
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-24 flex justify-center">
          <Link
            to="/gallery"
            className="group inline-flex items-center gap-3 border-b border-foreground/30 pb-2 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors hover:border-accent hover:text-accent"
          >
            View full gallery
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <ClientsMarquee
        canEdit={canEdit}
        title={
          <EditableText
            value={content.clients_title}
            onSave={setText("clients_title")}
            canEdit={canEdit}
            label="clients title"
          />
        }
      />

      <section id="digitals" className="bg-foreground px-6 py-24 text-background md:py-32">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-16 md:flex-row md:gap-20">
          <div className="w-full space-y-8 md:w-1/3">
            <h3 className="font-serif text-3xl italic md:text-4xl">Measurements</h3>
            <div className="space-y-4 border-t border-background/20 pt-8">
              {measurements.map(([label, key]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 border-b border-background/10 pb-2"
                >
                  <span className="shrink-0 font-mono text-[10px] uppercase text-background/60">
                    {label}
                  </span>
                  <span className="min-w-0 text-right text-lg">
                    <EditableText
                      value={content[key] ?? ""}
                      onSave={setText(key)}
                      canEdit={canEdit}
                      label={label}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full flex-1">
            <ImageSlot
              src={digitalsImage}
              alt="Digitals"
              canEdit={canEdit}
              onUpload={replaceContentImage("digitals_url")}
              label="Replace digital"
              className="aspect-[4/5] w-full"
            />
          </div>
        </div>
      </section>

      <footer id="contact" className="border-t border-border px-6 py-24 text-center">
        <p className="mb-8 font-serif text-3xl italic">Representation</p>
        <div className="flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="max-w-full">
            <EditableText
              value={content.agency_name}
              onSave={setText("agency_name")}
              canEdit={canEdit}
              label="agency"
            />
          </span>
          <span className="max-w-full">
            <EditableText
              value={content.agency_cities}
              onSave={setText("agency_cities")}
              canEdit={canEdit}
              label="cities"
            />
          </span>
          <span className="mt-4 text-foreground underline decoration-accent/40 underline-offset-4">
            <EditableText
              value={content.contact_email}
              onSave={setText("contact_email")}
              canEdit={canEdit}
              label="contact email"
            />
          </span>
        </div>
        <div className="mx-auto max-w-3xl">
          <SocialLinks canEdit={canEdit} title={content.social_title} />
        </div>
        <div className="mt-24 flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-tight opacity-40">
          <span>
            © {new Date().getFullYear()} {content.first_name} {content.last_name}
          </span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </div>
  );
}
