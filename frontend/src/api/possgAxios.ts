import axios, { AxiosResponse, isAxiosError } from "axios";
import { EmailResponse, Folder, LoginResponse, User, Users, SuccessResponse, MyFolderDetail, MyFolderDetail2, MySectors, MyFolder2, FolderPortfolio, MyPortfolio} from "../interfaces/Interfaces";


const possgAxios = axios.create({
baseURL: "http://35.192.203.252:8000/api",
});

// 회원가입
export const register = async (
    email : string,
    password : string,
    nickname : string
): Promise<AxiosResponse<SuccessResponse, any> | null> => {
    try {
        const response = await possgAxios.post(
            "members/signup",
            {
                email,
                password,
                nickname,
            }
        );
        return response;
    } catch (error) {
        if(isAxiosError<SuccessResponse>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 로그인
export const login = async (
    email : string,
    password : string
): Promise<AxiosResponse<LoginResponse, any> | null> => {
    try {
        const response = await possgAxios.post(
            "members/login",
            {
                email,
                password,
            }
        );
        return response;
    } catch (error) {
        if(isAxiosError<LoginResponse>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 이메일 중복확인
export const checkEmail = async (
    email : string
): Promise<AxiosResponse<EmailResponse, any> | null> => {
    try {
        const response = await possgAxios.post(
            "members/check-email",
            { email }
        );
        return response;
    } catch (error) {
        if(isAxiosError<EmailResponse>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 회원정보 전체 반환
export const users = async (
): Promise<AxiosResponse<Users, any> | null> => {
    try {
        const response = await possgAxios.get(
            "members/list"
        );
        return response;
    } catch (error) {
        if(isAxiosError<Users>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 내 정보 반환
export const user = async (
    token: string
): Promise<AxiosResponse<User, any> | null> => {
    try {
        const response = await possgAxios.get(
            "members/member",
            { headers: { Authorization: `Bearer ${token}` }}
        );
        return response;
    } catch (error) {
        if(isAxiosError<User>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 폴더 생성(0), 수정(1), 삭제(2)
export const manageFolder = async (
    token: string,
    folderData: Folder
): Promise<AxiosResponse<SuccessResponse, any> | null> => {
    try {
        const response = await possgAxios.post(
            "community/create",
            folderData,
            { headers: { Authorization: `Bearer ${token}` }},
        );
        return response;
    } catch (error) {
        if(isAxiosError<SuccessResponse>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 썸네일 업로드
export const uploadThumbnail = async (
    token: string,
    formData: FormData
): Promise<AxiosResponse<SuccessResponse, any> | null> => {
    try {
        const response = await possgAxios.post(
            "community/thumbnail-upload",
            formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        if(isAxiosError<SuccessResponse>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 내 폴더 정보 반환
export const getMyFolder = async (
    token: string
): Promise<AxiosResponse<MySectors, any> | null> => {
    try {
        const response = await possgAxios.get(
            "community/folder",
            { headers: { Authorization: `Bearer ${token}` }}
        );
        return response;
    } catch (error) {
        if(isAxiosError<MySectors>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 자료 업로드
export const uploadProjectFiles = async (
    token: string,
    formData: FormData
): Promise<AxiosResponse<SuccessResponse, any> | null> => {
    try {
        const response = await possgAxios.post(
            "community/upload",
            formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        if(isAxiosError<SuccessResponse>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 내 폴더 별 자료 정보 반환
export const getMyProjectFiles = async (
    token: string,
    folder: MyFolder2
): Promise<AxiosResponse<MyFolderDetail, any> | null> => {
    try {
        const response = await possgAxios.post(
            "community/files",
            folder,
            { headers: { Authorization: `Bearer ${token}` }}
        );
        return response;
    } catch (error) {
        if(isAxiosError<MyFolderDetail>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 자료 삭제
export const deleteFile = async (
    token: string,
    fileData: MyFolderDetail2
): Promise<AxiosResponse<SuccessResponse, any> | null> => {
    try {
        const response = await possgAxios.post(
            "community/file-remove",
            fileData,
            { headers: { Authorization: `Bearer ${token}` }},
        );
        return response;
    } catch (error) {
        if(isAxiosError<SuccessResponse>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 폴더별 포트폴리오 생성 및 반환
export const getFolderPortfolio = async (
    token: string,
    folder: MyFolder2
): Promise<AxiosResponse<FolderPortfolio, any> | null> => {
        const response = await possgAxios.post(
            "community/folder-portfolio",
            folder,
            { headers: { Authorization: `Bearer ${token}` }},
        );
        return response;
    
};

// 내 포트폴리오 생성
export const makePortfolio = async (
    token: string,
): Promise<AxiosResponse<MyPortfolio, any> | null> => {
    try {
        const response = await possgAxios.get(
            "community/make-portfolio",
            { headers: { Authorization: `Bearer ${token}` }},
        );
        return response;
    } catch (error) {
        if(isAxiosError<MyPortfolio>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 내 포트폴리오 반환
export const getPortfolio = async (
    token: string,
): Promise<AxiosResponse<MyPortfolio, any> | null> => {
    try {
        const response = await possgAxios.get(
            "community/total-portfolio",
            { headers: { Authorization: `Bearer ${token}` }},
        );
        return response;
    } catch (error) {
        if(isAxiosError<MyPortfolio>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};

// 직무추천
export const getRecommend = async (
    token: string,
): Promise<AxiosResponse<SuccessResponse, any> | null> => {
    try {
        const response = await possgAxios.get(
            "community/recommend",
            { headers: { Authorization: `Bearer ${token}` }},
        );
        return response;
    } catch (error) {
        if(isAxiosError<SuccessResponse>(error)) {
            console.log(`Error: ${error.response?.status} ${error.message}`);
            return null;
        } else {
            return null;
        }
    }
};