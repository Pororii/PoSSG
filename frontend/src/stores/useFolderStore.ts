import create from 'zustand'

import { MyFolder } from '../interfaces/Interfaces'

interface FolderState {
  folderInfo: MyFolder | null
  setFolderInfo: (folderInfo: MyFolder | null) => void
}

export const useFolderStore = create<FolderState>(set => ({
  folderInfo: null,
  setFolderInfo: folderInfo => set({ folderInfo }),
}))
