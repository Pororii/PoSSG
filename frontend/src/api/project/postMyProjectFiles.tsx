import { AxiosResponse } from 'axios'

import { MyFolder2, MyFolderDetail } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 내 폴더 별 자료 정보 반환
export const getMyProjectFiles = async (
  token: string,
  folder: MyFolder2,
): Promise<AxiosResponse<MyFolderDetail> | null> => {
  const response = await possgAxios.post('project/files', folder, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
