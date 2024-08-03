import { AxiosResponse } from 'axios'

import { MyPortfolio } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 내 포트폴리오 생성
export const makePortfolio = async (
  token: string,
): Promise<AxiosResponse<MyPortfolio> | null> => {
  const response = await possgAxios.get('community/make-portfolio', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
