import Image from "next/image";
import { LoginForm } from "./login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
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
        <CardTitle className="text-2xl font-bold">Tetê Care</CardTitle>
        <CardDescription>
          Entre com sua conta para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Não tem uma conta? </span>
          <Link href="/register" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
