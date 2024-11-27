import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const postResetPassword = async (
  email: string,
  password: string,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post('members/reset-password', {
    email,
    password,
  })
  return response
}
