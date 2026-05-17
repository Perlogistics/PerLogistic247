import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-foreground mb-2">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg border-2 border-border
              bg-input text-foreground placeholder-muted-foreground
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}
              ${icon ? 'pl-10' : ''}
              ${className}
            `.trim()}
            {...props}
          />
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        </div>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted-foreground mt-1">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
