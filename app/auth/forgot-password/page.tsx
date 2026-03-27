"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="p-4">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {sent ? (
          <Card className="w-full max-w-md border-0 shadow-xl shadow-primary/5 text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center">
                <Mail className="h-7 w-7 text-success-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                <CardDescription className="mt-2">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to set a new password. The link expires in 1 hour.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">Return to login</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md border-0 shadow-xl shadow-primary/5">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Mail className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
                <CardDescription className="mt-2">
                  Enter your email and we&apos;ll send you a reset link.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <FieldGroup>
                  <Field>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </Field>
                </FieldGroup>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
