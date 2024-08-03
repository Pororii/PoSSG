import create from 'zustand'

import { User } from '../interfaces/Interfaces'

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useUserStore = create<UserState>(set => ({
  user: null,
  setUser: user => set({ user }),
}))
