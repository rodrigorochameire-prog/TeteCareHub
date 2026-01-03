"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Plus, 
  Heart,
  MessageCircle,
  Pin,
  Trash2,
  Send,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

export default function AdminWall() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const { data: posts, isLoading, refetch } = trpc.wall.posts.useQuery({});
  const { data: pets } = trpc.pets.list.useQuery();

  const createPost = trpc.wall.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post criado com sucesso!");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar post: " + error.message);
    },
  });

  const toggleLike = trpc.wall.toggleLike.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deletePost = trpc.wall.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post removido!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover post: " + error.message);
    },
  });

  const addComment = trpc.wall.addComment.useMutation({
    onSuccess: () => {
      setComment("");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar comentário: " + error.message);
    },
  });

  const handleCreatePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createPost.mutate({
      content: formData.get("content") as string,
      petId: formData.get("petId") ? Number(formData.get("petId")) : undefined,
      visibility: formData.get("visibility") as "all" | "tutors" | "admin",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mural</h1>
          <p className="text-muted-foreground mt-2">
            Comunicação com tutores e atualizações
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {/* Posts */}
      {!posts || posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Nenhum post no mural
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Criar primeiro post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {posts.map((post) => (
            <Card key={post.id} className={post.isPinned ? "border-primary" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(post.author?.name || "A")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{post.author?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <Badge variant="secondary">
                        <Pin className="h-3 w-3 mr-1" />
                        Fixado
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {post.visibility === "all" ? "Público" : 
                       post.visibility === "tutors" ? "Tutores" : "Admin"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Remover este post?")) {
                          deletePost.mutate({ id: post.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {post.pet && (
                  <Badge variant="secondary" className="mb-2">
                    🐕 {post.pet.name}
                  </Badge>
                )}
                <p className="whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt="Post" 
                    className="mt-3 rounded-lg max-h-96 object-cover"
                  />
                )}
                
                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike.mutate({ postId: post.id })}
                    className={post.userLiked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${post.userLiked ? "fill-current" : ""}`} />
                    {post.likesCount}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.commentsCount}
                  </Button>
                </div>

                {/* Comments */}
                {selectedPost === post.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Escreva um comentário..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button
                        size="icon"
                        onClick={() => {
                          if (comment.trim()) {
                            addComment.mutate({ postId: post.id, content: comment });
                          }
                        }}
                        disabled={addComment.isPending}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreatePost}>
            <DialogHeader>
              <DialogTitle>Novo Post</DialogTitle>
              <DialogDescription>
                Crie um post para o mural
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="O que você quer compartilhar?"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="petId">Pet relacionado</Label>
                <Select name="petId">
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhum (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {pets?.map((pet) => (
                      <SelectItem key={pet.id} value={String(pet.id)}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilidade *</Label>
                <Select name="visibility" defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Público (todos)</SelectItem>
                    <SelectItem value="tutors">Apenas tutores</SelectItem>
                    <SelectItem value="admin">Apenas admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPost.isPending}>
                {createPost.isPending ? "Publicando..." : "Publicar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
