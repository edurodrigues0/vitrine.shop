"use client";

import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

interface ChartProps {
	type: "line" | "bar" | "pie";
	data: Array<Record<string, unknown>>;
	dataKey: string;
	nameKey?: string;
	colors?: string[];
	height?: number;
	showLegend?: boolean;
	showGrid?: boolean;
}

const DEFAULT_COLORS = [
	"hsl(var(--primary))",
	"hsl(var(--secondary))",
	"#8884d8",
	"#82ca9d",
	"#ffc658",
	"#ff7300",
	"#8dd1e1",
];

export function Chart({
	type,
	data,
	dataKey,
	nameKey = "name",
	colors = DEFAULT_COLORS,
	height = 300,
	showLegend = true,
	showGrid = true,
}: ChartProps) {
	const renderChart = () => {
		switch (type) {
			case "line":
				return (
					<LineChart data={data}>
						{showGrid && <CartesianGrid strokeDasharray="3 3" />}
						<XAxis dataKey={nameKey} />
						<YAxis />
						<Tooltip />
						{showLegend && <Legend />}
						<Line
							type="monotone"
							dataKey={dataKey}
							stroke={colors[0]}
							strokeWidth={2}
							dot={{ r: 4 }}
						/>
					</LineChart>
				);

			case "bar":
				return (
					<BarChart data={data}>
						{showGrid && <CartesianGrid strokeDasharray="3 3" />}
						<XAxis dataKey={nameKey} />
						<YAxis />
						<Tooltip />
						{showLegend && <Legend />}
						<Bar dataKey={dataKey} fill={colors[0]} />
					</BarChart>
				);

			case "pie":
				return (
					<PieChart>
						<Pie
							data={data}
							dataKey={dataKey}
							nameKey={nameKey}
							cx="50%"
							cy="50%"
							outerRadius={80}
							label
						>
							{data.map((_, index) => (
								<Cell
									key={`cell-${index}`}
									fill={colors[index % colors.length]}
								/>
							))}
						</Pie>
						<Tooltip />
						{showLegend && <Legend />}
					</PieChart>
				);

			default:
				return null;
		}
	};

	return (
		<div style={{ width: "100%", height }}>
			<ResponsiveContainer width="100%" height="100%">
				{renderChart()}
			</ResponsiveContainer>
		</div>
	);
}

