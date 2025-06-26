import { useEffect, useState } from 'react';
import { Calendar, message, Typography, Modal, List, Select } from 'antd';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { gettimelog } from '../../api/timechartApi';


// 데이터를 날짜별로 구분하기 위해,
interface TimeLogData {
  category: string;
  duration: number;
}

interface GroupedData {
  [date: string]: TimeLogData[];
}

type ChartType = 'column' | 'line' | 'scatter' | 'pie';

const CHART_TYPES: { value: ChartType, label: string }[] = [
  { value: 'pie', label: '파이 그래프' },
  { value: 'column', label: '막대 그래프' },
  { value: 'line', label: '선 그래프' },
  { value: 'scatter', label: '분산형 그래프' },
];

const CATEGORY_COLORS: { [key: string]: string } = {
  "공부/일": "#8884d8",
  "수면": "#82ca9d",
  "운동": "#ffc658",
  "여가": "#ff8042",
  "기타": "#a4de6c",
};

export default function DashboardMainPage() {
  const navigate = useNavigate();
  // 한달치 데이터 저장되는 곳
  const [monthlyData, setMonthlyData] = useState<GroupedData>({});
  // 현재 날짜, 시간
  const [currentDate, setCurrentDate] = useState(() => dayjs());

  // 모달 관련 
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 모달에서 선택된 날짜의 데이터
  const [selectedDayData, setSelectedDayData] = useState<TimeLogData[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [chartType, setChartType] = useState<ChartType>('pie'); // 선택된 차트 종류를 관리하는 state

  // API에서 받아온 데이터를 날짜별로 그룹화하는 함수
  const processData = (data: any[]): GroupedData => {
    if (!data || data.length === 0) {
      return {};
    }
    
    return data.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      // duration을 소수점 첫째 자리에서 잘라내어 저장 
      const duration = parseFloat(item.duration);
      const truncatedDuration = Math.floor(duration * 10) / 10;
      acc[date].push({ category: item.category, duration: truncatedDuration });
      return acc;
    }, {} as GroupedData);
  };

  useEffect(() => {
    const userLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userAccessToken = sessionStorage.getItem('accessToken');
    if (!userLoggedIn || !userAccessToken) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    const year = currentDate.year();
    const month = currentDate.format('MM'); // '01' ~ '12'

    gettimelog(year, month, userAccessToken)
    .then((res) => {
            if (res.isSuccess) {
              const processed = processData(res.data);
              setMonthlyData(processed);
            } else {
              message.error("데이터 로딩에 실패했습니다.");
            }
        })
        .catch((err) => {
            console.error("API 호출 실패: ", err);
            message.error("서버 오류로 데이터 로딩에 실패했습니다.");
        });
  }, [currentDate, navigate]); 

  // 캘린더의 각 날짜 셀을 렌더링
  const dateCellRender = (value: Dayjs) => {
    const dateString = value.format('YYYY-MM-DD');
    const dayData = monthlyData[dateString];

    if (!dayData || dayData.length === 0) {
      return null;
    }

    // 시간을 많이 사용한 순으로 정렬하여 상위 3개 항목 추출
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
              <span style={{ color: '#8c8c8c' }}>{index + 1}.</span> {item.category}: {item.duration.toFixed(1)}h
            </Typography.Text>
          </List.Item>
        )}
      />
    );
  };

  // 날짜 셀 클릭 시 모달
  const handleSelect = (date: Dayjs) => {
    const dateString = date.format('YYYY-MM-DD');
    const dataForDay = monthlyData[dateString];

    if (dataForDay && dataForDay.length > 0) {
      setSelectedDate(date);
      setSelectedDayData(dataForDay);
      setChartType('pie'); 
      setIsModalOpen(true);
    }
  };

  // 사용자가 캘린더의 년/월을 변경했을 때 호출되는 함수
  const onPanelChange = (value: Dayjs) => {
    setCurrentDate(value);
  };

  // 모든 차트에서 일관된 모양
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload.find((p:any) => p.dataKey === 'duration');

      if (dataPoint && typeof dataPoint.value === 'number') {
        return (
          <div className="recharts-default-tooltip" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '4px'
          }}>
            <p className="recharts-tooltip-label" style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
            <ul style={{ listStyle: 'none', padding: '0', margin: '4px 0 0 0' }}>
              <li style={{ color: dataPoint.color || '#8884d8' }}>
                {`${dataPoint.name} : ${dataPoint.value.toFixed(1)} 시간`}
              </li>
            </ul>
          </div>
        );
      }
    }
    return null;
  };

  const renderChart = () => {
    if (!selectedDayData || selectedDayData.length === 0) {
      return <div style={{ textAlign: 'center', color: '#aaa', paddingTop: '50px' }}>표시할 데이터가 없습니다.</div>;
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer>
          <PieChart>
            <Pie data={selectedDayData} dataKey="duration" nameKey="category" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
              {selectedDayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#cccccc'} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)} 시간`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const ChartComponent = {
      column: BarChart,
      line: LineChart,
      scatter: ScatterChart,
    }[chartType];

    const ChartElement = {
      column: <Bar dataKey="duration" name="시간" fill="#8884d8" />,
      line: <Line type="monotone" dataKey="duration" name="시간" stroke="#8884d8" />,
      scatter: <Scatter name="시간" dataKey="duration" fill="#8884d8" />,
    }[chartType];

    return (
      <ResponsiveContainer>
        <ChartComponent data={selectedDayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis label={{ value: '시간 (h)', angle: -90, position: 'insideLeft' }} />
          <Tooltip content={renderCustomTooltip} />
          <Legend />
          {ChartElement}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
        일별 시간 분포
      </Title> */}
      <Calendar
        dateCellRender={dateCellRender}
        onPanelChange={onPanelChange}
        onSelect={handleSelect}
      />
      {selectedDayData && (
        <Modal
          title={selectedDate ? `${selectedDate.format('YYYY년 MM월 DD일')} 활동 내역` : '활동 내역'}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={700}
          destroyOnClose={true} 
        >
          <Select
            value={chartType}
            style={{ width: 140, marginBottom: '20px' }}
            onChange={(value) => setChartType(value as ChartType)}
            options={CHART_TYPES}
          />
          <div style={{ height: '400px' }}>
            {renderChart()}
          </div>
        </Modal>
      )}
    </div>
  );
}
