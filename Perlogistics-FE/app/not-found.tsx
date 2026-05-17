import Link from 'next/link'
import { Button } from '@/components/atoms/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-background to-secondary flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">404</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link href="/dashboard">
          <Button variant="primary" size="lg" className="w-full mb-3">
            Go to Dashboard
          </Button>
        </Link>

        <Link href="/">
          <Button variant="outline" size="lg" className="w-full">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
