import React, { useState } from 'react';
import {
    BarChartOutlined,
    ScheduleOutlined,

} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;




type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('대시보드', '/', <BarChartOutlined />, [
    getItem('일별 시간 분포', '/dashboard1'),
    getItem('카테고리별 추이', '/dashboard2')
  ]),
  getItem('일정 추가', '/addtime', <ScheduleOutlined />,),
];




const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();

  // menu 누르면 navigate
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if(e.key.startsWith("/")){
      navigate(e.key);
    }
  }

  // 로그인·회원가입 버튼 클릭 시,
  const handleMemberClick = () => {
    navigate("/login")
  }

  // 로그아웃 버튼 클릭 시,
    const handleLogoutClick = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('accessToken');
    alert("로그아웃 되었습니다.");
    navigate("/login")
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={handleMenuClick}/>
      </Sider>
      <Layout>
        <Header style={{ padding:"0 16px", background: colorBgContainer, display: "flex", justifyContent: "flex-end", alignItems: "center"}}>

          {sessionStorage.getItem("isLoggedIn") !== "true" ? (
            <Button onClick={handleMemberClick}>
              로그인·회원가입
            </Button>
            ) : (
              <Button onClick={handleLogoutClick}>
                로그아웃
              </Button>
            )
          }


        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;