import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, ArrowLeft } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl shadow-primary/5 text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center">
              <Mail className="h-7 w-7 text-success-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription className="mt-2">
                We&apos;ve sent you a confirmation link to verify your email address.
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to activate your account and start tracking your habits.
            </p>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">
                Return to login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
