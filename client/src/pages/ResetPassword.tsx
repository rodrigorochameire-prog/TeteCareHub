import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase não está configurado. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasValidHash, setHasValidHash] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    // Check if URL has Supabase hash (access_token in hash)
    const hash = window.location.hash;
    console.log('[ResetPassword] URL hash:', hash);
    console.log('[ResetPassword] Full URL:', window.location.href);
    
    // Listen for auth state changes (Supabase processes hash automatically)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ResetPassword] Auth state change:', event, session?.user?.email);
      
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        console.log('[ResetPassword] Recovery session detected');
        setHasValidHash(true);
      }
    });
    
    // Also check hash directly
    if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
      console.log('[ResetPassword] Valid Supabase recovery hash found');
      setHasValidHash(true);
      
      // Process the hash immediately to set the session
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        // Set session immediately when page loads
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (error) {
            console.error('[ResetPassword] Error setting session:', error);
            toast.error(`Erro ao processar link: ${error.message}`);
          } else {
            console.log('[ResetPassword] Session set successfully', data.session?.user?.email);
            setHasValidHash(true);
          }
        });
      }
    } else {
      // Check if we already have a session (Supabase may have processed it)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('[ResetPassword] Existing session found:', session.user?.email);
          setHasValidHash(true);
        } else {
          // Also check for token in query params (fallback for custom tokens)
          const params = new URLSearchParams(window.location.search);
          const tokenParam = params.get("token");
          if (tokenParam) {
            console.log('[ResetPassword] Custom token found in query params');
            setHasValidHash(true);
          } else {
            console.log('[ResetPassword] No valid token found in URL');
          }
        }
      });
    }
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success("Senha redefinida! Sua senha foi alterada com sucesso. Você já pode fazer login.");
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    },
    onError: (error) => {
      toast.error(`Erro ao redefinir senha: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasValidHash) {
      toast.error("O link de redefinição de senha está incompleto ou inválido.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas digitadas não são iguais.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      
      // First, check if we already have a valid session
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('[ResetPassword] Current session check:', { 
        hasSession: !!session, 
        userEmail: session?.user?.email,
        sessionError: sessionError?.message 
      });
      
      // If no session, try to get it from hash
      if (!session) {
        console.log('[ResetPassword] No session found, trying to extract from hash');
        const hash = window.location.hash;
        if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
          console.log('[ResetPassword] No session found, extracting from hash');
          
          // Extract tokens from hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          console.log('[ResetPassword] Tokens extracted:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken 
          });
          
          if (!accessToken || !refreshToken) {
            throw new Error("Tokens não encontrados no link. Verifique se o link está completo.");
          }

          // Set the session with both tokens
          const sessionResult = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionResult.error) {
            console.error('[ResetPassword] Session error:', sessionResult.error);
            throw new Error(`Erro ao validar token: ${sessionResult.error.message}`);
          }

          session = sessionResult.data.session;
          
          if (!session) {
            throw new Error("Não foi possível criar a sessão. Tente solicitar um novo link.");
          }

          console.log('[ResetPassword] Session created successfully');
        } else {
          // Fallback: use custom token from query params
          const params = new URLSearchParams(window.location.search);
          const tokenParam = params.get("token");
          if (tokenParam) {
            resetPasswordMutation.mutate({ token: tokenParam, newPassword });
            return;
          } else {
            throw new Error("Sessão não encontrada. Verifique se o link está completo e tente novamente.");
          }
        }
      }

      // Now we have a session, update the password
      if (!session) {
        throw new Error("Sessão não encontrada. Por favor, solicite um novo link de redefinição.");
      }
      
      console.log('[ResetPassword] Updating password with session:', session.user?.email);
      
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('[ResetPassword] Update error:', updateError);
        throw new Error(`Erro ao atualizar senha: ${updateError.message}`);
      }

      console.log('[ResetPassword] Password updated successfully');
      console.log('[ResetPassword] Update result:', {
        user: updateData.user?.email,
        session: !!updateData.session
      });
      
      // Verify the password was updated by trying to sign in
      // Wait a moment for Supabase to process the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('[ResetPassword] Verifying password update...');
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: session.user.email!,
        password: newPassword
      });
      
      if (verifyError) {
        console.error('[ResetPassword] Password verification failed:', verifyError.message);
        // Don't throw error - password might be updated but verification failed due to timing
        console.warn('[ResetPassword] Password update may have succeeded but verification failed. Please try logging in.');
      } else {
        console.log('[ResetPassword] Password verification successful!');
        // Sign out the test session
        await supabase.auth.signOut();
      }
      setSuccess(true);
      toast.success("Senha redefinida! Sua senha foi alterada com sucesso. Você já pode fazer login.");
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Erro ao redefinir senha. Tente novamente.");
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasValidHash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Link Inválido</CardTitle>
            <CardDescription>
              O link de redefinição de senha está incompleto ou inválido.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/forgot-password">Solicitar novo link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso. Redirecionando para o login...
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/login">Ir para o login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-destructive">As senhas não conferem</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || resetPasswordMutation.isPending || newPassword !== confirmPassword}
            >
              {loading || resetPasswordMutation.isPending ? "Redefinindo..." : "Redefinir senha"}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">Cancelar</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
