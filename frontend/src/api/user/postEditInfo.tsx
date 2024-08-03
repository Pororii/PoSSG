import { AxiosResponse } from 'axios'

import { EditInfo } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const postEditInfo = async (
  token: string,
  nickname: string,
  job: string,
): Promise<AxiosResponse<EditInfo> | null> => {
  const response = await possgAxios.post(
    'members/edit',
    { nickname, job },
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response
}
