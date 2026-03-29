"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  petId: number;
  field: string;
  value: string | number | null | undefined;
  editable: boolean;
  type?: "text" | "number";
  format?: (v: string | number | null | undefined) => string;
  className?: string;
  onSaved?: () => void;
}

export function InlineEdit({
  petId,
  field,
  value,
  editable,
  type = "text",
  format,
  className,
  onSaved,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const updateMutation = trpc.pets.update.useMutation({
    onSuccess: () => {
      toast.success("Salvo com sucesso");
      utils.pets.byId.invalidate({ id: petId });
      onSaved?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar");
    },
    onSettled: () => {
      setIsEditing(false);
    },
  });

  const displayValue = format
    ? format(value)
    : value != null
      ? String(value)
      : "—";

  const startEditing = useCallback(() => {
    if (!editable) return;
    setDraft(value != null ? String(value) : "");
    setIsEditing(true);
  }, [editable, value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const save = useCallback(() => {
    const trimmed = draft.trim();

    // Se nao mudou, cancela
    const currentStr = value != null ? String(value) : "";
    if (trimmed === currentStr) {
      setIsEditing(false);
      return;
    }

    const parsed = type === "number" ? Number(trimmed) : trimmed;

    if (type === "number" && (isNaN(parsed as number) || trimmed === "")) {
      toast.error("Valor numerico invalido");
      setIsEditing(false);
      return;
    }

    updateMutation.mutate({
      id: petId,
      [field]: parsed,
    });
  }, [draft, value, type, petId, field, updateMutation]);

  const cancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    },
    [save, cancel]
  );

  if (updateMutation.isPending) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground", className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-sm">Salvando...</span>
      </span>
    );
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-auto px-1.5 py-0.5 text-inherit font-inherit border-primary",
          className
        )}
      />
    );
  }

  return (
    <span
      onClick={startEditing}
      className={cn(
        editable &&
          "cursor-pointer border-b border-dashed border-transparent hover:border-muted-foreground/50 transition-colors",
        className
      )}
      title={editable ? "Clique para editar" : undefined}
    >
      {displayValue}
    </span>
  );
}
