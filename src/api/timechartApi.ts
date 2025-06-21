import axios from "axios";

const API_SERVER_URL = "http://localhost:8080";

// -------------------------- 회원 관련 --------------------------
interface MemberRegisterDto{
    userId: string;
    userPw: string;
    nickname: string;
}

// 회원가입
export const memberRegister = async(memberRegisterDto: MemberRegisterDto) => {
    const res = await axios.post(`${API_SERVER_URL}/memberRegister`, memberRegisterDto)
    return res.data;
}



// 로그인 get 간단 버전
export const memberLogin = async(userId: string, userPw: string) => {
    const res = await axios.get(`${API_SERVER_URL}/memberLogin`, {params: {userId, userPw}});
    return res.data;
}


// 로그인 post 버전

// interface MemberLoginDto{
//     userId: string;
//     userPw: string;
// }

// export const memberLogin = async(memberLoginDto: MemberLoginDto) => {
//     const res = await axios.post(`${API_SERVER_URL}/memberLogin`, memberLoginDto)
//     return res.data;
// }



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



