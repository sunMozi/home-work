import type { ReactNode } from "react";

interface StatisticsPanelProps {
	children: ReactNode;
}

export const StatisticsPanel = ({ children }: StatisticsPanelProps) => (
	<div className="grid grid-cols-2 gap-6 mb-8">{children}</div>
);
