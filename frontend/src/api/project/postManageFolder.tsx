import { AxiosResponse } from 'axios'

import { Folder, SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 폴더 생성(0), 수정(1), 삭제(2)
export const manageFolder = async (
  token: string,
  folderData: Folder,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post('project/create', folderData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
