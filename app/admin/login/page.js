"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeafIcon } from "@/components/Icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-leaf-corner px-5">
      <div className="w-full max-w-sm rounded-xl2 border border-gold/20 bg-white p-8 shadow-soft">
        <div className="flex flex-col items-center">
          <span className="badge-stamp flex h-14 w-14 items-center justify-center border-gold/40 bg-maroon text-ivory">
            <LeafIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold text-maroon">Rani's Cook House Admin</h1>
          <p className="text-xs text-muted">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/70">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gold/30 px-4 py-2.5 text-sm outline-none focus:border-maroon"
            />
          </label>

          {error && <p className="text-sm text-terracotta">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-maroon px-8 py-3 text-sm font-semibold text-ivory shadow-soft transition hover:bg-maroon-light disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
