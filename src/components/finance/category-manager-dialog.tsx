"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, Lock, Plus, Loader2 } from "lucide-react";

const CATEGORY_ICONS = [
  { value: "🍖", label: "Alimentação" },
  { value: "💊", label: "Medicamentos" },
  { value: "🏥", label: "Veterinário" },
  { value: "🧹", label: "Limpeza" },
  { value: "🛏️", label: "Equipamentos" },
  { value: "🚗", label: "Transporte" },
  { value: "📄", label: "Documentos" },
  { value: "🏠", label: "Infraestrutura" },
  { value: "👤", label: "Pessoal" },
  { value: "📦", label: "Materiais" },
  { value: "💡", label: "Utilidades" },
  { value: "🎓", label: "Treinamento" },
  { value: "📱", label: "Tecnologia" },
  { value: "🔧", label: "Manutenção" },
  { value: "📋", label: "Outros" },
];

interface CategoryManagerDialogProps {
  children?: React.ReactNode;
}

export function CategoryManagerDialog({ children }: CategoryManagerDialogProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");

  const categories = trpc.expenses.listAllCategories.useQuery(undefined, { enabled: open });
  const utils = trpc.useUtils();

  const createCategory = trpc.expenses.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      setNewName("");
      setNewIcon("");
      utils.expenses.listAllCategories.invalidate();
      utils.expenses.listCategories.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleCategory = trpc.expenses.toggleCategory.useMutation({
    onSuccess: () => {
      utils.expenses.listAllCategories.invalidate();
      utils.expenses.listCategories.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateCategory = trpc.expenses.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      utils.expenses.listAllCategories.invalidate();
      utils.expenses.listCategories.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Informe o nome da categoria");
      return;
    }
    if (!newIcon) {
      toast.error("Selecione um ícone");
      return;
    }
    createCategory.mutate({ name: newName.trim(), icon: newIcon });
  }

  function handleToggle(id: number, currentActive: boolean) {
    toggleCategory.mutate({ id, active: !currentActive });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" /> Categorias
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Lista de categorias */}
          <div className="space-y-2">
            {categories.data?.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium text-sm">{cat.name}</span>
                  {cat.isDefault && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={cat.active}
                    onCheckedChange={() => handleToggle(cat.id, cat.active)}
                    disabled={toggleCategory.isPending}
                  />
                </div>
              </div>
            ))}

            {categories.isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {categories.data?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria cadastrada
              </p>
            )}
          </div>

          {/* Formulário de nova categoria */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">Adicionar categoria</h4>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="space-y-2">
                  <Label htmlFor="catName">Nome</Label>
                  <Input
                    id="catName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nome da categoria"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catIcon">Ícone</Label>
                  <Select value={newIcon} onValueChange={setNewIcon}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Ícone" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_ICONS.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.value} {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={createCategory.isPending}
                className="w-full"
              >
                {createCategory.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Adicionar Categoria
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
