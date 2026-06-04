'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { useCartStore } from '@/store/cart'

export default function Navbar() {
  const pathname = usePathname()
  const { user, clearUser } = useUserStore()
  const cartCount = useCartStore((s) => s.items.length)

  const navLinks = [
    { href: '/', label: 'הזמנות' },
    { href: '/inventory', label: 'מלאי' },
  ]

  return (
    <header className="bg-black text-white h-14 flex items-center px-6 sticky top-0 z-40">
      <div className="flex items-center gap-8 w-full">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-white font-black text-lg tracking-widest uppercase">
            TOLLMAN&apos;S
          </span>
          <span
            className="text-black font-black text-xs px-2 py-0.5 rounded-full leading-5"
            style={{ background: '#F5E000' }}
          >
            B2B
          </span>
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-white/20" />

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-[#F5E000] text-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Cart indicator */}
        {cartCount > 0 && (
          <Link
            href="/order/new"
            className="flex items-center gap-2 bg-[#F5E000] text-black px-3 py-1.5 rounded text-sm font-bold hover:bg-[#e8d400] transition-colors"
          >
            <span>עגלה</span>
            <span className="bg-black text-[#F5E000] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </Link>
        )}

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-white text-sm font-semibold leading-tight">{user.agentName}</div>
              <div className="text-white/40 text-xs leading-tight">{user.branchCode} · {user.branchName}</div>
            </div>
            <button
              onClick={clearUser}
              className="text-white/40 hover:text-white text-xs px-2.5 py-1.5 rounded border border-white/20 hover:border-white/50 transition-colors"
              title="החלף משתמש"
            >
              החלף
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
