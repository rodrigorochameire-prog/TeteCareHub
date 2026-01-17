"use client";

import Image from 'next/image';
import { Dog } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mapeamento de raças para arquivos de ícones
const BREED_ICON_MAP: Record<string, string> = {
  // Golden Retriever
  'golden retriever': 'golden_retriever',
  'golden': 'golden_retriever',
  
  // Cavalier King Charles Spaniel
  'cavalier king charles spaniel': 'cavalier_king_charles_spaniel',
  'cavalier': 'cavalier_king_charles_spaniel',
  
  // Vira-Lata / Mixed Breed
  'vira-lata': 'vira_lata_mixed_breed',
  'vira lata': 'vira_lata_mixed_breed',
  'mixed breed': 'vira_lata_mixed_breed',
  'sem raça definida': 'vira_lata_mixed_breed',
  'srd': 'vira_lata_mixed_breed',
  
  // Vira-Latas Específicos
  'vira-lata caramelo': 'viralatacaramelo',
  'vira lata caramelo': 'viralatacaramelo',
  'vira-lata pretinho': 'viralatapretinho',
  'vira lata pretinho': 'viralatapretinho',
  
  // Shih Tzu
  'shih tzu': 'shitzu',
  'shitzu': 'shitzu',
  
  // Beagle
  'beagle': 'beagle',
  
  // Dachshund (Salsicha)
  'dachshund': 'salsicha_dachshund',
  'salsicha': 'salsicha_dachshund',
  'teckel': 'salsicha_dachshund',
  
  // Pomeranian (Lulu da Pomerânia)
  'pomeranian': 'lulu_da_pomerania_pomeranian',
  'lulu da pomerania': 'lulu_da_pomerania_pomeranian',
  'lulu': 'lulu_da_pomerania_pomeranian',
  
  // Chihuahua
  'chihuahua': 'chihuahua',
  
  // Pug
  'pug': 'pug',
  
  // Poodle
  'poodle': 'poodle',
  
  // Yorkshire Terrier
  'yorkshire terrier': 'yorkshire_terrier',
  'yorkshire': 'yorkshire_terrier',
  'yorkie': 'yorkshire_terrier',
  
  // Husky Siberiano
  'siberian husky': 'husky_siberiano',
  'husky siberiano': 'husky_siberiano',
  'husky': 'husky_siberiano',
  
  // Labrador Retriever
  'labrador retriever': 'labrador_retriever',
  'labrador': 'labrador_retriever',
  'lab': 'labrador_retriever',
  
  // Pastor Alemão
  'german shepherd': 'pastor_alemao',
  'pastor alemao': 'pastor_alemao',
  'pastor alemão': 'pastor_alemao',
  
  // Bulldog Francês
  'french bulldog': 'buldogue_frances_french_bulldog',
  'buldogue frances': 'buldogue_frances_french_bulldog',
  'buldogue francês': 'buldogue_frances_french_bulldog',
  'frenchie': 'buldogue_frances_french_bulldog',
  
  // Border Collie
  'border collie': 'border_collie',
  
  // Boxer
  'boxer': 'boxer',
  
  // Cocker Spaniel
  'cocker spaniel': 'cocker_spaniel',
  'cocker': 'cocker_spaniel',
  
  // Dálmata
  'dalmatian': 'dalmata',
  'dalmata': 'dalmata',
  'dálmata': 'dalmata',
  
  // Shiba Inu
  'shiba inu': 'shiba_inu',
  'shiba': 'shiba_inu',
  
  // Chow Chow
  'chow chow': 'chow_chow',
  'chow': 'chow_chow',
  
  // São Bernardo
  'saint bernard': 'sao_bernardo',
  'sao bernardo': 'sao_bernardo',
  'são bernardo': 'sao_bernardo',
  
  // Galgo
  'greyhound': 'galgo',
  'galgo': 'galgo',
  
  // Malamute do Alasca
  'alaskan malamute': 'malamute_do_alasca',
  'malamute': 'malamute_do_alasca',
  
  // Maltês
  'maltese': 'maltes',
  'maltes': 'maltes',
  'maltês': 'maltes',
  
  // Lhasa Apso
  'lhasa apso': 'lhasaapso',
  'lhasa': 'lhasaapso',
  
  // Buldogue Inglês
  'english bulldog': 'bulldogingles',
  'buldogue ingles': 'bulldogingles',
  'buldogue inglês': 'bulldogingles',
  
  // Jack Russell Terrier
  'jack russell terrier': 'jackrussel',
  'jack russell': 'jackrussel',
  
  // Labrador Preto
  'black labrador': 'labradorpreto',
  'labrador preto': 'labradorpreto',
};

