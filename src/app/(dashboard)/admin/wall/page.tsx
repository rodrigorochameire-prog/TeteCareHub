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
  Image as ImageIcon,
  Grid3X3,
  List,
  Camera,
  X,
  ZoomIn
} from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

export default function AdminWall() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [viewMode, setViewMode] = useState<"feed" | "gallery">("feed");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

  // Filtrar posts com imagens para a galeria
  const postsWithImages = posts?.filter(p => p.imageUrl) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            Mural
          </h1>
          <p className="text-muted-foreground mt-1">
            Comunicação com tutores e atualizações
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "feed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("feed")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "gallery" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("gallery")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Post
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fotos Compartilhadas</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{postsWithImages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curtidas Totais</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {posts?.reduce((acc, p) => acc + (p.likesCount || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gallery View */}
      {viewMode === "gallery" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Galeria de Fotos
            </CardTitle>
            <CardDescription>
              {postsWithImages.length} foto{postsWithImages.length !== 1 ? "s" : ""} compartilhada{postsWithImages.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {postsWithImages.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma foto compartilhada ainda</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {postsWithImages.map((post) => (
                  <div
                    key={post.id}
                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border hover:shadow-lg transition-all"
                    onClick={() => setLightboxImage(post.imageUrl!)}
                  >
                    <img
                      src={post.imageUrl!}
                      alt={post.pet?.name || "Foto"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-medium truncate">
                          {post.pet?.name || "Post"}
                        </p>
                        <div className="flex items-center gap-3 text-white/80 text-sm">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {post.commentsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-1">
                        <ZoomIn className="h-4 w-4 text-gray-700" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feed View - Posts */}
      {viewMode === "feed" && (!posts || posts.length === 0 ? (
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
          {/* Pinned posts first */}
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
                  <div 
                    className="mt-3 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setLightboxImage(post.imageUrl!)}
                  >
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="w-full max-h-96 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
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
      ))}

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={lightboxImage}
            alt="Foto ampliada"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
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
