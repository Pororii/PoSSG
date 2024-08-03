import { AxiosResponse } from 'axios'
import { EmailResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const checkEmail = async (
  email: string,
): Promise<AxiosResponse<EmailResponse, any> | null> => {
  const response = await possgAxios.post('members/check-email', { email })
  return response
}
