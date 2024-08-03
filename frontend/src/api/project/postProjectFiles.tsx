import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 자료 업로드
export const uploadProjectFiles = async (
  token: string,
  formData: FormData,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post('community/upload', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })
  return response
}
