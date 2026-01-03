"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Plus, 
  FileText,
  Eye,
  Trash2,
  Dog,
  Syringe,
  TestTube,
  Pill,
  File,
  Upload
} from "lucide-react";
import { toast } from "sonner";

const categoryIcons: Record<string, typeof FileText> = {
  vaccination: Syringe,
  exam: TestTube,
  prescription: Pill,
  other: File,
};

const categoryLabels: Record<string, string> = {
  vaccination: "Vacinação",
  exam: "Exame",
  prescription: "Receita",
  other: "Outro",
};

export default function TutorDocuments() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  const { data: myPets } = trpc.pets.myPets.useQuery();

  // Buscar documentos para cada pet
  const petDocumentsQueries = myPets?.map((pet) => ({
    petId: pet.id,
    petName: pet.name,
    photoUrl: pet.photoUrl,
    query: trpc.documents.byPet.useQuery({ petId: pet.id }),
  })) || [];

  const uploadDocument = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Documento enviado com sucesso!");
      setIsUploadDialogOpen(false);
      petDocumentsQueries.forEach(q => q.query.refetch());
    },
    onError: (error) => {
      toast.error("Erro ao enviar documento: " + error.message);
    },
  });

  const deleteDocument = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Documento removido!");
      petDocumentsQueries.forEach(q => q.query.refetch());
    },
    onError: (error) => {
      toast.error("Erro ao remover documento: " + error.message);
    },
  });

  const handleUploadDocument = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Por enquanto, usando URL direta (implementar upload real depois)
    uploadDocument.mutate({
      petId: Number(formData.get("petId")),
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      category: formData.get("category") as "vaccination" | "exam" | "prescription" | "other",
      fileUrl: formData.get("fileUrl") as string,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground mt-2">
            Documentos veterinários dos seus pets
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Enviar Documento
        </Button>
      </div>

      {/* Pets e seus documentos */}
      {!myPets || myPets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dog className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Você ainda não tem pets cadastrados
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {petDocumentsQueries.map(({ petId, petName, photoUrl, query }) => {
            const documents = query.data || [];

            return (
              <AccordionItem key={petId} value={String(petId)} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt={petName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Dog className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-medium">{petName}</p>
                      <p className="text-sm text-muted-foreground">
                        {documents.length} documentos
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {query.isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum documento</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setSelectedPetId(petId);
                          setIsUploadDialogOpen(true);
                        }}
                      >
                        Enviar primeiro documento
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-3 pb-4 md:grid-cols-2">
                      {documents.map((doc) => {
                        const CategoryIcon = categoryIcons[doc.category] || FileText;
                        
                        return (
                          <Card key={doc.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <CategoryIcon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{doc.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {categoryLabels[doc.category]}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                                </Badge>
                              </div>
                              {doc.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {doc.description}
                                </p>
                              )}
                              <div className="flex gap-2 mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => window.open(doc.fileUrl, "_blank")}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm("Remover este documento?")) {
                                      deleteDocument.mutate({ id: doc.id });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleUploadDocument}>
            <DialogHeader>
              <DialogTitle>Enviar Documento</DialogTitle>
              <DialogDescription>
                Envie um documento veterinário
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="petId">Pet *</Label>
                <Select name="petId" defaultValue={selectedPetId ? String(selectedPetId) : undefined} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {myPets?.map((pet) => (
                      <SelectItem key={pet.id} value={String(pet.id)}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: Carteira de vacinação"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination">Vacinação</SelectItem>
                    <SelectItem value="exam">Exame</SelectItem>
                    <SelectItem value="prescription">Receita</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUrl">URL do Arquivo *</Label>
                <Input
                  id="fileUrl"
                  name="fileUrl"
                  type="url"
                  placeholder="https://..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Cole o link do documento (Google Drive, Dropbox, etc)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={uploadDocument.isPending}>
                {uploadDocument.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
