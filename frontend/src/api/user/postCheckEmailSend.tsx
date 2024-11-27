import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const postCheckEmailSend = async (
  email: string,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post('members/check-email-send', { email })
  return response
}
