import Image from "next/image";
import { RegisterForm } from "./register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
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
        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
        <CardDescription>
          Cadastre-se para gerenciar seus pets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Já tem uma conta? </span>
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
