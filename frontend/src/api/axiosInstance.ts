import axios from 'axios'

const url = process.env.REACT_APP_API_URL

if (!url) {
  throw new Error('REACT_APP_API_URL 환경 변수가 설정되지 않았습니다.')
}

export const possgAxios = axios.create({
  baseURL: url,
  withCredentials: true,
})
