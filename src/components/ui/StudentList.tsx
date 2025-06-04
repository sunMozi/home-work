import type { NameEntry } from "../sections/HomeWork";

interface StudentListProps {
	names: NameEntry[];
	calledNames: string[];
	updateWeight: (name: string, newWeight: number) => void;
}

export const StudentList = ({
	names,
	calledNames,
	updateWeight,
}: StudentListProps) => (
	<div className="bg-gray-50 p-4 rounded-lg">
		<h3 className="text-gray-700 font-bold mb-3">全体学生名单</h3>
		<div className="grid grid-cols-6 gap-2">
			{names.map((entry, index) => (
				<div
					key={index}
					className={`p-2 text-center text-sm rounded transition-colors ${
						calledNames.includes(entry.name)
							? "bg-purple-100 text-purple-800"
							: "bg-gray-100 text-gray-700"
					}`}
				>
					{entry.name}
					<input
						type="number"
						min={0}
						value={entry.weight}
						onChange={(e) => {
							const newWeight = Math.max(parseInt(e.target.value, 10) || 0, 0);
							updateWeight(entry.name, newWeight);
						}}
						className="block text-xs mt-1 opacity-75 w-full text-center p-1 border rounded"
					/>
				</div>
			))}
		</div>
	</div>
);
