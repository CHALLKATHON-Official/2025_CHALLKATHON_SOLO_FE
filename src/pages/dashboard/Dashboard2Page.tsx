import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { gettimelog } from '../../api/timechartApi';
import { Typography, Select, Card, Row, Col, Space, Spin, Alert, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;


interface TimeLogEntry {
  duration: number;
  date: string;
  category: string;
}

type ChartType = 'column' | 'line' | 'scatter' | 'pie';

const CATEGORIES = ["공부/일", "수면", "운동", "여가", "기타"];
const CHART_TYPES: { value: ChartType, label: string }[] = [
  { value: 'column', label: '막대 그래프' },
  { value: 'line', label: '선 그래프' },
  { value: 'scatter', label: '산점도' },
  { value: 'pie', label: '파이 그래프' },
];

const CATEGORY_COLORS: { [key: string]: string } = {
  "공부/일": "#8884d8",
  "수면": "#82ca9d",
  "운동": "#ffc658",
  "여가": "#ff8042",
  "기타": "#a4de6c",
};

// --- 컴포넌트 ---

const Dashboard2Page = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('column');
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 날짜 기준
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  useEffect(() => {
    


    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userAccessToken = sessionStorage.getItem('accessToken') ?? '';
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');

        const response = await gettimelog(year, month, userAccessToken);
        if (response.isSuccess) {
          setTimeLogs(response.data);
        } else {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        if (err instanceof Error) {
            setError(`데이터 로딩 중 오류가 발생했습니다: ${err.message}`);
        } else {
            setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate]);

  // 1. 차트 데이터를 가공 (선택된 카테고리 기준)
  const chartData = useMemo(() => {
    return timeLogs
      .filter(log => log.category === selectedCategory)
      .map(log => ({
        date: log.date.substring(5), // 'MM-DD' 형식으로 표시
        time: log.duration,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [timeLogs, selectedCategory]);

  // 2. 카테고리별 총 시간 계산
  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    CATEGORIES.forEach(cat => totals[cat] = 0);

    timeLogs.forEach(log => {
      if (totals[log.category] !== undefined) {
        totals[log.category] += log.duration;
      }
    });
    return totals;
  }, [timeLogs]);

  // 3. 카테고리별 평균 시간 계산
  const categoryAverages = useMemo(() => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const averages: { [key: string]: number } = {};
    for (const category in categoryTotals) {
      averages[category] = categoryTotals[category] / daysInMonth;
    }
    return averages;
  }, [categoryTotals, currentDate]);

  // Pie 차트를 위한 데이터
  const pieChartData = useMemo(() => {
      return Object.entries(categoryTotals)
        .filter(([, total]) => total > 0) // 시간이 0인 카테고리는 제외
        .map(([name, value]) => ({ name, value }));
  }, [categoryTotals]);

  // 모든 차트에서 일관된 모양을 보여주기 위한 커스텀 툴팁 함수
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // 페이로드에서 y축(time)에 해당하는 데이터를 찾습니다.
      const dataPoint = payload.find(p => p.dataKey === 'time');

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
    if (selectedChartType === 'pie') {
      return (
        <PieChart>
          <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label>
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(1)} 시간`} />
          <Legend />
        </PieChart>
      );
    }

    // 다른 차트들은 동일한 데이터 구조를 사용
    const ChartComponent = {
      column: BarChart,
      line: LineChart,
      scatter: ScatterChart,
    }[selectedChartType];

    const ChartElement = {
      column: <Bar dataKey="time" fill="#8884d8" name="시간" />,
      line: <Line type="monotone" dataKey="time" stroke="#8884d8" name="시간" />,
      scatter: <Scatter name="시간" dataKey="time" fill="#8884d8" />,
    }[selectedChartType];

    return (
      <ChartComponent data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: '시간 (h)', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={renderCustomTooltip} />
        <Legend />
        {ChartElement}
      </ChartComponent>
    );
  };

  if (error) return <div style={{ padding: '24px' }}><Alert message="오류" description={error} type="error" showIcon /></div>;

  return (
    <Spin spinning={loading} tip="데이터를 불러오는 중..." size="large">
        <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
            <Button shape="circle" icon={<LeftOutlined />} onClick={handlePrevMonth} />
            <Title level={2} style={{ margin: '0 24px', minWidth: '350px', textAlign: 'center' }}>
                {`${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`}
            </Title>
            <Button shape="circle" icon={<RightOutlined />} onClick={handleNextMonth} />
        </div>

        {/* Section 1: Chart (100% width) */}
        <Card title={<Title level={3}>시간 추이 그래프</Title>}>
            <Space wrap style={{ marginBottom: '20px' }}>
                <Text>카테고리:</Text>
                <Select
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                    style={{ width: 120 }}
                />
                <Text>차트 종류:</Text>
                <Select
                    value={selectedChartType}
                    onChange={setSelectedChartType}
                    options={CHART_TYPES}
                    style={{ width: 120 }}
                />
            </Space>
            <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                {renderChart()}
            </ResponsiveContainer>
            </div>
        </Card>

        {/* Section 2: Summary Cards (below chart) */}
        <section style={{ marginTop: '40px' }}>
            <Title level={3} style={{ marginBottom: '20px' }}>월간 요약</Title>
            <Row gutter={[24, 24]}>
            {/* Left: Total Time (50%) */}
            <Col xs={24} lg={12}>
                <Card title={<Title level={4}>카테고리별 총 시간</Title>}>
                    <Row gutter={[16, 16]}>
                        {Object.entries(categoryTotals).map(([category, total]) => (
                            <Col xs={12} sm={8} key={category}>
                                <Card size="small" style={{ textAlign: 'center', height: '100%' }}>
                                    <Text style={{ color: CATEGORY_COLORS[category], fontWeight: 'bold' }}>{category}</Text>
                                    <Title level={5} style={{ marginTop: '8px', marginBottom: 0 }}>{total.toFixed(1)} 시간</Title>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
            </Col>
            {/* Right: Average Time (50%) */}
            <Col xs={24} lg={12}>
                <Card title={<Title level={4}>카테고리별 일 평균 시간</Title>}>
                    <Row gutter={[16, 16]}>
                        {Object.entries(categoryAverages).map(([category, avg]) => (
                            <Col xs={12} sm={8} key={category}>
                                <Card size="small" style={{ textAlign: 'center', height: '100%' }}>
                                    <Text style={{ color: CATEGORY_COLORS[category], fontWeight: 'bold' }}>{category}</Text>
                                    <Title level={5} style={{ marginTop: '8px', marginBottom: 0 }}>{avg.toFixed(1)} 시간</Title>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
            </Col>
            </Row>
        </section>
        </div>
    </Spin>
  );
};

export default Dashboard2Page;
