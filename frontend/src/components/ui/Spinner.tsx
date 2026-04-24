type Size = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: Size;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={[
        'inline-block rounded-full border-current border-r-transparent animate-spin',
        sizeClasses[size],
        className,
      ].join(' ')}
    />
  );
}
