import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Agent } from '@/mock/agents'
import type { Branch } from '@/mock/warehouses'

export interface CurrentUser {
  agentId: string
  agentName: string
  branchCode: string
  branchName: string
}

interface UserStore {
  user: CurrentUser | null
  setUser: (user: CurrentUser) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: 'tollmans-user' }
  )
)
