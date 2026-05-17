import React from 'react'

interface TimelineEvent {
  timestamp: Date
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
}

interface StatusTimelineProps {
  events: TimelineEvent[]
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ events }) => {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-4 h-4 rounded-full border-2 flex items-center justify-center
                ${
                  event.status === 'completed'
                    ? 'bg-secondary border-secondary'
                    : event.status === 'current'
                      ? 'bg-primary border-primary animate-pulse-soft'
                      : 'bg-muted border-border'
                }
              `}
            >
              {event.status === 'completed' && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            {index < events.length - 1 && (
              <div className="w-0.5 h-12 bg-border mt-2" />
            )}
          </div>

          <div className="pb-4 flex-1">
            <div className="flex items-baseline gap-2">
              <h4 className="font-semibold text-foreground">{event.title}</h4>
              <span className="text-xs text-muted-foreground">
                {event.timestamp.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
