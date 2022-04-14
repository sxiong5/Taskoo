import React, { forwardRef, RefObject, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { PieChart, PieSeriesOption } from 'echarts/charts';
import {
	GraphicComponent,
	GraphicComponentOption,
	TooltipComponent,
	TooltipComponentOption,
	LegendComponent,
	LegendComponentOption
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { Box, SxProps } from '@mui/material';

interface ChartProps {
	option: Option;
	height?: string;
	width?: string;
	sx?: SxProps;
}
export type Option = echarts.ComposeOption<
	GraphicComponentOption | PieSeriesOption | TooltipComponentOption | LegendComponentOption
>;

const Chart: React.ForwardRefRenderFunction<RefObject<HTMLElement>, ChartProps> = (
	{ option, sx, height = '100%', width = '100%' },
	ref
) => {
	const chartRef = useRef<HTMLDivElement>(null);

	useImperativeHandle(ref, () => ({ current: chartRef.current }));

	let chart: echarts.ECharts;
	useLayoutEffect(() => {
		const resize = () => {
			chart?.resize();
		};

		if (!chart) {
			chart = echarts.init(chartRef.current!);
			chartRef.current?.addEventListener('resize', resize);
		}
		chart.setOption(option);

		return () => {
			chartRef.current?.removeEventListener('resize', resize);
			echarts.dispose(chart);
		};
	}, [option]);

	return <Box sx={{ ...sx, width, height }} ref={chartRef}></Box>;
};

echarts.use([
	GraphicComponent,
	CanvasRenderer,
	PieChart,
	TooltipComponent,
	LegendComponent,
	LabelLayout,
	UniversalTransition
]);

export default forwardRef(Chart);
