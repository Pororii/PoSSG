import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const postMemo = async (
  token: string,
  memo: string,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post(
    'project/memo',
    { memo },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response
}
