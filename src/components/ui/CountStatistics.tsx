import React, { useState, useMemo } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
} from "recharts";

interface NameEntry {
	name: string;
	count: number;
}

interface CountStatisticsProps {
	names: NameEntry[];
}

const PAGE_SIZE = 20;

export const CountStatistics = React.memo(({ names }: CountStatisticsProps) => {
	const [page, setPage] = useState(1);

	// 过滤和排序
	const filteredData = useMemo(() => {
		return names
			.filter((entry) => entry.count > 0)
			.sort((a, b) => b.count - a.count);
	}, [names]);

	// 当前页数据
	const pagedData = useMemo(() => {
		const start = (page - 1) * PAGE_SIZE;
		return filteredData.slice(start, start + PAGE_SIZE);
	}, [filteredData, page]);

	if (filteredData.length === 0) {
		return (
			<div className="bg-green-50 p-4 rounded-lg text-gray-500 text-center">
				暂无统计
			</div>
		);
	}

	const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

	return (
		<div className="bg-green-50 p-4 rounded-lg">
			<h3 className="text-green-600 font-bold mb-4">点名统计</h3>
			<ResponsiveContainer
				width="100%"
				height={200}
			>
				<BarChart
					data={pagedData}
					margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
					barCategoryGap="20%"
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="name"
						tick={{ fontSize: 12 }}
					/>
					<YAxis allowDecimals={false} />
					<Tooltip />
					<Bar
						dataKey="count"
						fill="#22c55e"
					/>
				</BarChart>
			</ResponsiveContainer>

			{/* 分页控件 */}
			<div className="flex justify-center mt-3 space-x-4">
				<button
					className="px-3 py-1 bg-green-200 rounded disabled:opacity-50"
					disabled={page === 1}
					onClick={() => setPage(page - 1)}
				>
					上一页
				</button>
				<span className="text-green-700">
					{page} / {totalPages}
				</span>
				<button
					className="px-3 py-1 bg-green-200 rounded disabled:opacity-50"
					disabled={page === totalPages}
					onClick={() => setPage(page + 1)}
				>
					下一页
				</button>
			</div>
		</div>
	);
});
