'use client'
import { useState } from 'react'
import { MOCK_AGENTS } from '@/mock/agents'
import { BRANCHES } from '@/mock/warehouses'
import { useUserStore } from '@/store/user'

export default function LoginModal() {
  const { user, setUser } = useUserStore()
  const [agentId, setAgentId] = useState('')
  const [branchCode, setBranchCode] = useState('')
  const [error, setError] = useState('')

  if (user) return null

  const handleLogin = () => {
    if (!agentId || !branchCode) { setError('יש לבחור סוכן וסניף'); return }
    const agent = MOCK_AGENTS.find((a) => a.id === agentId)
    const branch = BRANCHES.find((b) => b.code === branchCode)
    if (!agent || !branch) return
    setUser({ agentId: agent.id, agentName: agent.name, branchCode: branch.code, branchName: branch.name })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl">

        {/* Header — Tollmans style */}
        <div className="bg-black px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-white font-black text-xl tracking-widest uppercase">TOLLMAN&apos;S</span>
            <span className="text-black font-black text-xs px-2 py-0.5 rounded-full" style={{ background: '#F5E000' }}>
              B2B
            </span>
          </div>
          <p className="text-white/50 text-xs mt-1 tracking-wide">מערכת הזמנות פנימית</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7 space-y-4">
          <div>
            <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wide">סוכן</label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full border-2 border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
            >
              <option value="">בחר סוכן...</option>
              {MOCK_AGENTS.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wide">סניף</label>
            <select
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="w-full border-2 border-[#E0E0E0] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-black transition-colors"
            >
              <option value="">בחר סניף...</option>
              {BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>{b.code} — {b.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full font-black text-sm uppercase tracking-wider py-3 rounded-lg transition-colors mt-2"
            style={{ background: '#F5E000', color: '#000' }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#e8d400' }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#F5E000' }}
          >
            כניסה למערכת
          </button>
        </div>
      </div>
    </div>
  )
}
