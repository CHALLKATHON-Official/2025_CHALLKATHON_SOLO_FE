
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd'
import Title from 'antd/es/typography/Title'
import React, { useEffect, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { memberLogin } from '../../api/timechartApi';


export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
      //  로그인 되어 있으면 접근 X
      if (sessionStorage.getItem('isLoggedIn') === 'true') {
          navigate('/'); 
      }
    }, [])

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  // 로그인 버튼 클릭 시
    const handleLogin = () => {
        if (!username.trim() || !password.trim()) {
            alert("아이디와 비밀번호를 모두 입력해주세요.");
            return; 
        }

        memberLogin(username, password)
            .then((num) => {
                if(num !== -1){ // 로그인 실패시 백에서 -1 반환
                    alert("로그인 되었습니다.")
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('userId', num); 
                    navigate('/');
                }
                else{
                    alert("아이디 또는 비밀번호를 확인해주세요. ")
                }
            })
            .catch((err) => {
                console.log("memberLogin 실패: ", err);
                alert("서버 오류로 로그인 실패했습니다.")
            })
    };

    // 비밀번호 입력 필드에서 Enter 키 누를 때 로그인 클릭
    const handlePasswordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

return (
    <>
    <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '30px' }}>
        <Title level={2}>
            타임 차트 로그인
        </Title>
    </div>

    {/* 로그인 폼 영역 */}
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
                // Enter 키 이벤트 핸들러 추가
                onKeyDown={handlePasswordKeyDown} 
            />
        </div>

        {/* 로그인 버튼 */}
        <div style={{ width: '100%', marginTop: '10px' }}>
            <Button
                type="primary"
                onClick={handleLogin}
                style={{ width: '100%' }}
                size="large"
            >
                로그인
            </Button>
        </div>

        {/* 회원가입, 아이디/비밀번호 찾기 */}
        <div style={{ width: '100%', textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
            <Space split={<span style={{ margin: '0 8px', color: '#ccc' }}>|</span>} style={{ fontSize: '0.9em' }}>
                <Link to="/signup" style={{ color: '#1677ff' }}>
                    회원가입
                </Link>
                {/* <Link to="/findid" style={{ color: '#1677ff' }}>
                    아이디 찾기
                </Link>
                <Link to="/findpassword" style={{ color: '#1677ff' }}>
                    비밀번호 찾기
                </Link> */}
                {/* ------------------- */}
            </Space>
        </div>
    </div>
    </>
)
}
