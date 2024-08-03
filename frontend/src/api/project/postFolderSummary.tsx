import { AxiosResponse } from 'axios'
import { MyFolder2, FolderPortfolio } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 폴더별 포트폴리오 생성 및 반환
export const getFolderPortfolio = async (
  token: string,
  folder: MyFolder2,
): Promise<AxiosResponse<FolderPortfolio, any> | null> => {
  const response = await possgAxios.post('community/folder-portfolio', folder, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
