"use client";

import { useState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TeklifPro</h1>
          <p className="mt-2 text-sm text-slate-400">İş Yönetim Sistemi</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <h2 className="mb-6 text-lg font-semibold text-white">Giriş Yap</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <Input
              label="E-posta"
              name="email"
              type="email"
              required
              className="border-slate-600 bg-slate-700 text-white"
            />
            <Input
              label="Şifre"
              name="password"
              type="password"
              required
              className="border-slate-600 bg-slate-700 text-white"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
