import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

type Props = {
  value: string;
  onSave: (next: string) => Promise<void> | void;
  canEdit: boolean;
  multiline?: boolean;
  className?: string;
  label?: string;
  as?: "span" | "p" | "div";
};

export function EditableText({
  value,
  onSave,
  canEdit,
  multiline = false,
  className = "",
  label = "text",
  as = "span",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const Tag = as;

  if (!canEdit) return <Tag className={className}>{value}</Tag>;

  if (editing) {
    const commit = async () => {
      setSaving(true);
      try {
        await onSave(draft);
        setEditing(false);
      } finally {
        setSaving(false);
      }
    };

    return (
      <span className="inline-flex w-full max-w-full items-start gap-2 align-top">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
            className={`w-full min-w-0 resize-y border border-accent/50 bg-card px-2 py-1 outline-none ${className}`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void commit();
              if (e.key === "Escape") setEditing(false);
            }}
            className={`w-full min-w-0 border border-accent/50 bg-card px-2 py-1 outline-none ${className}`}
          />
        )}
        <button
          type="button"
          aria-label={`Save ${label}`}
          disabled={saving}
          onClick={() => void commit()}
          className="mt-1 shrink-0 rounded-full bg-accent p-1.5 text-accent-foreground transition-opacity hover:opacity-80"
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Cancel"
          onClick={() => {
            setDraft(value);
            setEditing(false);
          }}
          className="mt-1 shrink-0 rounded-full border border-border p-1.5 transition-colors hover:bg-secondary"
        >
          <X className="size-3.5" />
        </button>
      </span>
    );
  }

  return (
    <Tag className={`group/edit relative inline cursor-text ${className}`}>
      {value}
      <button
        type="button"
        aria-label={`Edit ${label}`}
        onClick={() => setEditing(true)}
        className="ml-2 inline-flex translate-y-[-2px] items-center rounded-full border border-current/20 p-1 align-middle opacity-40 transition-opacity hover:opacity-100"
      >
        <Pencil className="size-3" />
      </button>
    </Tag>
  );
}