export interface SuccessResponse {
  message: string
}

export interface LoginResponse {
  token: string
}

export interface EmailResponse {
  isExist: boolean
}

export interface PasswordResponse {
  isCorrect: boolean
}

export interface EditInfo {
  nickname: string
  job: string
}

export interface User {
  email: string
  nickname: string
  university: string
  major: string
  secondMajor: string
  period: number
  semesterOff: boolean
  job: string
  tags: string[]
}

export interface Users extends Array<User> {}

export interface Sector {
  name: string
  folders: FolderData[]
}

export interface FolderData {
  title: string
  src: string
}

export interface MySectors extends Array<Sector> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any // 추후 수정
}

export interface Folder {
  sector: string
  title: string
  new_title: string
  is_Exist: number
}

export interface MyFolder {
  sector: string
  title: string
  src: string
}

export interface MyFolders extends Array<MyFolder> {}

export interface MyFolder2 {
  sector: string
  title: string
}

export interface MyFolderDetail {
  sector: string
  title: string
  memo: string
  files: FileData[]
}

export interface MyFolderDetail2 {
  sector: string
  title: string
  file_name: string
}

export interface FileData {
  file: File
  src: string
}

export interface FolderPortfolio {
  summary: string
}

export interface portfolioInfo {
  [key: number]: {
    sector: string
    folderName: string
    results: string
  }
}

export interface PortfolioItem {
  id: number
  sector: string
  folderName: string
  subject: string
  content: string
  results: string
  overall: string
}

export interface MyPortfolio extends Array<PortfolioItem> {}

export interface GroupedPortfolio {
  [sector: string]: PortfolioItem[]
}

export interface MyPortfolioFile {
  result: File
}
