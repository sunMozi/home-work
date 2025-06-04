import { useEffect } from "react";

interface LayoutProps {
	title: string;
	children: React.ReactNode;
}

export const Layout = ({ title, children }: LayoutProps) => {
	useEffect(() => {
		document.title = title;
	}, [title]);
	return (
		<>
			<main className="">{children}</main>
		</>
	);
};
