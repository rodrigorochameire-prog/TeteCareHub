"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  petId: number;
  field: string;
  value: string | number | boolean | null | undefined;
  editable: boolean;
  type?: "text" | "number" | "select" | "boolean";
  options?: Array<{ value: string; label: string }>;
  format?: (v: string | number | boolean | null | undefined) => string;
  className?: string;
  onSaved?: () => void;
}

export function InlineEdit({
  petId,
  field,
  value,
  editable,
  type = "text",
  options,
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

  // Unified save for all types
  const saveValue = useCallback(
    (newValue: string | number | boolean) => {
      const currentStr = value != null ? String(value) : "";
      if (String(newValue) === currentStr) {
        setIsEditing(false);
        return;
      }

      updateMutation.mutate({
        id: petId,
        [field]: newValue,
      });
    },
    [value, petId, field, updateMutation],
  );

  const displayValue = format
    ? format(value)
    : type === "boolean"
      ? value
        ? "Sim"
        : "Não"
      : type === "select" && options
        ? options.find((o) => o.value === value)?.label ?? String(value ?? "—")
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

    const currentStr = value != null ? String(value) : "";
    if (trimmed === currentStr) {
      setIsEditing(false);
      return;
    }

    const parsed = type === "number" ? Number(trimmed) : trimmed;

    if (type === "number" && (isNaN(parsed as number) || trimmed === "")) {
      toast.error("Valor numérico inválido");
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
    [save, cancel],
  );

  if (updateMutation.isPending) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-sm">Salvando...</span>
      </span>
    );
  }

  // ── Boolean toggle ──
  if (type === "boolean") {
    const boolValue = !!value;
    return (
      <Badge
        variant={boolValue ? "destructive" : "secondary"}
        className={cn(
          "text-[10px]",
          editable && "cursor-pointer hover:opacity-80 transition-opacity",
          className,
        )}
        onClick={() => {
          if (!editable) return;
          saveValue(!boolValue);
        }}
        title={editable ? "Clique para alternar" : undefined}
      >
        {boolValue ? "Sim" : "Não"}
      </Badge>
    );
  }

  // ── Select dropdown ──
  if (type === "select" && editable) {
    return (
      <Select
        value={value != null ? String(value) : undefined}
        onValueChange={(v) => saveValue(v)}
      >
        <SelectTrigger
          className={cn(
            "h-7 w-auto min-w-[100px] text-xs border-dashed",
            className,
          )}
        >
          <SelectValue placeholder="Selecionar..." />
        </SelectTrigger>
        <SelectContent>
          {options?.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // ── Select (read-only) ──
  if (type === "select" && !editable) {
    return (
      <span className={cn(className)}>
        {displayValue}
      </span>
    );
  }

  // ── Text / Number editing ──
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
          className,
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
        className,
      )}
      title={editable ? "Clique para editar" : undefined}
    >
      {displayValue}
    </span>
  );
}