// Configuração de tamanhos
const SIZES = {
  xs: { container: 28, image: 26, icon: 14, radius: 'rounded-lg' },
  sm: { container: 36, image: 33, icon: 16, radius: 'rounded-lg' },
  md: { container: 48, image: 44, icon: 20, radius: 'rounded-xl' },
  lg: { container: 64, image: 59, icon: 28, radius: 'rounded-xl' },
  xl: { container: 80, image: 74, icon: 36, radius: 'rounded-2xl' },
  '2xl': { container: 96, image: 88, icon: 44, radius: 'rounded-2xl' },
} as const;

type SizeKey = keyof typeof SIZES;

interface PremiumBreedIconProps {
  breed?: string | null;
  size?: SizeKey;
  className?: string;
  showHover?: boolean;
  shadowStrength?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function PremiumBreedIcon({ 
  breed, 
  size = 'md',
  className,
  showHover = true,
  shadowStrength = 'md'
}: PremiumBreedIconProps) {
  const sizeConfig = SIZES[size];
  const normalizedBreed = breed?.toLowerCase().trim();
  const iconFile = normalizedBreed ? BREED_ICON_MAP[normalizedBreed] : null;
  
  // Classes de sombra
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  // Classes de hover
  const hoverClasses = showHover 
    ? 'hover:shadow-lg hover:-translate-y-0.5 hover:ring-slate-300/80 dark:hover:ring-slate-600/60'
    : '';

  const imageWidth = Math.round(sizeConfig.container * 0.92);
  const imageHeight = Math.round(sizeConfig.container * 1.15);

  if (iconFile) {
    return (
      <div 
        className={cn(
          "relative overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900",
          "ring-1 ring-slate-200/60 dark:ring-slate-700/40",
          "transition-all duration-200 ease-out",
          sizeConfig.radius,
          shadowClasses[shadowStrength],
          hoverClasses,
          className
        )} 
        style={{ width: sizeConfig.container, height: sizeConfig.container }}
      >
        <div 
          className="absolute left-1/2 -translate-x-1/2" 
          style={{ 
            width: imageWidth, 
            height: imageHeight,
            top: Math.round(sizeConfig.container * 0.08),
          }}
        >
          <Image
            src={`/breed-icons/${iconFile}.png?v=18`}
            alt={breed || 'Pet'}
            fill
            className="object-contain object-top"
            sizes={`${imageWidth}px`}
          />
        </div>
      </div>
    );
  }
  
  // Fallback: ícone genérico
  return (
    <div 
      className={cn(
        "flex items-center justify-center bg-slate-100 dark:bg-slate-800",
        "ring-1 ring-slate-200/60 dark:ring-slate-700/40",
        "transition-all duration-200 ease-out",
        sizeConfig.radius,
        shadowClasses[shadowStrength],
        hoverClasses,
        className
      )} 
      style={{ width: sizeConfig.container, height: sizeConfig.container }}
    >
      <Dog 
        className="text-slate-400 dark:text-slate-500" 
        style={{ width: sizeConfig.icon, height: sizeConfig.icon }} 
      />
    </div>
  );
}

// Componente para uso em listas (compacto)
export function BreedIconSmall({ breed, className }: { breed?: string | null; className?: string }) {
  return (
    <PremiumBreedIcon 
      breed={breed} 
      size="sm" 
      showHover={false} 
      shadowStrength="sm"
      className={className}
    />
  );
}

// Componente para cards
export function BreedIconMedium({ breed, className }: { breed?: string | null; className?: string }) {
  return (
    <PremiumBreedIcon 
      breed={breed} 
      size="md" 
      showHover={true} 
      shadowStrength="md"
      className={className}
    />
  );
}

// Componente para header de perfil (grande e imponente)
export function BreedIconLarge({ breed, className }: { breed?: string | null; className?: string }) {
  return (
    <PremiumBreedIcon 
      breed={breed} 
      size="xl" 
      showHover={false} 
      shadowStrength="lg"
      className={className}
    />
  );
}
