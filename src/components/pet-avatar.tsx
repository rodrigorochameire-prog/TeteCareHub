import Image from 'next/image';
import { BreedIcon } from './breed-icon';
import { cn } from '@/lib/utils';

interface PetAvatarProps {
  photoUrl?: string | null;
  breed?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

export function PetAvatar({ photoUrl, breed, name, size = 48, className }: PetAvatarProps) {
  if (photoUrl) {
    return (
      <div 
        className={cn("relative rounded-full overflow-hidden flex-shrink-0", className)} 
        style={{ width: size, height: size }}
      >
        <Image
          src={photoUrl}
          alt={name || 'Pet'}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return <BreedIcon breed={breed} size={size} className={className} />;
}
