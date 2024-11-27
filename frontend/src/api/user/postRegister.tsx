import { AxiosResponse } from 'axios'

import { SuccessResponse } from '../../interfaces/Interfaces'
import { possgAxios } from '../axiosInstance'

export const register = async (
  email: string,
  password: string,
  nickname: string,
  university: string,
  major: string,
  secondMajor: string,
  period: number,
  semesterOff: boolean,
  job: string,
  tags: string[],
): Promise<AxiosResponse<SuccessResponse> | null> => {
  const response = await possgAxios.post('members/signup', {
    email,
    password,
    nickname,
    university,
    major,
    secondMajor,
    period,
    semesterOff,
    job,
    tags,
  })
  return response
}
