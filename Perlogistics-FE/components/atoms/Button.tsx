import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center gap-2'

    const variantStyles = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:scale-95',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-95',
      outline: 'border-2 border-primary text-primary hover:bg-primary/5 active:scale-95',
      ghost: 'text-primary hover:bg-primary/10 active:scale-95',
    }

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`.trim()}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {icon && !isLoading && icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
