import { useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  canEdit: boolean;
  onUpload: (file: File) => Promise<void>;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  label?: string;
  children?: React.ReactNode;
};

export function ImageSlot({
  src,
  alt,
  canEdit,
  onUpload,
  className = "",
  imgClassName = "",
  priority = false,
  label = "Replace photo",
  children,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      await onUpload(file);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`group relative overflow-hidden bg-secondary ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={`size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] ${imgClassName}`}
      />
      {children}
      {canEdit && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handle(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-card/95 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-accent shadow-sm backdrop-blur transition-opacity hover:bg-card"
          >
            {busy ? <Loader2 className="size-3 animate-spin" /> : <ImageUp className="size-3" />}
            {busy ? "Uploading" : label}
          </button>
        </>
      )}
    </div>
  );
}