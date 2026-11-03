import { useState } from "react";
import { useRouter } from "@/lib/nav";
import Link from "@/components/app-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authAPI, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authAPI.register({ email, password, fullName });
      signIn(token, user);
      router.push("/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Could not create your account."));
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
            <CardTitle>Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already registered?{" "}
              <Link href="/login" className="text-ember hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
