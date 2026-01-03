import Image from "next/image";
import { ForgotPasswordForm } from "./forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/tetecare-logo.png"
            alt="Tetê Care"
            width={80}
            height={80}
            className="rounded-2xl object-cover shadow-lg"
          />
        </div>
        <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
        <CardDescription>
          Digite seu email para receber as instruções de recuperação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
