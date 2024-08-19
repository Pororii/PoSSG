import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

// 썸네일 업로드
export const uploadThumbnail = async (
  token: string,
  formData: FormData,
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post(
    'community/thumbnail-upload',
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return response
}
