import Link from 'next/link'

import Container from './container'

import Button from '../shared/button'
import ThemeToggle from '../shared/theme-toggle'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-black/80">
      <Container className="flex items-center justify-between py-4">
        <Link
          href="/"
          className="text-xl font-bold"
        >
          Its Yetesikaso
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/marketplace">
            Marketplace
          </Link>

          <Link href="/jobs">
            Jobs
          </Link>

          <Link href="/profile">
            Profile
          </Link>

          <Link href="/login">
            Login
          </Link>

          <Link href="/register">
            Register
          </Link>

          <ThemeToggle />

          <Button>
            Post Listing
          </Button>
        </nav>
      </Container>
    </header>
  )
}