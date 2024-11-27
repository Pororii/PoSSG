import { AxiosResponse } from 'axios'

import { MyFolderDetail2, SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 자료 삭제
export const deleteFile = async (
  token: string,
  fileData: MyFolderDetail2,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post('project/file-remove', fileData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
