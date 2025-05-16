import { useEffect, useState, useRef, useCallback } from "react";
import { Container } from "../../shared/Container";

interface NameEntry {
	name: string;
	weight: number;
	number: number;
	count: number;
}

const RANDOM_INTERVAL = 10; // 随机选择的时间间隔（毫秒）
const MIN_WEIGHT = 0; // 最小权重值

export const HomeWork = () => {
	// 定义组件状态
	const [names, setNames] = useState<NameEntry[]>([]); // 学生名单
	const [selectedName, setSelectedName] = useState<string>(""); // 当前选中的名字
	const [calledNames, setCalledNames] = useState<string[]>([]); // 已点名的名单
	const [isRunning, setIsRunning] = useState(false); // 是否正在随机选择
	const intervalRef = useRef<number | null>(null); // 定时器引用
	const audioRef = useRef<HTMLAudioElement | null>(null); // 音频引用

	// 从本地存储加载点名次数
	const loadSavedCounts = useCallback(() => {
		try {
			const saved = localStorage.getItem("nameCounts");
			return saved ? JSON.parse(saved) : {};
		} catch (e) {
			console.error("Failed to load counts from localStorage:", e);
			return {};
		}
	}, []);

	// 保存点名次数到本地存储
	const saveCountsToStorage = useCallback((names: NameEntry[]) => {
		try {
			const counts = names.reduce((acc, entry) => {
				acc[entry.name] = entry.count;
				return acc;
			}, {} as Record<string, number>);
			localStorage.setItem("nameCounts", JSON.stringify(counts));
		} catch (e) {
			console.error("保存失败:", e);
		}
	}, []);

	useEffect(() => {
		// 初始化音频文件（如果需要）
		// audioRef.current = new Audio("/tick-sound.mp3");
	}, []);

	// 获取学生名单并解析
	const getStudentList = useCallback(async () => {
		const savedCounts = loadSavedCounts(); // 加载本地存储的点名次数
		const localResponse = await fetch("/names.txt"); // 从文件中获取名单
		const text = await localResponse.text();
		const parsedNames = text.split("\n").map((line) => {
			const [name, numberStr, weightStr] = line.split(",");
			return {
				name: name.trim(),
				number: parseInt(numberStr, 10) || 0,
				weight: Math.max(parseInt(weightStr, 10) || 0, 0),
				count: savedCounts[name.trim()] || 0,
			};
		});
		setNames(parsedNames);
	}, [loadSavedCounts]);

	// 生成带权重的名单
	const getWeightedList = useCallback(() => {
		return names.flatMap((entry) =>
			entry.weight >= MIN_WEIGHT ? Array(entry.weight).fill(entry) : []
		);
	}, [names]);

	// 开始随机选择
	const startRandomSelect = useCallback(() => {
		const weightedList = getWeightedList(); // 获取权重名单
		if (weightedList.length === 0) {
			alert("请先设置有效权重(至少一个权重≥1)");
			return;
		}

		setIsRunning(true); // 设置为运行状态
		if (intervalRef.current) clearInterval(intervalRef.current);

		intervalRef.current = window.setInterval(() => {
			setNames((prevNames) => {
				const newWeightedList = prevNames.flatMap((entry) =>
					entry.weight >= MIN_WEIGHT ? Array(entry.weight).fill(entry) : []
				);
				const randomIndex = Math.floor(Math.random() * newWeightedList.length); // 随机选择
				const selectedEntry = newWeightedList[randomIndex];
				if (selectedEntry) {
					setSelectedName(selectedEntry.name); // 更新选中的名字
					audioRef.current?.play().catch(console.error); // 播放音效
				}
				return prevNames;
			});
		}, RANDOM_INTERVAL);
	}, [getWeightedList]);

	// 停止随机选择
	const stopRandomSelect = useCallback(() => {
		setIsRunning(false); // 停止运行状态
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		audioRef.current?.pause(); // 停止音效

		// 更新点名次数
		setNames((prevNames) =>
			prevNames.map((entry) =>
				entry.name === selectedName
					? { ...entry, count: entry.count + 1 }
					: entry
			)
		);

		// 更新已点名单
		setCalledNames((prev) =>
			selectedName && !prev.includes(selectedName)
				? [...prev, selectedName]
				: prev
		);

		// 保存点名次数到本地存储
		saveCountsToStorage(
			names.map((entry) =>
				entry.name === selectedName
					? { ...entry, count: entry.count + 1 }
					: entry
			)
		);
	}, [names, saveCountsToStorage, selectedName]);

	// 重置已点名单
	const resetCalledNames = useCallback(() => {
		setSelectedName("");
		setCalledNames([]);
	}, []);

	// 清空状态
	const handleClear = useCallback(() => {
		if (!window.confirm("确定要重置吗？")) {
			return;
		}

		setSelectedName("");
		setCalledNames([]);
		setIsRunning(false);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setNames((prev) => prev.map((entry) => ({ ...entry, count: 0 })));

		localStorage.setItem("nameCounts", JSON.stringify({})); // 清空本地存储
	}, []);

	useEffect(() => {
		getStudentList(); // 初始化获取学生名单
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current); // 清理定时器
		};
	}, [getStudentList]);

	return (
		<section className="bg-gray-100 min-h-screen flex flex-col items-center py-8">
			<Container>
				{/* 标题和人数统计 */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800">课堂随机点名系统</h1>
					<p className="text-gray-600 mt-2">当前人数: {names.length}</p>
				</div>

				{/* 主显示区域 */}
				<div className="bg-white shadow-xl rounded-xl p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
					{/* 显示当前选中的名字 */}
					<div className="relative h-48 mb-8 flex items-center justify-center">
						<div
							className={`text-5xl font-bold transition-all duration-10 ${
								isRunning
									? "text-blue-600 animate-pulse"
									: "text-gray-800 animate-none"
							}`}>
							{selectedName || "准备就绪"}
						</div>
					</div>

					{/* 控制按钮 */}
					<div className="flex justify-center gap-4 mb-8">
						{/* 开始/停止按钮 */}
						{!isRunning ? (
							<button
								className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
								onClick={startRandomSelect}
								disabled={names.length === 0}>
								开始
							</button>
						) : (
							<button
								className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
								onClick={stopRandomSelect}>
								停止
							</button>
						)}
						{/* 重置按钮 */}
						<button
							onClick={resetCalledNames}
							className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
							重置已点名单
						</button>
						<button
							className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
							onClick={handleClear}>
							重置
						</button>
					</div>

					{/* 统计信息 */}
					<div className="grid grid-cols-2 gap-6 mb-8">
						{/* 已点名单 */}
						<div className="bg-green-50 p-4 rounded-lg">
							<h3 className="text-blue-600 font-bold mb-2">已点名单</h3>
							<div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-40">
								{/* 显示已点名单 */}
								{calledNames.map((name, index) => (
									<div
										key={index}
										className="bg-blue-100 px-3 py-1 rounded text-blue-800 text-sm text-center truncate">
										{name}
									</div>
								))}
								{/* 如果没有记录 */}
								{calledNames.length === 0 && (
									<span className="text-gray-500 text-sm">暂无记录</span>
								)}
							</div>
						</div>

						{/* 点名统计 */}
						<div className="bg-green-50 p-4 rounded-lg">
							<h3 className="text-green-600 font-bold mb-2">点名统计</h3>
							<div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-40">
								{/* 按点名次数排序并显示 */}
								{names
									.filter((entry) => entry.count > 0)
									.sort((a, b) => b.count - a.count)
									.map((entry, index) => {
										const redIntensity = Math.min(255, entry.count * 20); // 根据次数计算颜色
										const backgroundColor =
											entry.count > 1
												? `rgb(${redIntensity}, ${255 - redIntensity}, ${
														255 - redIntensity
												  })`
												: "rgb(255, 255, 255)";
										return (
											<div
												key={index}
												style={{ backgroundColor }}
												className="px-3 py-1 rounded text-green-800 text-sm">
												{entry.name}: {entry.count}次
											</div>
										);
									})}
								{/* 如果没有统计 */}
								{names.every((entry) => entry.count === 0) && (
									<span className="text-gray-500 text-sm">暂无统计</span>
								)}
							</div>
						</div>
					</div>

					{/* 完整名单 */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h3 className="text-gray-700 font-bold mb-3">全体学生名单</h3>
						<div className="grid grid-cols-6 gap-2">
							{/* 显示所有学生 */}
							{names.map((entry, index) => (
								<div
									key={index}
									className={`p-2 text-center text-sm rounded transition-colors ${
										calledNames.includes(entry.name)
											? "bg-purple-100 text-purple-800"
											: "bg-gray-100 text-gray-700"
									}`}>
									{entry.name}
									{/* 权重输入框 */}
									<input
										type="number"
										min={MIN_WEIGHT}
										value={entry.weight}
										onChange={(e) => {
											const newWeight = Math.max(
												parseInt(e.target.value, 10) || MIN_WEIGHT,
												MIN_WEIGHT
											);
											setNames((prev) =>
												prev.map((item) =>
													item.name === entry.name
														? { ...item, weight: newWeight }
														: item
												)
											);
										}}
										className="block text-xs mt-1 opacity-75 w-full text-center p-1 border rounded"
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
};
