import { AxiosResponse } from 'axios'
import { MyFolder2, MyFolderDetail } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 내 폴더 별 자료 정보 반환
export const getMyProjectFiles = async (
  token: string,
  folder: MyFolder2,
): Promise<AxiosResponse<MyFolderDetail, any> | null> => {
  const response = await possgAxios.post('community/files', folder, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
