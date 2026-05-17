import React from 'react'

interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down'
  trendValue?: string
  variant?: 'primary' | 'secondary' | 'accent'
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-primary/5 border-primary/10 text-primary',
    secondary: 'bg-secondary/5 border-secondary/10 text-secondary',
    accent: 'bg-accent/5 border-accent/10 text-accent',
  }

  return (
    <div
      className={`bg-card border border-border rounded-xl p-6 ${className}`.trim()}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon && <div className={`text-xl ${variantStyles[variant]}`}>{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {trend && trendValue && (
          <span
            className={`text-sm font-medium ${
              trend === 'up' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
    </div>
  )
}
