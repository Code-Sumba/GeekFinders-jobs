import type { Metadata } from "next";
import { Suspense } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in", robots: { index: false, follow: true }, alternates: { canonical: "/login" } };

export default function Login() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="wrap flex h-16 items-center">
        <Wordmark />
      </header>
      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-8 md:items-center md:pt-0">
        <div className="w-full max-w-sm">
          <h1 className="text-h1 font-bold">Log in or sign up</h1>
          <p className="mb-8 mt-1 text-body text-ink-2">No password. Takes 10 seconds.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
