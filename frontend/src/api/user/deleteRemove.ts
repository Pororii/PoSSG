import { AxiosResponse } from 'axios'

import { possgAxios } from '../axiosInstance'

interface SuccessResponse {
  message: string
}

export const deleteRemove = async (
  token: string,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.delete('members/remove', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response
}
