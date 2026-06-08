import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import LoginModal from '@/components/LoginModal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'טולמנס — מערכת הזמנות',
  description: 'מערכת הזמנות והצעות מחיר טולמנס',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <LoginModal />
        <Navbar />
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </body>
    </html>
  )
}
