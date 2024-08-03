import { AxiosResponse } from 'axios'

import { Users } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const users = async (): Promise<AxiosResponse<Users> | null> => {
  const response = await possgAxios.get('members/list')
  return response
}
