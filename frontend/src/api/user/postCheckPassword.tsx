import { AxiosResponse } from 'axios'

import { PasswordResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const postCheckPassword = async (
  token: string,
  password: string,
): Promise<AxiosResponse<PasswordResponse> | null> => {
  const response = await possgAxios.post(
    'members/check-password',
    {
      password,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response
}
