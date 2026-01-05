import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { Dog, ShieldCheck, Calendar, Heart, Sparkles } from "lucide-react";

export default function LoginPage() {
  const features = [
    { icon: Dog, text: "Gestão completa de pets", color: "text-amber-500" },
    { icon: ShieldCheck, text: "Controle de vacinas e saúde", color: "text-rose-400" },
    { icon: Calendar, text: "Calendário inteligente", color: "text-blue-400" },
    { icon Heart, text: "Cuidado personalizado", color: "text-rose-400" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-orange-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/80 via-amber-50/60 to-rose-100/40 dark:from-slate-800/50 dark:via-slate-900/80 dark:to-slate-950" />
        
        {/* Subtle decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-rose-200/20 dark:bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-2xl" />
        </div>

        {/* Soft pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} 
        />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          {/* Logo */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-rose-400/20 blur-2xl rounded-full scale-150" />
            <Image
              src="/tetecare-logo.png"
              alt="Tetê Care"
              width={100}
              height={100}
              className="relative rounded-2xl shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30 ring-1 ring-black/5"
            />
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent mb-3 text-center">
            Tetê Care
          </h1>
          <p className="text-muted-foreground text-base text-center mb-10 max-w-sm leading-relaxed">
            A plataforma completa para gestão de creches e daycare para pets
          </p>

          {/* Features - Minimal cards */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-black/5 dark:border-white/5 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-all duration-300 group"
              >
                <div className="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-700/50 group-hover:scale-105 transition-transform">
                  <feature.icon className={`h-4 w-4 ${feature.color}`} />
                </div>
                <span className="text-foreground/80 text-sm font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* Decorative footer */}
          <div className="absolute bottom-8 flex items-center gap-2 text-muted-foreground/50 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Gestão moderna para seu pet</span>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-rose-400/20 blur-xl rounded-full scale-150" />
              <Image
                src="/tetecare-logo.png"
                alt="Tetê Care"
                width={72}
                height={72}
                className="relative rounded-xl shadow-md ring-1 ring-black/5"
              />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent">
              Tetê Care
            </h1>
          </div>

          <div className="space-y-8">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Bem-vindo de volta!
              </h2>
              <p className="text-muted-foreground text-sm">
                Entre com sua conta para continuar
              </p>
            </div>

            <LoginForm />

            <div className="space-y-4 pt-2">
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-3 text-muted-foreground/60">ou</span>
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Não tem uma conta? </span>
                <Link
                  href="/register"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Cadastre-se
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
