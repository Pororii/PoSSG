import create from 'zustand'

import { PortfolioItem } from '../interfaces/Interfaces'

interface PortfolioState {
  portfolio: PortfolioItem[]
  setPortfolio: (portfolio: PortfolioItem[]) => void
  updatePortfolioItem: (updatedItem: PortfolioItem) => void
}

export const usePortfolioStore = create<PortfolioState>(set => ({
  portfolio: [],
  setPortfolio: portfolio => set({ portfolio }),
  updatePortfolioItem: updatedItem =>
    set(state => ({
      portfolio: state.portfolio.map(item =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    })),
}))
