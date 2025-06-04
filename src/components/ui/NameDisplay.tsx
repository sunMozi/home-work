interface NameDisplayProps {
	selectedName: string;
	isRunning: boolean;
}

export const NameDisplay = ({ selectedName, isRunning }: NameDisplayProps) => (
	<div className="bg-white shadow-xl rounded-xl p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
		<div className="relative h-15 mb-8 flex items-center justify-center">
			<div
				className={`text-5xl font-bold transition-all duration-10 ${
					isRunning
						? "text-blue-600 animate-pulse"
						: "text-gray-800 animate-none"
				}`}
			>
				{selectedName || "准备就绪"}
			</div>
		</div>
	</div>
);
