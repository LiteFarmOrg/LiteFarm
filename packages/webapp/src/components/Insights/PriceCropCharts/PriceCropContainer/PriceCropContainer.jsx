import React, { useEffect, useMemo, useRef } from 'react';
import { Text } from '../../../Typography';
import { useTranslation } from 'react-i18next';
import {
  axisBottom,
  axisLeft,
  bisectCenter,
  line,
  max,
  min,
  pointer,
  scaleLinear,
  scaleTime,
  select,
  timeFormat,
} from 'd3';
import styles from './styles.module.scss';
import { colors } from '../../../../assets/theme';
import { useDebounce } from '../../../../containers/hooks/useDebounce';

const priceAttributeMap = {
  network_price: {
    stroke: colors.orange700,
    strokeWidth: 8,
    strokeDasharray: '12,12',
  },
  own_price: {
    stroke: colors.blue700,
    strokeWidth: 3,
    strokeDasharray: undefined,
  },
};

export function PriceCropContainer({
  currencySymbol,
  name,
  pricePoints,
  year = 2022,
  config: {
    marginTop = 20, // top margin, in pixels
    marginRight = 12, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640,
    height = 320,
    xRange = [marginLeft, width - marginRight],
    yRange = [height - marginBottom, marginTop],
    xType = scaleTime,
    yType = scaleLinear,
    strokeWidth = 1.5,
  } = {},
}) {
  const { t } = useTranslation();

  const svgRef = useRef();
  const d3Refs = useRef({});

  useEffect(() => {
    d3Refs.current.svg = select(svgRef.current);
    d3Refs.current.xScale = xType();
    d3Refs.current.yScale = yType().range(yRange);
    d3Refs.current.xAxis = axisBottom(d3Refs.current.xScale)
      .tickFormat(timeFormat('%Y-%m'))
      .tickSizeOuter(0);
    d3Refs.current.yAxis = axisLeft(d3Refs.current.yScale).ticks(height / 40);
  }, [svgRef.current]);

  useEffect(() => {
    d3Refs.current.xScale.range(xRange);
    d3Refs.current.xAxis.ticks(getNumberOfTicks(width));
  }, [width, svgRef.current]);

  useEffect(() => {
    const { yMax, yMin } = pricePoints?.network_price?.reduce(
      ({ yMax, yMin }, { own_price, network_price }) => {
        return {
          yMax: max([yMax, own_price, network_price]),
          yMin: min([yMin, own_price, network_price]),
        };
      },
      { yMax: 0, yMin: 999999 },
    ) || { yMax: 3, yMin: 3 };
    d3Refs.current.yScale.domain([0, yMax + yMin]);
    d3Refs.current.xScale.domain([new Date(year, 0, 1), new Date(year, 11, 31)]);
  }, [year, pricePoints, svgRef.current]);

  useEffect(() => {
    const { yScale, svg, xScale, xAxis, yAxis } = d3Refs.current;

    const xAxisG = svg.select(`.${styles.xAxis}`).call(xAxis);
    const yAxisG = svg
      .select(`.${styles.yAxis}`)
      .call(yAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('x2', width - marginLeft - marginRight)
          .attr('stroke-opacity', 0.1),
      );
    svg.select(`.${styles.lines}`).selectAll('*').remove();
    svg
      .select(`.${styles.lines}`)
      .selectAll(`.${styles.line}`)
      .data(['own_price', 'network_price'])
      .join('path')
      .attr('stroke', (priceType) => priceAttributeMap[priceType].stroke)
      .attr('stroke-width', (priceType) => priceAttributeMap[priceType].strokeWidth)
      .attr('stroke-dasharray', (priceType) => priceAttributeMap[priceType].strokeDasharray)
      .attr('class', styles.line)
      .attr('d', (priceType) =>
        line()
          .x(({ crop_date }) => xScale(getCropDate(crop_date)))
          .y((pricePoint) => yScale(pricePoint[priceType]))(pricePoints[priceType]),
      );

    const circles = ['network_price', 'own_price'].reduce((circles, priceType) => {
      for (const pricePoint of pricePoints[priceType]) {
        circles.push({
          stroke: priceAttributeMap[priceType].stroke,
          cx: xScale(getCropDate(pricePoint.crop_date)),
          cy: yScale(pricePoint[priceType]),
          r: 6,
        });
      }
      return circles;
    }, []);
    svg
      .select(`.${styles.lines}`)
      .selectAll(`.${styles.circle}`)
      .data(circles)
      .join('circle')
      .attr('fill', ({ stroke }) => stroke)
      .attr('r', ({ r }) => r)
      .attr('cx', ({ cx }) => cx)
      .attr('cy', ({ cy }) => cy)
      .attr('class', styles.circle);
  }, [pricePoints?.length, width, year]);

  const cropPriceByMonth = useMemo(() => {
    return pricePoints.own_price.reduce((cropPriceByMonth, cropPrice) => {
      cropPriceByMonth[cropPrice.crop_date] = cropPrice;
      return cropPriceByMonth;
    }, {});
  }, [pricePoints.own_price]);
  const debounce = useDebounce();

  function pointermoved(event) {
    debounce(() => {
      const { yScale, svg, xScale, xAxis, yAxis } = d3Refs.current;
      const tooltip = svg.select(`.${styles.tooltip}`);
      const cropDates = pricePoints.network_price.map(({ crop_date }) => getCropDate(crop_date));
      const i = bisectCenter(cropDates, xScale.invert(pointer(event)[0]));
      const netWorkPrice = { ...pricePoints.network_price[i], priceType: 'network_price' };
      const cropPrice = cropPriceByMonth[netWorkPrice.crop_date] && {
        ...cropPriceByMonth[netWorkPrice.crop_date],
        priceType: 'own_price',
      };
      const cursorYInvert = yScale.invert(pointer(event)[1]);

      const price =
        cropPrice &&
        Math.abs(cropPrice.own_price - cursorYInvert) <
          Math.abs(netWorkPrice.network_price - cursorYInvert)
          ? cropPrice
          : netWorkPrice;
      tooltip.style('display', null);
      tooltip.attr(
        'transform',
        `translate(${xScale(cropDates[i])},${yScale(price[price.priceType])})`,
      );

      const path = tooltip
        .selectAll('path')
        .data([1])
        .join('path')
        .attr('fill', colors.grey400)
        .attr('stroke', 'transparent');

      const text = tooltip
        .selectAll('text')
        .data([1])
        .join('text')
        .attr('fill', colors.grey900)
        .call((text) =>
          text
            .selectAll('tspan')
            .data([
              `${t('common:DATE')}: ${price.crop_date}`,
              `${t(`INSIGHTS.PRICES.${price.priceType.toUpperCase()}`)}: ${price[price.priceType]}`,
            ])
            .join('tspan')
            .attr('x', 0)
            .attr('y', (_, i) => `${i * 1.1}em`)
            .text((d) => d),
        );

      const { x, y, width: w, height: h } = text.node().getBBox();
      text.attr('transform', `translate(${-w / 2},${15 - y})`);
      path.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
      svg.property('value', netWorkPrice).dispatch('input', { bubbles: true });
    }, 100);
  }

  function pointerleft() {
    const { yScale, svg, xScale, xAxis, yAxis } = d3Refs.current;
    const tooltip = svg.select(`.${styles.tooltip}`);
    tooltip.style('display', 'none');
    svg.node().value = null;
    svg.dispatch('input', { bubbles: true });
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      <Text className={styles.title}>{name}</Text>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0,0,${width},${height}`}
        fontSize={10}
        className={styles.svg}
        onPointerMove={pointermoved}
        onPointerLeave={pointerleft}
        onTouchStart={(event) => event.preventDefault()}
      >
        <g className={styles.xAxis} transform={`translate(0,${height - marginBottom})`} />
        <g className={styles.yAxis} transform={`translate(${marginLeft},0)`} />
        <g className={styles.lines} />

        <g className={styles.tooltip} />
      </svg>
    </div>
  );
}

function getNumberOfTicks(width) {
  if (width > 680) return 12;
  if (width > 480) return 6;
  if (width > 320) return 4;
  return 3;
}

function getCropDate(crop_date) {
  return new Date(`${crop_date}-01`);
}
