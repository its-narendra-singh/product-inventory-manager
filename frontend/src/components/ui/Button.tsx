import type { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-300',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400 disabled:text-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
