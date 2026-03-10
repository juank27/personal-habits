import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Target, TrendingUp, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">HabitFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          Build habits that stick
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
          Track your habits,{' '}
          <span className="text-primary">transform your life</span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          HabitFlow helps you build consistent routines with beautiful tracking, 
          streak motivation, and insightful statistics.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="h-14 px-8 text-base" asChild>
            <Link href="/auth/sign-up">
              Start for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Everything you need to build better habits
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Target}
              title="Daily Tracking"
              description="Simple one-tap tracking to log your habits. Never miss a day with smart reminders."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Streak Motivation"
              description="Build momentum with streaks. Watch your consistency grow day by day."
            />
            <FeatureCard
              icon={Calendar}
              title="Insightful Stats"
              description="Visualize your progress with weekly and monthly statistics and completion rates."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to transform your habits?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of users who are building better routines with HabitFlow.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="h-12 px-6" asChild>
                <Link href="/auth/sign-up">
                  Create free account
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Unlimited habits
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">HabitFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Build better habits, one day at a time.
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
