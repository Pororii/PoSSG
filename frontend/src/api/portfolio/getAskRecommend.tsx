import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 직무추천 요청
export const getAskRecommend = async (
  token: string,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.get('community/ask-recommend', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
