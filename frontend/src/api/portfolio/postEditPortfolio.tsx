import { AxiosResponse } from 'axios'

import { MyPortfolio, SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 내 포트폴리오 수정
export const editPortfolio = async (
  token: string,
  portfolio: MyPortfolio,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post(
    'portfolio/edit-portfolio',
    portfolio,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response
}
