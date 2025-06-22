import { LockOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import Title from 'antd/es/typography/Title'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { memberRegister } from '../../api/timechartApi'

export default function SignupPage() {
    const navigate = useNavigate();

    useEffect(() => {
        //  로그인 되어 있으면 접근 X
        if (sessionStorage.getItem('isLoggedIn') === 'true') {
            alert('이미 로그인 되어 있습니다.');
            navigate('/');
        }
    }, [])


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');


    //  회원가입 버튼 클릭 시
    const handleSignup = () => {
        // --- 유효성 검사 ---
        if (!username.trim() || !password.trim() || !nickname.trim()) {
            alert("아이디, 비밀번호를 포함한 모든 정보를 입력해주세요."); 
            return;
        }
        
        
        const registrationData = {
            userId: username,
            userPw: password,
            nickname: nickname,
        };

    
        memberRegister(registrationData)
            .then((bool) => {
                if(bool){
                    alert("회원가입 되었습니다.");
                    navigate('/login');

                }
                else{
                    alert("이미 존재하는 회원입니다.");
                }
            })
            .catch((err) => {
                console.log("memberRegister 실패: ", err); 
                alert("서버 오류로 회원가입 실패했습니다.");
            })
    };



    return (
        <>
            <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '30px' }}>
                <Title level={2}>
                    타임 차트 회원가입
                </Title>
            </div>

            {/* 회원가입 폼 영역 */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    margin: '0 auto',
                    maxWidth: '400px',
                    padding: '0 20px',
                }}
            >
                {/* 아이디 입력 */}
                <div style={{ marginBottom: '20px', width: '100%' }}>
                    <Input
                        size="large"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value) }}
                        placeholder="아이디"
                        prefix={<UserOutlined />}
                    />
                </div>

                {/* 비밀번호 입력 */}
                <div style={{ marginBottom: '20px', width: '100%' }}>
                    <Input.Password
                        size="large"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value) }}
                        placeholder="비밀번호"
                        prefix={<LockOutlined />}
                        
                    />
                </div>

                {/* 닉네임 입력 */}
                <div style={{ marginBottom: '20px', width: '100%' }}>
                    <Input
                        size="large"
                        value={nickname}
                        onChange={(e) => { setNickname(e.target.value) }}
                        placeholder="닉네임"
                        prefix={<SolutionOutlined />}
                    />
                </div>
                
                {/* -------------------------- */}


                {/* 회원가입 버튼 */}
                <div style={{ width: '100%', marginTop: '10px' }}>
                    <Button
                        type="primary"
                        onClick={handleSignup}
                        style={{ width: '100%' }}
                        size="large"
                    >
                        회원가입
                    </Button>
                </div>

                {/* 로그인 링크 */}
                <div style={{ width: '100%', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                    <Link to="/login" style={{ color: '#1677ff', fontSize: '0.9em' }}>
                        이미 계정이 있으신가요? 로그인
                    </Link>

                </div>
            </div>
        </>
    )
}
