import type { ReactNode, FormEvent } from 'react';

interface FormCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}

export default function FormCard({ title, subtitle, children, onSubmit }: FormCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {onSubmit ? (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            {children}
          </form>
        ) : (
          <div className="flex flex-col gap-4">{children}</div>
        )}
      </div>
    </div>
  );
}
