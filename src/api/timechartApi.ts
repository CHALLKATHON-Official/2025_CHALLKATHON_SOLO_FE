import axios from "axios";

// const API_SERVER_URL = "http://localhost:8080";
const API_SERVER_URL = "http://3.34.199.180:8080";

// -------------------------- 회원 관련 --------------------------
interface MemberRegisterDto{
    email: string;
    password: string;
    nickname: string;
}

// 회원가입
export const memberRegister = async(memberRegisterDto: MemberRegisterDto) => {
    const res = await axios.post(`${API_SERVER_URL}/api/v1/auth/join`, memberRegisterDto)
    return res.data;
}



// // 로그인 get 간단 버전
// export const memberLogin = async(userId: string, userPw: string) => {
//     const res = await axios.get(`${API_SERVER_URL}/user/login`, {params: {userId, userPw}});
//     return res.data;
// }


// 로그인 post 버전

interface MemberLoginDto{
    email: string;
    password: string;
}

export const memberLogin = async(memberLoginDto: MemberLoginDto) => {
    const res = await axios.post(`${API_SERVER_URL}/api/v1/auth/login`, memberLoginDto)
    return res.data;
}



//--------- 일정 관련 (TIMELOG Table) --------- 

// 1. 월별 일정 조회
export const gettimelog = async(year: number, month: string, accessToken: string) => {
    const res = await axios.get(`${API_SERVER_URL}/api/v1/schedule`, {
        params: {year, month},
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    return res.data;
}


// 2. 일정 추가
interface TimelogInsertDto{
    category: string;
    hour: number;
    minutes: number;
}


export const insertTimelog = async(timelogInsertDto: TimelogInsertDto, accessToken: string) => {
    const res = await axios.post(`${API_SERVER_URL}/api/v1/schedule`, timelogInsertDto,
        {headers: {
            Authorization: `Bearer ${accessToken}`
        }}
    )
    return res.data;
}



// delete 예시
// export const deleteEx = async(id: number, source: string) => {
//     const res = await axios.delete(`${API_SERVER_URL}/deleteEx`, {params: {id, source}});
//     return res.data;
// }

// put 예시
// export const changeEx = async(memberLoginDto: MemberLoginDto) => {
//     const res = await axios.put(`${API_SERVER_URL}/changeEx`, memberLoginDto)
//     return res.data;
// }



