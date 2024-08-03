import { AxiosResponse } from 'axios'

import { User } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const user = async (
  token: string,
): Promise<AxiosResponse<User> | null> => {
  const response = await possgAxios.get('members/member', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
