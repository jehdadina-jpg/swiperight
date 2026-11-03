import { useState } from "react";
import { useRouter } from "@/lib/nav";
import Link from "@/components/app-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await authAPI.login({ email, password });
      signIn(token, user);
      router.push("/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Incorrect email or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="SwipeRight" className="h-9 w-auto mx-auto" />
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/register" className="text-ember hover:underline">
                Create an account
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Accounts are optional - <Link href="/dashboard" className="underline">continue as a guest</Link>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
