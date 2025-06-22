import React, { useEffect, useState } from 'react';
import { Calendar, Spin, message, Typography, Modal, List, Select } from 'antd';
import { Pie, Bar, Line, Scatter, Column } from '@ant-design/charts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { gettimelog } from '../../api/timechartApi';

const { Title } = Typography;

// 데이터를 날짜별로 구분하기 위해,
interface TimeLogData {

  category: string;
  duration: number;
}

interface GroupedData {
  [date: string]: TimeLogData[];
}

export default function DashboardMainPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // 한달치 데이터 저장되는 곳
  const [monthlyData, setMonthlyData] = useState<GroupedData>({});
  // 현재 날짜, 시간
  const [currentDate, setCurrentDate] = useState(() => dayjs());

  // 모달 관련 
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 모달에서 선택된 날짜의 데이터
  const [selectedDayData, setSelectedDayData] = useState<TimeLogData[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [chartType, setChartType] = useState('pie'); // 선택된 차트 종류를 관리하는 state

  // API에서 받아온 데이터를 날짜별로 그룹화하는 함수
  const processData = (data: any[]): GroupedData => {
    if (!data || data.length === 0) {
      return {};
    }
    
    return data.reduce((acc, item) => {
      const date = item.log_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({ category: item.category, duration: parseFloat(item.duration) });
      return acc;
    }, {} as GroupedData);
  };

  // 컴포넌트 마운트 또는 월 변경 시 데이터를 불러오는 useEffect
  useEffect(() => {
    const userIdStr = sessionStorage.getItem('userId');
    if (!userIdStr) {
      message.error('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    const userId = parseInt(userIdStr, 10);
    const yearMonth = currentDate.format('YYYY-MM');

    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await gettimelog(userId, yearMonth);
        const processed = processData(data);
        setMonthlyData(processed);
      } catch (error) {
        console.error("데이터 조회 실패:", error);
        message.error('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate, navigate]); // currentDate가 바뀌면 다시 데이터를 불러옴

  // 캘린더의 각 날짜 셀을 렌더링하는 함수
  const dateCellRender = (value: Dayjs) => {
    const dateString = value.format('YYYY-MM-DD');
    const dayData = monthlyData[dateString];

    if (!dayData || dayData.length === 0) {
      return null;
    }

    // 시간을 많이 사용한 순으로 정렬하여 상위 2개 항목 추출
    const topActivities = [...dayData]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 3);

    return (
      <List
        size="small"
        dataSource={topActivities}
        renderItem={(item, index) => (
          <List.Item style={{ padding: '0 4px', border: 'none' }}>
            <Typography.Text ellipsis={true} style={{ fontSize: '12px' }}>
              <span style={{ color: '#8c8c8c' }}>{index + 1}.</span> {item.category}: {item.duration}h
            </Typography.Text>
          </List.Item>
        )}
      />
    );
  };

  // 날짜 셀 클릭 시 모달을 여는 핸들러
  const handleSelect = (date: Dayjs) => {
    const dateString = date.format('YYYY-MM-DD');
    const dataForDay = monthlyData[dateString];

    if (dataForDay && dataForDay.length > 0) {

      setSelectedDate(date);
      setSelectedDayData(dataForDay);
      setChartType('pie'); // 모달을 열 때 항상 기본 차트(파이)로 초기화
      setIsModalOpen(true);
    }
  };

  // 사용자가 캘린더의 월/년을 변경했을 때 호출되는 함수
  const onPanelChange = (value: Dayjs) => {
    setCurrentDate(value);
  };

  // 1. 파이 차트 설정
  const pieConfig = {
    appendPadding: 10,
    data: selectedDayData || [],
    angleField: 'duration',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'inner' as const,
      offset: '-50%',
      content: ({ percent }: any) => `${(percent * 100).toFixed(0)}%`,
      style: {
        textAlign: 'center' as const,
        fontSize: 14,
        fill: '#fff',
      },
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    legend: {
      position: 'right' as const,
      offsetX: -20,
    },
  };

  // 2. 세로 막대(Column) 차트 설정
  const columnConfig = {
    data: selectedDayData || [],
    xField: 'category',
    yField: 'duration',
    // seriesField: 'category',
    // legend: false, // 카테고리가 x축에 이미 표시되므로 범례는 숨김
  };

  // 3. 선(Line) 차트 설정
  const lineConfig = {
    data: selectedDayData || [],
    xField: 'category',
    yField: 'duration',
    point: { size: 5 },
  };

  // 4. 분산형(Scatter) 차트 설정
  const scatterConfig = {
    data: selectedDayData || [],
    xField: 'category',
    yField: 'duration',
    colorField: 'category',
    size: 8,
    shape: 'circle',
  };

  // 선택된 차트 타입에 따라 해당 차트를 렌더링하는 함수
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Column {...columnConfig} />;
      case 'line':
        return <Line {...lineConfig} />;
      case 'scatter':
        return <Scatter {...scatterConfig} />;
      default: // 'pie'
        return <Pie {...pieConfig} />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
        일간 활동 현황
      </Title>
      <Spin spinning={loading}>
        <Calendar
          dateCellRender={dateCellRender}
          onPanelChange={onPanelChange}
          onSelect={handleSelect}
        />
      </Spin>
      {selectedDayData && (
        <Modal
          title={selectedDate ? `${selectedDate.format('YYYY년 MM월 DD일')} 활동 내역` : '활동 내역'}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={700}
          destroyOnClose={true} // 모달이 닫힐 때 내부 컴포넌트들(차트)을 unmount
        >
          <Select
            value={chartType}
            style={{ width: 140, marginBottom: '20px' }}
            onChange={(value) => setChartType(value)}
            options={[
              { value: 'pie', label: '파이 차트' },
              { value: 'bar', label: '막대 차트' },
              { value: 'line', label: '선 차트' },
              { value: 'scatter', label: '분산형 차트' },
            ]}
          />
          <div style={{ height: '400px' }}>
            {renderChart()}
          </div>
        </Modal>
      )}
    </div>
  );
}
