import /*React,*/ { useEffect, useState } from 'react';
import { Button, Select, Form, message, Typography, DatePicker, Row, Col } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { insertTimelog } from '../../api/timechartApi'; 

    const { Title, Text } = Typography;

    interface TimelogInsertDto {
        category: string;
        hour: number;
        minutes: number;
    }

    interface ScheduleEntry {
        id: number; 
        category: string;
        hour: number;
        minutes: number;
    }

    export default function AddTimePage() {
    const navigate = useNavigate();
    
    // 고정된 카테고리 목록
    const categoryNames = ['공부/일', '수면', '운동', '여가', '기타'];

    const [schedules, setSchedules] = useState<ScheduleEntry[]>(
        categoryNames.map((cat, index) => ({
            id: index,
            category: cat,
            hour: 0,
            minutes: 0,
        }))
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userLoggedIn = sessionStorage.getItem('isLoggedIn');
        const userAccessToken = sessionStorage.getItem('accessToken');
        if (!userLoggedIn || !userAccessToken) {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
        }
    }, [navigate]);

    const handleChange = (id: number, field: keyof Omit<ScheduleEntry, 'id'>, value: any) => {
        setSchedules(schedules.map(schedule =>
        schedule.id === id ? { ...schedule, [field]: value } : schedule
        ));
    };

    const handleSubmit = () => {
        setLoading(true);
        const accessToken = sessionStorage.getItem('accessToken');

        if (!accessToken) {
            message.error('인증 토큰이 없습니다. 다시 로그인해주세요.');
            navigate('/login');
            setLoading(false);
            return;
        }

        // 0시간 0분인 항목은 제외하고 실제 저장할 데이터만 필터링
        const logsToSubmit = schedules.filter(s => s.hour > 0 || s.minutes > 0);

        if (logsToSubmit.length === 0) {
            message.warning('저장할 시간이 없습니다. 각 항목에 시간을 입력해주세요.');
            setLoading(false);
            return;
        }

        const promises = logsToSubmit.map(schedule => {
            const timelogDto: TimelogInsertDto = {
            category: schedule.category,
            hour: schedule.hour,
            minutes: schedule.minutes,
            };
            return insertTimelog(timelogDto, accessToken);
        });

        Promise.all(promises)
            .then(results => {
            const allSuccess = results.every(res => res.isSuccess);

            if (allSuccess) {
                message.success(`일정이 성공적으로 저장되었습니다.`);
                navigate('/');
            } else {
                const failedResult = results.find(res => !res.isSuccess);

                if (failedResult) {
                    if (failedResult.message === "이미 일정이 존재합니다.") {
                        alert('오늘의 기록이 이미 존재합니다.');
                    } else {
                        message.error(`일정 추가 중 오류가 발생했습니다: ${failedResult.message || '알 수 없는 오류'}`);
                    }
                } else {
                    message.error('일부 일정 추가 중 오류가 발생했습니다.');
                }
            }
            })
            .catch(err => {
                console.error('일정 추가 실패:', err);
                if (axios.isAxiosError(err) && err.response) {
                    const responseData = err.response.data;
                    if (responseData.message === "이미 일정이 존재합니다.") {
                        alert('오늘의 기록이 이미 존재합니다.');
                    } else {
                        message.error(`서버 오류: ${responseData.message || '알 수 없는 오류가 발생했습니다.'}`);
                    }
                } else {
                    message.error('서버 오류로 일정 추가에 실패했습니다.');
                }
            })
            .finally(() => {
            setLoading(false);
            });
    };


    const hourOptions = Array.from({ length: 24 }, (_, i) => ({ value: i, label: `${i} 시간` }));
    const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ value: i, label: `${i} 분` }));

    return (
        <div style={{ 
            padding: '24px 32px', 
            maxWidth: '600px', 
            margin: '40px auto', 
            border: '1px solid #d9d9d9', 
            borderRadius: '8px' 
        }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>
            기록 추가
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="날짜">
            <DatePicker defaultValue={dayjs()} disabled style={{ width: '30%' }}/>
            </Form.Item>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Text type="secondary">※ 하루에 한 번만 기록을 저장할 수 있습니다.</Text>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {schedules.map((schedule) => (
                <Row key={schedule.id} align="middle" gutter={16}>
                    <Col xs={24} sm={6}>
                        <Text strong style={{ fontSize: '16px' }}>
                            {schedule.category}
                        </Text>
                    </Col>
                    <Col xs={12} sm={9}>
                        <Select
                            value={schedule.hour}
                            onChange={(value) => handleChange(schedule.id, 'hour', value)}
                            options={hourOptions}
                            style={{ width: '70%' }}
                        />
                    </Col>
                    <Col xs={12} sm={9}>
                        <Select
                            value={schedule.minutes}
                            onChange={(value) => handleChange(schedule.id, 'minutes', value)}
                            options={minuteOptions}
                            style={{ width: '70%' }}
                        />
                    </Col>
                </Row>
                ))}
            </div>


            <Form.Item style={{ marginTop: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" htmlType="submit" loading={loading} size="large">
                        저장
                    </Button>
                </div>
            </Form.Item>
        </Form>
        </div>
    );
}
