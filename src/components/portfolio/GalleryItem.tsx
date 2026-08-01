import { Trash2, Home } from "lucide-react";

import { EditableText } from "@/components/portfolio/EditableText";
import { ImageSlot } from "@/components/portfolio/ImageSlot";
import { photoSrc, type Photo } from "@/lib/portfolio";

export function GalleryItem({
  photo,
  canEdit,
  aspect,
  indented = false,
  onReplace,
  onField,
  onDelete,
  onToggleHome,
}: {
  photo: Photo;
  canEdit: boolean;
  aspect: string;
  indented?: boolean;
  onReplace: (file: File) => Promise<void>;
  onField: (field: "caption" | "credit", value: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onToggleHome?: (val: boolean) => Promise<void>;
}) {
  return (
    <figure className={indented ? "md:ml-24" : undefined}>
      <ImageSlot
        src={photoSrc(photo.url)}
        alt={photo.caption || "Portfolio photograph"}
        canEdit={canEdit}
        onUpload={onReplace}
        className={`${aspect} w-full`}
      />
      <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-serif text-lg italic">
          <EditableText
            value={photo.caption || (canEdit ? "Add a caption" : "")}
            onSave={(v) => onField("caption", v)}
            canEdit={canEdit}
            label="caption"
          />
        </span>
        <span className="font-mono text-[9px] uppercase tracking-tight text-muted-foreground">
          <EditableText
            value={photo.credit || (canEdit ? "Add a credit" : "")}
            onSave={(v) => onField("credit", v)}
            canEdit={canEdit}
            label="credit"
          />
        </span>
        {canEdit && (
          <div className="flex items-center gap-4">
            {onToggleHome && (
              <button
                type="button"
                onClick={() => void onToggleHome(!photo.show_on_home)}
                className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest transition-colors ${
                  photo.show_on_home ? "text-accent" : "text-muted-foreground hover:text-accent"
                }`}
              >
                <Home className="size-3" />{" "}
                {photo.show_on_home ? "Remove from Home" : "Show on Home"}
              </button>
            )}
            <button
              type="button"
              onClick={() => void onDelete()}
              className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-destructive"
            >
              <Trash2 className="size-3" /> Remove
            </button>
          </div>
        )}
      </figcaption>
    </figure>
  );
}
