import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { ComponentProps } from 'react';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.6)] backdrop-blur',
        className
      )}
      {...props}
    />
  );
}

type ButtonProps = ComponentProps<'button'> & {
  asChild?: boolean;
  href?: string;
  variant?: 'primary' | 'outline' | 'ghost';
};
export function CTA({
  className,
  href,
  variant = 'outline',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition';
  const styles = {
    primary:
      'bg-white text-gray-900 hover:bg-gray-200 active:translate-y-[1px]',
    outline:
      'border border-white/20 hover:bg-white/10 active:translate-y-[1px]',
    ghost: 'hover:bg-white/10 active:translate-y-[1px]',
  }[variant];

  const classes = cn(base, styles, className);
  if (href)
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  return <button className={classes} {...props} />;
}
