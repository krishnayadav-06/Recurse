import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-12 transition-colors">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <header className="border-b border-border-light pb-8 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink mb-2">Terms of Service</h1>
          <p className="text-sm text-muted">Last updated: June 28, 2026</p>
        </header>

        <div className="text-muted leading-relaxed space-y-6 text-sm">
          <p>
            By accessing or using Recurse, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">1. Waitlist Sign-up</h2>
            <p>
              Signing up for the Recurse waitlist does not guarantee access to the product or any specific features. Early access will be granted on a rolling basis at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">2. Intellectual Property</h2>
            <p>
              All content, design, and software associated with Recurse are the intellectual property of Recurse. You may not copy, modify, or distribute any part of the site without our express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">3. Disclaimer of Warranties</h2>
            <p>
              Recurse is provided "as is" and "as available," without any warranties of any kind, express or implied. We do not guarantee that the site or services will be error-free or uninterrupted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">4. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Recurse shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-ink mt-8 mb-4">5. Contact</h2>
            <p>
              If you have any questions regarding these Terms, please contact us at{' '}
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
