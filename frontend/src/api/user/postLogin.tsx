import { AxiosResponse } from 'axios'
import { LoginResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const login = async (
  email: string,
  password: string,
): Promise<AxiosResponse<LoginResponse, any> | null> => {
  const response = await possgAxios.post('members/login', {
    email,
    password,
  })
  return response
}
