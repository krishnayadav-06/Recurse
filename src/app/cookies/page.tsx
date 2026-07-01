import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-12 transition-colors">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <header className="border-b border-border-light pb-8 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink mb-2">Cookies Policy</h1>
          <p className="text-sm text-muted">Last updated: June 28, 2026</p>
        </header>

        <div className="text-muted leading-relaxed space-y-6 text-sm">
          <p>
            This Cookies Policy explains how Recurse uses cookies and similar technologies to recognize you when you visit our website.
          </p>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">1. What Are Cookies?</h2>
            <p>
              Cookies are small data files placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide reporting information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">2. Cookies We Use</h2>
            <p>
              Currently, Recurse only uses essential security cookies required by our database provider (Supabase) to handle database client communication. We do not use any third-party advertising or tracking cookies on this waitlist site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">3. Managing Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings. If you block all cookies, some parts of our site may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">4. More Information</h2>
            <p>
              For more information about how we protect your data, please see our{' '}
              <Link href="/privacy" className="text-ink hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
