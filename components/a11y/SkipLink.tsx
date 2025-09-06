import type { ComponentProps } from 'react';

type Props = {
  target: string;
  label?: string;
} & Omit<ComponentProps<'a'>, 'href' | 'children'>;

export default function SkipLink({
  target,
  label = 'Skip to main content',
  className = '',
  ...rest
}: Props) {
  return (
    <a
      href={target}
      className={`absolute left-3 top-3 z-50 -translate-y-16 transform rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black shadow focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-sky-600 ${className}`}
      {...rest}
    >
      {label}
    </a>
  );
}
