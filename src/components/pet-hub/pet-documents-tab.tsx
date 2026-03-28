"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "./source-badge";
import { FileText, Plus, Trash2, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetDocumentsTabProps {
  petId: number;
  role: "admin" | "tutor";
}

const CATEGORY_LABELS: Record<string, string> = {
  vaccination: "Vacinacao",
  exam: "Exame",
  prescription: "Receita",
  medical_record: "Prontuario",
  preventive: "Preventivo",
  training: "Treinamento",
  behavior: "Comportamento",
  nutrition: "Nutricao",
  insurance: "Seguro",
  identification: "Identificacao",
  contract: "Contrato",
  photo: "Foto",
  other: "Outro",
};

export function PetDocumentsTab({ petId, role }: PetDocumentsTabProps) {
  const { data, isLoading } = trpc.documents.byPet.useQuery({ petId });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{doc.title}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </Badge>
                    {String((doc as Record<string, unknown>).source || "") !== "" && (
                      <SourceBadge
                        source={(doc as Record<string, unknown>).source as "admin" | "tutor"}
                      />
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {doc.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                    <span>
                      {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    {doc.fileName && <span>· {doc.fileName}</span>}
                    {doc.fileSize && (
                      <span>
                        · {doc.fileSize > 1048576
                          ? `${(doc.fileSize / 1048576).toFixed(1)} MB`
                          : `${Math.round(doc.fileSize / 1024)} KB`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {doc.fileUrl && (
                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {(role === "admin" || (doc as Record<string, unknown>).source === "tutor") && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum documento registrado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
