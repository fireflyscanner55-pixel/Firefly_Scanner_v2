export type ChartPoint = {
  value: number;
};

export type ResultCardData = {
  id: string;
  title: string;
  color: string;
  data: ChartPoint[];
};

export type TestResult = {
  physical: string;
  data: number | string;
};

export type CombinedChartPoint = {
  label: string;
  alpha: number;
  beta: number;
  gamma: number;
};

export type LineChartPoint = {
  label: string;
  alpha: number;
  beta: number;
  gamma: number;
};

export type MonthlyBarChartPoint = {
  month: string;
  value: number;
};

export type MonthlyAreaChartPoint = {
  month: string;
  value: number;
};

export type RadarChartPoint = {
  subject: string;
  value: number;
};

export type PolarChartPoint = {
  name: string;
  value: number;
};

export type ImpressionItem = {
  id: string;
  title: string;
  description: string;
};

export type ImpressionData = {
  title: string;
  items: ImpressionItem[];
};