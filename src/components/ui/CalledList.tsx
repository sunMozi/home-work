interface CalledListProps {
	calledNames: string[];
}

export const CalledList = ({ calledNames }: CalledListProps) => (
	<div className="bg-blue-50 w-full p-5 rounded-lg shadow-md max-w-md mx-auto">
		<h3 className="text-blue-700 font-semibold text-lg mb-4 border-b border-blue-200 pb-2">
			已点名单
		</h3>
		<div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-48">
			{calledNames.length === 0 ? (
				<span className="text-gray-400 text-center col-span-2">暂无记录</span>
			) : (
				calledNames.map((name, index) => (
					<div
						key={index}
						className="bg-white shadow-sm rounded-md px-4 py-2 text-blue-900 text-center text-sm font-medium truncate
                       transition-colors duration-200 hover:bg-blue-100 cursor-default"
						title={name}
					>
						{name}
					</div>
				))
			)}
		</div>
	</div>
);
