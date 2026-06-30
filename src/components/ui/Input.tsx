import { cn } from "@/lib/utils";

export function Input({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          "focus-theme w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Textarea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "focus-theme w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Select({
  label,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        className={cn(
          "focus-theme w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
