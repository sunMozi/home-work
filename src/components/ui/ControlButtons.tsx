interface ControlButtonsProps {
	isRunning: boolean;
	namesLength: number;
	startRandomSelect: () => void;
	stopRandomSelect: () => void;
	resetCalledNames: () => void;
}

export const ControlButtons = ({
	isRunning,
	namesLength,
	startRandomSelect,
	stopRandomSelect,
	resetCalledNames,
}: ControlButtonsProps) => (
	<div className="flex justify-center gap-4 mb-8">
		{!isRunning ? (
			<button
				className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
				onClick={startRandomSelect}
				disabled={namesLength === 0}
			>
				开始
			</button>
		) : (
			<button
				className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
				onClick={stopRandomSelect}
			>
				停止
			</button>
		)}
		<button
			onClick={resetCalledNames}
			className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
		>
			重置
		</button>
	</div>
);
