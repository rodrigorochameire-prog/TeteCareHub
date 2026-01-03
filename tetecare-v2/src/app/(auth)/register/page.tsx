import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "./register-form";
import { Sparkles, Users, Clock, Star } from "lucide-react";

export default function RegisterPage() {
  const benefits = [
    { icon: Sparkles, text: "Acesso a todas as funcionalidades" },
    { icon: Users, text: "Acompanhamento em tempo real" },
    { icon: Clock, text: "Histórico completo do pet" },
    { icon: Star, text: "Suporte prioritário" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="mb-8">
            <Image
              src="/tetecare-logo.png"
              alt="Tetê Care"
              width={120}
              height={120}
              className="rounded-3xl shadow-2xl ring-4 ring-white/20"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Junte-se ao Tetê Care
          </h1>
          <p className="text-white/90 text-lg text-center mb-12 max-w-md">
            Crie sua conta e tenha acesso completo à plataforma de gestão de pets
          </p>

          {/* Benefits */}
          <div className="space-y-4 w-full max-w-md">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <benefit.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-white font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Image
              src="/tetecare-logo.png"
              alt="Tetê Care"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground">Tetê Care</h1>
          </div>

          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-foreground">
                Criar sua conta
              </h2>
              <p className="text-muted-foreground mt-2">
                Cadastre-se para gerenciar seus pets
              </p>
            </div>

            <RegisterForm />

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
