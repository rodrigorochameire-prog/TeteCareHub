"use client";

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Upload } from "lucide-react";

interface UploadDocumentDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

const CATEGORY_OPTIONS = [
  { value: "vaccination", label: "Vacinação" },
  { value: "exam", label: "Exame" },
  { value: "prescription", label: "Receita" },
  { value: "medical_record", label: "Prontuário" },
  { value: "preventive", label: "Preventivo" },
  { value: "training", label: "Treinamento" },
  { value: "behavior", label: "Comportamento" },
  { value: "nutrition", label: "Nutrição" },
  { value: "insurance", label: "Seguro" },
  { value: "identification", label: "Identificação" },
  { value: "contract", label: "Contrato" },
  { value: "photo", label: "Foto" },
  { value: "other", label: "Outro" },
] as const;

type CategoryValue = typeof CATEGORY_OPTIONS[number]["value"];

export function UploadDocumentDialog({ petId, onSuccess, children }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryValue | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = trpc.documents.uploadFile.useMutation();
  const createDocument = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Documento enviado com sucesso!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !category) {
      toast.error("Preencha título e categoria");
      return;
    }
    if (!selectedFile) {
      toast.error("Selecione um arquivo");
      return;
    }

    setIsUploading(true);
    try {
      // Converter arquivo para base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Upload do arquivo via servidor
      const uploadResult = await uploadFile.mutateAsync({
        petId,
        category,
        fileName: selectedFile.name,
        fileBase64: base64,
        mimeType: selectedFile.type,
      });

      // Criar registro do documento
      await createDocument.mutateAsync({
        petId,
        title,
        description: description || undefined,
        category,
        fileUrl: uploadResult.url,
        fileName: uploadResult.fileName,
        mimeType: uploadResult.mimeType,
        fileSize: uploadResult.fileSize,
      });
    } catch {
      // Erros já tratados nas mutations
    } finally {
      setIsUploading(false);
    }
  }

  const isPending = isUploading || uploadFile.isPending || createDocument.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="docTitle">Título</Label>
            <Input
              id="docTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do documento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as CategoryValue)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="docFile">Arquivo</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="docFile"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              />
              {selectedFile && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {selectedFile.size > 1048576
                    ? `${(selectedFile.size / 1048576).toFixed(1)} MB`
                    : `${Math.round(selectedFile.size / 1024)} KB`}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="docDescription">Descrição</Label>
            <Textarea
              id="docDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Descrição opcional..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Enviar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
