import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  className?: string
}

export default function Button({
  children,
  className = ''
}: ButtonProps) {
  return (
    <button
      className={`rounded-xl bg-lime-400 px-5 py-3 font-medium text-[var(--foreground)] transition hover:bg-lime-300 ${className}`}
    >
      {children}
    </button>
  )
}