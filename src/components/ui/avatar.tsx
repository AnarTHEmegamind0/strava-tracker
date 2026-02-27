import Image from 'next/image';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AvatarProps = HTMLAttributes<HTMLDivElement>;

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-foreground',
        className,
      )}
      {...props}
    />
  );
}

interface AvatarImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function AvatarImage({ src, alt, className }: AvatarImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="40px"
      className={cn('object-cover', className)}
    />
  );
}

export function AvatarFallback({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('text-sm font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}
