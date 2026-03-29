"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { UploadDocumentDialog } from "./dialogs/upload-document-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SourceBadge } from "./source-badge";
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Syringe,
  TestTube2,
  FileHeart,
  FileImage,
  FileBadge,
  FileCheck,
  ScrollText,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface PetDocumentsTabProps {
  petId: number;
  role: "admin" | "tutor";
}

const CATEGORY_LABELS: Record<string, string> = {
  vaccination: "Vacinação",
  exam: "Exame",
  prescription: "Receita",
  medical_record: "Prontuário",
  preventive: "Preventivo",
  training: "Treinamento",
  behavior: "Comportamento",
  nutrition: "Nutrição",
  insurance: "Seguro",
  identification: "Identificação",
  contract: "Contrato",
  photo: "Foto",
  other: "Outro",
};

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  vaccination: Syringe,
  exam: TestTube2,
  prescription: ScrollText,
  medical_record: FileHeart,
  preventive: FileCheck,
  photo: FileImage,
  identification: FileBadge,
  contract: FileCheck,
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] ?? FileText;
}

export function PetDocumentsTab({ petId, role }: PetDocumentsTabProps) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.documents.byPet.useQuery({ petId });

  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Documento removido com sucesso");
      utils.documents.byPet.invalidate({ petId });
    },
    onError: (err) => toast.error(err.message),
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; title: string } | null>(null);

  function handleDeleteClick(id: number, title: string) {
    setPendingDelete({ id, title });
    setConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteDocument.mutate({ id: pendingDelete.id });
    setConfirmOpen(false);
    setPendingDelete(null);
  }

  function handleDocumentSuccess() {
    utils.documents.byPet.invalidate({ petId });
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar remoção"
        description={`Tem certeza que deseja remover o documento "${pendingDelete?.title ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteDocument.isPending}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </CardTitle>
          <UploadDocumentDialog petId={petId} onSuccess={handleDocumentSuccess} />
        </div>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((doc) => {
              const CategoryIcon = getCategoryIcon(doc.category);
              return (
                <div
                  key={doc.id}
                  className="group p-4 rounded-lg border text-sm transition-all duration-200 hover:bg-muted/50 hover:shadow-sm flex flex-col gap-2"
                >
                  {/* Icon + Category */}
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.fileUrl && (
                        <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      {(role === "admin" || (doc as Record<string, unknown>).source === "tutor") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all duration-200"
                          onClick={() => handleDeleteClick(doc.id, doc.title)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Title + Badges */}
                  <div>
                    <p className="font-medium truncate text-foreground">{doc.title}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">
                        {CATEGORY_LABELS[doc.category] ?? doc.category}
                      </Badge>
                      {String((doc as Record<string, unknown>).source || "") !== "" && (
                        <SourceBadge
                          source={(doc as Record<string, unknown>).source as "admin" | "tutor"}
                        />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {doc.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {doc.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px] mt-auto">
                    <span>
                      {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    {doc.fileSize && (
                      <>
                        <span>&middot;</span>
                        <span>
                          {doc.fileSize > 1048576
                            ? `${(doc.fileSize / 1048576).toFixed(1)} MB`
                            : `${Math.round(doc.fileSize / 1024)} KB`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum documento registrado</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Armazene exames, receitas e outros documentos importantes.</p>
            <UploadDocumentDialog petId={petId} onSuccess={handleDocumentSuccess}>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5 transition-all duration-200">
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </UploadDocumentDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
