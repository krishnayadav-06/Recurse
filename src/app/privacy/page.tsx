import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-12 transition-colors">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <header className="border-b border-border-light pb-8 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted">Last updated: June 28, 2026</p>
        </header>

        <div className="text-muted leading-relaxed space-y-6 text-sm">
          <p>
            At Recurse, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our website.
          </p>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">1. Information We Collect</h2>
            <p>
              For our early-access waitlist, we only collect your email address when you voluntarily submit it to request early access. We do not collect any other personal information at this stage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">2. How We Use Your Information</h2>
            <p>
              We use your email address solely to notify you when Recurse is launched or when major updates are available. We will never sell, rent, or distribute your email address to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect the email addresses we collect. However, no database transmission over the internet can be guaranteed to be 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">4. Updates to This Policy</h2>
            <p>
              We may update this policy from time to time. If we make material changes, we will notify you by updating the "Last updated" date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:hello@recurse.com" className="text-ink hover:underline">
                hello@recurse.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
