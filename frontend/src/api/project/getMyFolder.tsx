import { AxiosResponse } from 'axios'

import { MySectors } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 내 폴더 정보 반환
export const getMyFolder = async (
  token: string,
): Promise<AxiosResponse<MySectors> | null> => {
  const response = await possgAxios.get('project/folder', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
