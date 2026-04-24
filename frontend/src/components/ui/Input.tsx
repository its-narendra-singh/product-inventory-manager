import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

export default function Input({ label, error, id, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {rest.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white',
          className,
        ].join(' ')}
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
