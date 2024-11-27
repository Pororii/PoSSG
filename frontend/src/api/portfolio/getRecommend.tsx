import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 직무추천 반환
export const getRecommend = async (
  token: string,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.get('portfolio/recommend', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
