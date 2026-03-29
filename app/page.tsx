import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Flame,
  Zap,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--primary)' }}
        />
        <div
          className="absolute top-1/2 -left-32 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: 'oklch(0.7 0.2 320)' }}
        />
        <div
          className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--primary)' }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto animate-fade-in-up">
        <div className="flex items-center gap-1">
          <Image
            src="/mindSai-17.png"
            alt="HabitFlow Logo"
            width={150}
            height={40}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="rounded-xl cursor-pointer" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer" asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-28 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-fade-in-up border"
          style={{
            background: 'color-mix(in oklch, var(--primary) 10%, transparent)',
            borderColor: 'color-mix(in oklch, var(--primary) 25%, transparent)',
            color: 'var(--primary)',
            animationDelay: '100ms',
          }}
        >
          <Sparkles className="h-4 w-4" />
          Build habits that stick
          <Zap className="h-3.5 w-3.5" />
        </div>

        <h1
          className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6 animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          Track your habits,{" "}
          <span className="gradient-text">transform your life</span>
        </h1>

        <p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          HabitFlow helps you build consistent routines with beautiful tracking,
          streak motivation, and insightful statistics.
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up"
          style={{ animationDelay: '250ms' }}
        >
          <Button
            size="lg"
            className="h-14 px-8 text-base rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            asChild
          >
            <Link href="/auth/sign-up">
              Start for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-base rounded-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            asChild
          >
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>

        {/* Social proof row */}
        <div
          className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            Free forever
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            No credit card
          </span>
          <span className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500 shrink-0" />
            Streak tracking
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-3 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Everything you need to build better habits
          </h2>
          <p
            className="text-center text-muted-foreground mb-12 animate-fade-in-up"
            style={{ animationDelay: '150ms' }}
          >
            Simple, powerful tools for lasting change.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Target}
              title="Daily Tracking"
              description="Simple one-tap tracking to log your habits. Build your routine effortlessly every single day."
              gradient="from-primary/15 to-violet-400/10"
              iconColor="text-primary"
              delay={200}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Streak Motivation"
              description="Build momentum with streaks. Watch your consistency grow and feel the power of compounding."
              gradient="from-orange-400/15 to-rose-400/10"
              iconColor="text-orange-500"
              delay={250}
            />
            <FeatureCard
              icon={Calendar}
              title="Insightful Stats"
              description="Visualize your progress with beautiful charts. Understand your patterns and celebrate milestones."
              gradient="from-emerald-400/15 to-teal-400/10"
              iconColor="text-emerald-500"
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <div
            className="relative rounded-3xl p-8 md:p-12 text-center overflow-hidden border animate-fade-in-up"
            style={{
              background: 'linear-gradient(135deg, color-mix(in oklch, var(--primary) 8%, transparent), color-mix(in oklch, oklch(0.7 0.2 320) 6%, transparent))',
              borderColor: 'color-mix(in oklch, var(--primary) 20%, transparent)',
            }}
          >
            {/* Decorative glow */}
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -z-0 opacity-30"
              style={{ background: 'var(--primary)', transform: 'translate(40%, -40%)' }}
            />

            <div className="relative z-10">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 shadow-lg"
                style={{ background: 'color-mix(in oklch, var(--primary) 15%, transparent)' }}
              >
                <Sparkles className="h-7 w-7 text-primary" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Ready to transform your habits?
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Join thousands of users building better routines with HabitFlow.
              </p>

              <Button
                size="lg"
                className="h-13 px-8 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                asChild
              >
                <Link href="/auth/sign-up" className="flex items-center gap-2">
                  Create free account
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Unlimited habits
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <Image
              src="/mindSai-17.png"
              alt="HabitFlow Logo"
              width={120}
              height={30}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Build better habits, one day at a time.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  iconColor,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
  delay: number;
}) {
  return (
    <div
      className={`group p-6 rounded-3xl bg-gradient-to-br ${gradient} border border-border/50 hover:border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up cursor-default`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-2xl bg-background/60 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}
