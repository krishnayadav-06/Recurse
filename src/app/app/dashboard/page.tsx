import { PageHeader } from './components/PageHeader';
import { StatRow } from './components/StatRow';
import { ActivityContainer } from './components/ActivityContainer';
import { BreakdownPanel } from './components/BreakdownPanel';
import { RecentActivity } from './components/RecentActivity';
import { UserDropdown } from '../../../components/UserDropdown';
import { Footer } from '../../../components/landing/Footer';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Shell nav */}
      <header className="sticky top-0 z-[60] h-14 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-gray-900 cursor-pointer">
            Recurse
          </Link>
          <nav className="hidden md:flex gap-4">
            <Link href="/app/dashboard" className="text-sm text-gray-900 font-medium cursor-pointer">
              Dashboard
            </Link>
            <Link href="/app/queue" className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
              Queue
            </Link>
            <Link href="/app/problems" className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">
              Problems
            </Link>
          </nav>
        </div>
        <UserDropdown />
      </header>

      {/* Page content */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <PageHeader />

        <div className="py-6 border-y border-gray-200 mb-6">
          <StatRow />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityContainer />
            <RecentActivity />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <BreakdownPanel />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
