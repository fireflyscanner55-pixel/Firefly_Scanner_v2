import type {
    CombinedChartPoint,
    LineChartPoint,
    ResultCardData,
    TestResult,
    MonthlyBarChartPoint,
    MonthlyAreaChartPoint,
    RadarChartPoint,
    PolarChartPoint,
    ImpressionData,
} from "@/types/dashboard";

export const resultCards: ResultCardData[] = [
  {
    id: "alpha",
    title: "Alpha",
    color: "#3b82c4",
    data: [
      { value: 15 },
      { value: 12 },
      { value: 42 },
      { value: 82 },
      { value: 88 },
      { value: 88 },
      { value: 88 },
      { value: 88 },
    ],
  },
  {
    id: "beta",
    title: "Beta",
    color: "#e33131",
    data: [
      { value: 88 },
      { value: 88 },
      { value: 88 },
      { value: 88 },
      { value: 84 },
      { value: 79 },
      { value: 79 },
      { value: 78 },
    ],
  },
  {
    id: "gamma",
    title: "Gamma",
    color: "#16a02b",
    data: [
      { value: 20 },
      { value: 21 },
      { value: 23 },
      { value: 28 },
      { value: 38 },
      { value: 60 },
      { value: 74 },
      { value: 78 },
    ],
  },
];

export const testResults: TestResult[] = [
  {
    physical: "Alpha Rays",
    data: 108,
  },
  {
    physical: "Beta Rays",
    data: 81,
  },
  {
    physical: "Gamma Rays",
    data: 110,
  },
  {
    physical: "Cesium 92",
    data: "Unstable",
  },
  {
    physical: "Presence of Unstability Cesium",
    data: 44,
  },
  {
    physical: "Iridium 238",
    data: "Unstable",
  },
  {
    physical: "Presence of Unstability Iridium",
    data: 68,
  },
  {
    physical: "Uranium 241",
    data: 21,
  },
  {
    physical: "Presence of Unstability Uranium",
    data: "Unstable",
  },
  {
    physical: "Plutonium 241",
    data: 86,
  },
  {
    physical: "Presence of Unstability Plutonium",
    data: 94,
  },
  {
    physical: "Americium 210",
    data: "Unstable",
  },
  {
    physical: "Presence of Unstability Americium",
    data: 58,
  },
  {
    physical: "Polonium 152",
    data: "Unstable",
  },
  {
    physical: "Presence of Unstability Polonium",
    data: 14,
  },
];

export const combinedChartData: CombinedChartPoint[] = [
  {
    label: "0",
    alpha: 20,
    beta: 25,
    gamma: 55,
  },
  {
    label: "25",
    alpha: 28,
    beta: 30,
    gamma: 48,
  },
  {
    label: "50",
    alpha: 40,
    beta: 35,
    gamma: 42,
  },
  {
    label: "75",
    alpha: 95,
    beta: 40,
    gamma: 45,
  },
  {
    label: "100",
    alpha: 25,
    beta: 35,
    gamma: 48,
  },
  {
    label: "125",
    alpha: 45,
    beta: 28,
    gamma: 50,
  },
  {
    label: "150",
    alpha: 42,
    beta: 30,
    gamma: 48,
  },
  {
    label: "175",
    alpha: 35,
    beta: 40,
    gamma: 44,
  },
  {
    label: "200",
    alpha: 30,
    beta: 55,
    gamma: 42,
  },
];

export const lineChartData: LineChartPoint[] = [
  {
    label: "0",
    alpha: 180,
    beta: 130,
    gamma: 70,
  },
  {
    label: "50",
    alpha: 160,
    beta: 100,
    gamma: 40,
  },
  {
    label: "100",
    alpha: 140,
    beta: 30,
    gamma: 180,
  },
  {
    label: "150",
    alpha: 200,
    beta: 90,
    gamma: 40,
  },
  {
    label: "200",
    alpha: 160,
    beta: 110,
    gamma: 120,
  },
  {
    label: "250",
    alpha: 50,
    beta: 170,
    gamma: 140,
  },
];

export const monthlyBarChartData: MonthlyBarChartPoint[] = [
  {
    month: "Jan",
    value: 110,
  },
  {
    month: "Feb",
    value: 160,
  },
  {
    month: "Mar",
    value: 140,
  },
  {
    month: "Apr",
    value: 175,
  },
  {
    month: "May",
    value: 185,
  },
  {
    month: "Jun",
    value: 130,
  },
];

export const monthlyAreaChartData: MonthlyAreaChartPoint[] = [
  {
    month: "Jan",
    value: 30,
  },
  {
    month: "Feb",
    value: 45,
  },
  {
    month: "Mar",
    value: 70,
  },
  {
    month: "Apr",
    value: 55,
  },
  {
    month: "May",
    value: 90,
  },
  {
    month: "Jun",
    value: 65,
  },
];

export const radarChartData: RadarChartPoint[] = [
  {
    subject: "Alpha",
    value: 85,
  },
  {
    subject: "Beta",
    value: 60,
  },
  {
    subject: "Gamma",
    value: 75,
  },
  {
    subject: "Cesium",
    value: 45,
  },
  {
    subject: "Iridium",
    value: 65,
  },
  {
    subject: "Uranium",
    value: 90,
  },
];

export const polarChartData: PolarChartPoint[] = [
  {
    name: "Alpha",
    value: 75,
  },
  {
    name: "Beta",
    value: 55,
  },
  {
    name: "Gamma",
    value: 90,
  },
  {
    name: "Cesium",
    value: 65,
  },
  {
    name: "Iridium",
    value: 45,
  },
  {
    name: "Uranium",
    value: 80,
  },
];

export const impressionData: ImpressionData = {
  title: "Impression",

  items: [
    {
      id: "overall-analysis",
      title: "Overall Analysis",
      description:
        "The test results indicate measurable levels of radioactive activity across the analysed samples. All recorded values should be evaluated against the thresholds configured for this analysis.",
    },
    {
      id: "alpha-beta-gamma",
      title: "Alpha, Beta and Gamma Radiation",
      description:
        "The recorded Alpha, Beta and Gamma measurements show varying levels of activity. The distribution and trend patterns are represented in the charts above for further analysis.",
    },
    {
      id: "radioisotope-analysis",
      title: "Radioisotope Analysis",
      description:
        "The analysis includes observations relating to Cesium, Iridium, Uranium, Plutonium, Americium and Polonium based on the configured test parameters.",
        
      },
    {
      id: "recommended-action",
      title: "Recommended Action",
      description:
        "Further technical review is recommended where values exceed the configured thresholds or where unstable isotope conditions are identified.",       
      },
  ],
};