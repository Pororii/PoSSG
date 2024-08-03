import { AxiosResponse } from 'axios'
import { MyPortfolio } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 내 포트폴리오 반환
export const getPortfolio = async (
  token: string,
): Promise<AxiosResponse<MyPortfolio, any> | null> => {
  const response = await possgAxios.get('community/total-portfolio', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
