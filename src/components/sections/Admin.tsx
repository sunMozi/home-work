import React, { useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import { Table, MessagePlugin } from 'tdesign-react';

interface Student {
  rollCallStatus: ReactNode;
  id: number;
  name: string;
  weight: number;
  count: number;
  description: string | null;
  updateTime: string;
  createTime: string;
}

interface StudentApiResponse {
  code: number;
  message: string;
  data: {
    rows: Student[];
    total: number;
  };
}

export const Admin: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get<StudentApiResponse>(
        'http://localhost:8888/student/list?page=1&size=10'
      );
      if (res.data.code === 200) {
        setStudents(res.data.data.rows);
        console.log('✅ 获取学生列表成功:', res.data.data);
      } else {
        throw new Error('服务返回异常');
      }
    } catch (error) {
      console.warn('⚠️ 网络请求失败，尝试加载本地数据', error);
      // 加载本地数据（public 目录下）
      try {
        const localRes = await axios.get<StudentApiResponse>(
          '/local-students.json'
        );
        setStudents(localRes.data.data.rows);
        MessagePlugin.info('已加载本地学生数据（网络异常降级）');
      } catch (localError) {
        console.error('❌ 本地数据加载失败', localError);
        MessagePlugin.error('学生数据加载失败');
      }
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const columns = [
    { colKey: 'id', title: '学号', width: 80 },
    { colKey: 'name', title: '姓名', width: 150 },
    { colKey: 'weight', title: '权重', width: 100 },
    { colKey: 'count', title: '次数', width: 100 },
    { colKey: 'description', title: '备注', width: 200 },
    { colKey: 'updateTime', title: '更新时间', width: 180 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">学生点名统计</h1>
        <Table
          bordered
          stripe
          hover
          lazy-load
          columns={columns}
          data={students}
          rowKey="id"
          size="medium"
        />
      </div>
    </div>
  );
};
