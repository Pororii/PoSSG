import { AxiosResponse } from 'axios'
import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 직무추천 반환
export const getRecommend = async (
  token: string,
): Promise<AxiosResponse<SuccessResponse, any> | null> => {
  const response = await possgAxios.get('community/recommend', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
