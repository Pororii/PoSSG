import create from 'zustand'

import { MyFolder } from '../interfaces/Interfaces'

interface FolderState {
  selectedFolder: MyFolder | null
  setSelectedFolder: (folder: MyFolder | null) => void
}

export const useFolderStore = create<FolderState>(set => ({
  selectedFolder: null,
  setSelectedFolder: folder => set({ selectedFolder: folder }),
}))
