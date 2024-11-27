import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const postCheckEmailNumber = async (
  email: string,
  number: string,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post('members/check-email-number', {
    email,
    number,
  })
  return response
}
