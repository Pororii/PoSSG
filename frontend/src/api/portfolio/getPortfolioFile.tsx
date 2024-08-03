import { AxiosResponse } from 'axios'
import { MyPortfolioFile } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 내 포트폴리오 파일 반환
export const getPortfolioFile = async (
  token: string,
): Promise<AxiosResponse<MyPortfolioFile, any> | null> => {
  const response = await possgAxios.get('community/portfolio-download', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
