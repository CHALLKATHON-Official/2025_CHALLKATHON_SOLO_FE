import React, { useEffect, useState } from 'react';
import { Button, Input, Select, Space, Form, message, Typography, DatePicker } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { insertTimelog } from '../../api/timechartApi'; 

    const { Title } = Typography;

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
    const [schedules, setSchedules] = useState<ScheduleEntry[]>([
        { id: Date.now(), category: '', hour: 0, minutes: 0 }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const userLoggedIn = sessionStorage.getItem('isLoggedIn');
        const userAccessToken = sessionStorage.getItem('accessToken');
        if (!userLoggedIn || !userAccessToken) {
        message.error('로그인이 필요한 서비스입니다.');
        navigate('/login');
        }
    }, [navigate]);

    const handleAddScheduleRow = () => {
        setSchedules([...schedules, { id: Date.now(), category: '', hour: 0, minutes: 0 }]);
    };

    const handleRemoveScheduleRow = (id: number) => {
        setSchedules(schedules.filter(schedule => schedule.id !== id));
    };

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

    const isValid = schedules.every(s => s.category.trim() !== '' && s.hour >= 0 && s.hour <= 23 && s.minutes >= 0 && s.minutes <= 59);
    if (!isValid) {
        message.error('모든 항목을 올바르게 입력해주세요.');
        setLoading(false);
        return;
    }

    // 일정 추가 요청 배열 생성
    const promises = schedules.map(schedule => {
        const timelogDto: TimelogInsertDto = {
        category: schedule.category.trim(),
        hour: schedule.hour,
        minutes: schedule.minutes,
        };
        return insertTimelog(timelogDto, accessToken);
    });

    Promise.all(promises)
        .then(results => {
        // 모든 호출이 성공했을 때 결과 검사
        const allSuccess = results.every(res => res.isSuccess);

        if (allSuccess) {
            message.success(`${results.length}개의 일정이 성공적으로 추가되었습니다.`);
            navigate('/');
        } else {
            // 하나라도 실패한 경우
            message.error('일정 추가 중 오류가 발생했습니다.');
        }
        })
        .catch(err => {
        console.error('일정 추가 실패:', err);
        message.error('서버 오류로 일정 추가에 실패했습니다.');
        })
        .finally(() => {
        setLoading(false);
        });
    };


    const hourOptions = Array.from({ length: 24 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));
    const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ value: i, label: String(i).padStart(2, '0') }));

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>
            새로운 일정 추가
        </Title>

        <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="날짜">
            <DatePicker defaultValue={dayjs()} disabled />
            </Form.Item>

            {/** 기존 코드 중 schedules.map 부분만 수정 **/}
    {schedules.map((schedule, index) => (
    <Space
        key={schedule.id}
        style={{ display: 'flex', marginBottom: 8 }}
        align="center"  // end -> center 로 변경
    >
        <Form.Item
        label={index === 0 ? "카테고리" : ""}
        style={{ flex: 3 }}
        >
        <Input
            placeholder="카테고리 (예: 공부, 운동)"
            value={schedule.category}
            onChange={(e) => handleChange(schedule.id, 'category', e.target.value)}
        />
        </Form.Item>
        <Form.Item
        label={index === 0 ? "시간" : ""}
        style={{ flex: 1 }}
        >
        <Select
            value={schedule.hour}
            onChange={(value) => handleChange(schedule.id, 'hour', value)}
            options={hourOptions}
            placeholder="시"
        />
        </Form.Item>
        <Form.Item
        label={index === 0 ? "분" : ""}
        style={{ flex: 1 }}
        >
        <Select
            value={schedule.minutes}
            onChange={(value) => handleChange(schedule.id, 'minutes', value)}
            options={minuteOptions}
            placeholder="분"
        />
        </Form.Item>
        {schedules.length > 1 && (
        <MinusCircleOutlined
            onClick={() => handleRemoveScheduleRow(schedule.id)}
            style={{ fontSize: 20, cursor: 'pointer', marginLeft: 8 }}
        />
        )}
    </Space>
    ))}


            <Form.Item style={{ marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button type="dashed" onClick={handleAddScheduleRow} icon={<PlusOutlined />}>
                일정 추가
                </Button>
                <Button type="primary" htmlType="submit" loading={loading} size="large">
                일정 저장
                </Button>
            </Space>
            </Form.Item>
        </Form>
        </div>
    );
}
