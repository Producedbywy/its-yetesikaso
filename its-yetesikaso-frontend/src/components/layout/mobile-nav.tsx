'use client'

import Link from 'next/link'
import {
  Home,
  Search,
  Briefcase,
  User
} from 'lucide-react'

export default function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-white md:hidden">
      <div className="grid grid-cols-4 py-3">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-xs"
        >
          <Home size={20} />
          Home
        </Link>

        <Link
          href="/marketplace"
          className="flex flex-col items-center gap-1 text-xs"
        >
          <Search size={20} />
          Browse
        </Link>

        <Link
          href="/jobs"
          className="flex flex-col items-center gap-1 text-xs"
        >
          <Briefcase size={20} />
          Jobs
        </Link>

        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 text-xs"
        >
          <User size={20} />
          Profile
        </Link>
      </div>
    </div>
  )
}