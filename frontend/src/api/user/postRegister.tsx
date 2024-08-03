import { AxiosResponse } from 'axios'
import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const register = async (
  email: string,
  password: string,
  nickname: string,
  job: string,
): Promise<AxiosResponse<SuccessResponse, any> | null> => {
  const response = await possgAxios.post('members/signup', {
    email,
    password,
    nickname,
    job,
  })
  return response
}
