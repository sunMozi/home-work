import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Container } from '../../shared/Container';
import { Header } from '../ui/Header';
import { NameDisplay } from '../ui/NameDisplay';
import { ControlButtons } from '../ui/ControlButtons';
import { StatisticsPanel } from '../ui/StatisticsPanel';
import { StudentList } from '../ui/StudentList';
import { CalledList } from '../ui/CalledList';
import { CountStatistics } from '../ui/CountStatistics';

export interface NameEntry {
  name: string;
  weight: number;
  number: number;
  count: number;
}

interface Student {
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
  data: Student[];
}

interface StatisticsApiResponse {
  code: number;
  message: string;
  data: Record<string, number>;
}

const RANDOM_INTERVAL = 10;
const MIN_WEIGHT = 0;

export const HomeWork = () => {
  const [names, setNames] = useState<NameEntry[]>([]);
  const [selectedName, setSelectedName] = useState<string>('');
  const [calledNames, setCalledNames] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 加载学生列表
  const getStudentList = useCallback(async () => {
    try {
      const response = await axios.get<StudentApiResponse>(
        'http://localhost:8080/student'
      );
      if (response.data.code !== 1) {
        console.warn('获取学生列表失败:', response.data.message);
        return;
      }

      const parsedNames: NameEntry[] = response.data.data.map((student) => ({
        name: student.name.trim(),
        number: student.id,
        weight: Math.max(student.weight || 0, 0),
        count: student.count ?? 0,
      }));

      setNames(parsedNames);
    } catch (error) {
      console.error('获取学生列表异常:', error);
    }
  }, []);

  // 加载点名统计
  const getStatistics = useCallback(async () => {
    try {
      const response = await axios.get<StatisticsApiResponse>(
        'http://localhost:8080/student/statistics'
      );
      if (response.data.code !== 1) {
        console.warn('获取点名统计失败:', response.data.message);
        return;
      }

      const counts = response.data.data;

      setNames((prevNames) =>
        prevNames.map((entry) => ({
          ...entry,
          count: counts[entry.name] ?? entry.count,
        }))
      );
    } catch (error) {
      console.error('获取点名统计异常:', error);
    }
  }, []);

  // 获取加权名单
  const getWeightedList = useCallback(() => {
    return names.flatMap((entry) =>
      entry.weight >= MIN_WEIGHT ? Array(entry.weight).fill(entry) : []
    );
  }, [names]);

  // 开始随机点名
  const startRandomSelect = useCallback(() => {
    const weightedList = getWeightedList();
    if (weightedList.length === 0) {
      alert('请先设置有效权重(至少一个权重≥1)');
      return;
    }

    setIsRunning(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setNames((prevNames) => {
        const newWeightedList = prevNames.flatMap((entry) =>
          entry.weight >= MIN_WEIGHT ? Array(entry.weight).fill(entry) : []
        );
        const randomIndex = Math.floor(Math.random() * newWeightedList.length);
        const selectedEntry = newWeightedList[randomIndex];
        if (selectedEntry) {
          setSelectedName(selectedEntry.name);
          audioRef.current?.play().catch(console.error);
        }
        return prevNames;
      });
    }, RANDOM_INTERVAL);
  }, [getWeightedList]);

  // 停止点名并同步后端
  const stopRandomSelect = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    audioRef.current?.pause();

    setNames((prev) =>
      prev.map((entry) =>
        entry.name === selectedName
          ? { ...entry, count: entry.count + 1 }
          : entry
      )
    );

    setCalledNames((prev) =>
      selectedName && !prev.includes(selectedName)
        ? [...prev, selectedName]
        : prev
    );

    // 同步后端点名次数
    const selectedStudent = names.find((entry) => entry.name === selectedName);
    if (selectedStudent) {
      axios
        .put(`http://localhost:8080/student/addCount`, null, {
          params: { id: selectedStudent.number },
        })
        .then(() => {
          console.log(`点名次数已同步更新: ${selectedStudent.name}`);
        })
        .catch((error) => {
          console.error('同步点名次数失败:', error);
        });
    }
  }, [names, selectedName]);

  // 重置点名记录
  const resetCalledNames = useCallback(() => {
    setSelectedName('');
    setCalledNames([]);
  }, []);

  // 更新权重
  const updateWeight = useCallback((name: string, newWeight: number) => {
    setNames((prev) =>
      prev.map((item) =>
        item.name === name ? { ...item, weight: newWeight } : item
      )
    );
  }, []);

  // 初始化
  useEffect(() => {
    getStudentList();
    getStatistics();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [getStudentList, getStatistics]);

  // 初始化音频资源
  useEffect(() => {
    // audioRef.current = new Audio("/tick-sound.mp3");
  }, []);

  return (
    <section className="bg-gray-100  min-h-screen flex flex-col items-center py-4">
      <Container>
        <Header names={names} />

        <NameDisplay selectedName={selectedName} isRunning={isRunning} />

        <ControlButtons
          isRunning={isRunning}
          namesLength={names.length}
          startRandomSelect={startRandomSelect}
          stopRandomSelect={stopRandomSelect}
          resetCalledNames={resetCalledNames}
        />

        <StatisticsPanel>
          <CalledList calledNames={calledNames} />
          <CountStatistics names={names} />
        </StatisticsPanel>

        <StudentList
          names={names}
          calledNames={calledNames}
          updateWeight={updateWeight}
        />
      </Container>
    </section>
  );
};
