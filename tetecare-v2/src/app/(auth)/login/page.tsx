import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { Dog, Shield, Calendar, Heart } from "lucide-react";

export default function LoginPage() {
  const features = [
    { icon: Dog, text: "Gestão completa de pets" },
    { icon: Shield, text: "Controle de vacinas e saúde" },
    { icon: Calendar, text: "Calendário inteligente" },
    { icon: Heart, text: "Cuidado personalizado" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
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
            Tetê Care
          </h1>
          <p className="text-white/90 text-lg text-center mb-12 max-w-md">
            A plataforma completa para gestão de creches e hotéis para pets
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="h-6 w-6 text-white" />
                <span className="text-white text-sm font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
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
                Bem-vindo de volta!
              </h2>
              <p className="text-muted-foreground mt-2">
                Entre com sua conta para continuar
              </p>
            </div>

            <LoginForm />

            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link
                href="/register"
                className="text-primary font-semibold hover:underline"
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
