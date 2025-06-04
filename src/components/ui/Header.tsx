import type { NameEntry } from "../../components/sections/HomeWork";

interface HeaderProps {
	names: NameEntry[];
}

export const Header = ({ names }: HeaderProps) => (
	<div className="text-center mb-8">
		<h1 className="text-3xl font-bold text-gray-800">课堂随机点名系统</h1>
		<p className="text-gray-600 mt-2">当前人数: {names.length}</p>
	</div>
);
