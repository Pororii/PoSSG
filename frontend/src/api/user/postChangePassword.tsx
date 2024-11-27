import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const postChangePassword = async (
  token: string,
  password: string,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post(
    'members/change-password',
    {
      password,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response
}
