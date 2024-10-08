import { axisBottom, axisLeft, format, scaleLinear, select } from 'd3';
import type { Histogram } from '../api';
import { IntegerFormatter } from '../util';

const DefaultMargin = { top: 10, right: 30, bottom: 20, left: 25 };

export const renderHistogram = ({
  histogramContainer,
  histogramData,
  svgHeight,
  svgWidth,
  userScore,
  margin = DefaultMargin,
  xAxisTickFormat = format('.2s'),
  yAxisTicksCount = 3,
  yAxisTickValues,
  xAxisTickValues,
  xAxisTickCount,
}: {
  histogramContainer: HTMLDivElement;
  histogramData: Histogram;
  svgHeight: number;
  svgWidth: number;
  userScore?: number;
  margin?: typeof DefaultMargin;
  xAxisTickFormat?: (value: number) => string;
  yAxisTicksCount?: number;
  yAxisTickValues?: number[];
  xAxisTickValues?: number[];
  xAxisTickCount?: number;
}) => {
  histogramContainer.innerHTML = '';

  const svg = select(histogramContainer)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = scaleLinear().domain([histogramData.min, histogramData.max]).range([0, width]);
  const y = scaleLinear()
    .domain([0, Math.max(...histogramData.buckets)])
    .range([height, 0]);

  const barWidth = width / histogramData.buckets.length;

  g.selectAll('.histogram-bar')
    .data(histogramData.buckets)
    .enter()
    .append('rect')
    .attr('class', 'histogram-bar')
    .attr('x', (_d, i) => i * barWidth)
    .attr('y', d => y(d))
    .attr('width', barWidth - 1)
    .attr('height', d => height - y(d))
    .attr('fill', '#24a6c7');

  let xAxis = axisBottom(x).tickFormat(x =>
    xAxisTickFormat(typeof x === 'number' ? x : x.valueOf())
  );
  if (xAxisTickValues) {
    xAxis = xAxis.tickValues(xAxisTickValues);
  } else if (typeof xAxisTickCount === 'number') {
    xAxis = xAxis.ticks(xAxisTickCount);
  }

  g.append('g').attr('transform', `translate(0,${height})`).call(xAxis);

  // render magenta line for user score along with a label
  if (typeof userScore === 'number') {
    const lineX = x(userScore);
    g.append('line')
      .attr('x1', lineX)
      .attr('y1', 20)
      .attr('x2', lineX)
      .attr('y2', height)
      .attr('stroke', 'magenta');

    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', `${lineX}`);
    textElement.setAttribute('y', '14');
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('fill', 'magenta');
    textElement.setAttribute('font-size', '12px');
    textElement.textContent = IntegerFormatter.format(userScore);
    g.node()!.appendChild(textElement);

    const textBBox = textElement.getBBox();

    const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectElement.setAttribute('x', `${textBBox.x - 2}`);
    rectElement.setAttribute('y', `${textBBox.y - 2}`);
    rectElement.setAttribute('width', `${textBBox.width + 4}`);
    rectElement.setAttribute('height', `${textBBox.height + 4}`);
    rectElement.setAttribute('fill', 'rgba(0, 0, 0, 0.5)');
    rectElement.setAttribute('rx', '2');
    rectElement.setAttribute('ry', '2');
    g.node()!.insertBefore(rectElement, textElement);
  }

  let yAxis = axisLeft(y).tickFormat(x =>
    IntegerFormatter.format(typeof x === 'number' ? x : x.valueOf())
  );
  if (yAxisTickValues) {
    yAxis = yAxis.tickValues(yAxisTickValues);
  } else {
    yAxis = yAxis.ticks(yAxisTicksCount);
  }

  g.append('g').call(yAxis);
};
