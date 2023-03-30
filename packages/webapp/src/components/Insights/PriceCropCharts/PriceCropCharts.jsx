import React, { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { PriceCropContainer } from './PriceCropContainer/PriceCropContainer';
import { useComponentWidth } from '../../../containers/hooks/useComponentWidthHeight';
import ReactSelect from '../../Form/ReactSelect';
import { roundToTwoDecimal, seedYield, convertFn } from '../../../util/convert-units/unit';
import { Label, Semibold } from '../../Typography';
import styles from './styles.module.scss';
import { colors } from '../../../assets/theme';

export function PriceCropCharts({ cropsWithPriceInfo, currencySymbol, isImperial }) {
  const unit = isImperial ? 'lb' : 'kg';
  const { t } = useTranslation();
  const { ref, width } = useComponentWidth();

  const { uniqueYears, yearOptions } = useMemo(() => {
    const yearSet = new Set();
    for (const cropInfo of cropsWithPriceInfo) {
      const crop_translation_key = Object.keys(cropInfo)[0];
      for (const { crop_date } of cropInfo[crop_translation_key]) {
        yearSet.add(+crop_date.split('-')[0]);
      }
    }
    const uniqueYears = Array.from(yearSet).sort().reverse();
    const yearOptions = uniqueYears.map((year) => ({ label: year, value: year }));
    return { yearOptions, uniqueYears };
  }, [cropsWithPriceInfo]);

  const [year, setYear] = useState(uniqueYears[0] || new Date().getFullYear());

  const filteredPricePoints = useMemo(() => {
    return cropsWithPriceInfo.reduce((filteredPricePoints, cropInfo) => {
      const crop_translation_key = Object.keys(cropInfo)[0];
      const pricePoints = cropInfo[crop_translation_key]
        .filter(({ crop_date }) => {
          return Number(crop_date.split('-')[0]) === year;
        })
        .map((pricePoint) => ({
          ...pricePoint,
          own_price: roundToTwoDecimal(convertFn(seedYield, pricePoint.crop_price, 'kg', unit)),
          network_price: roundToTwoDecimal(
            convertFn(seedYield, pricePoint.network_price, 'kg', unit),
          ),
        }));
      if (pricePoints.length > 0) {
        filteredPricePoints[crop_translation_key] = {};
        filteredPricePoints[crop_translation_key].own_price = pricePoints.filter(
          ({ crop_price }) => crop_price,
        );
        filteredPricePoints[crop_translation_key].network_price = pricePoints;
      }
      return filteredPricePoints;
    }, {});
  }, [year]);
  const yTitle = t('INSIGHTS.PRICES.Y_TITLE', {
    currency: currencySymbol,
    mass: unit,
    interpolation: { escapeValue: false },
  });
  return (
    <div ref={ref}>
      {uniqueYears.length > 1 && (
        <ReactSelect
          style={{ marginBottom: '24px' }}
          label={t('common:YEAR')}
          onChange={(e) => setYear(e.value)}
          options={yearOptions}
          value={{ label: year, value: year }}
        />
      )}
      <div className={styles.chartTitleContainer}>
        <Semibold>{yTitle}</Semibold>
        <div className={styles.labelContainer}>
          <div className={styles.label}>
            <svg className={styles.svg}>
              <line stroke={colors.blue700} strokeWidth={3} x1={0} x2={36} y1={8} y2={8} />
            </svg>
            <Label>{t('INSIGHTS.PRICES.OWN_PRICE')}</Label>
          </div>
          <div className={styles.label}>
            <svg className={styles.svg}>
              <line
                stroke={colors.orange700}
                strokeWidth={8}
                x1={0}
                x2={36}
                y1={8}
                y2={8}
                strokeDasharray={'12,12'}
              />
            </svg>
            <Label>{t('INSIGHTS.PRICES.NETWORK_PRICE')}</Label>
          </div>
        </div>
      </div>

      {Object.entries(filteredPricePoints).map(([crop_translation_key, pricePoints], index) => {
        return (
          <PriceCropContainer
            key={index + '-' + crop_translation_key}
            currencySymbol={currencySymbol}
            name={t(`crop:${crop_translation_key}`)}
            pricePoints={pricePoints}
            config={{ width }}
            year={year}
          />
        );
      })}
    </div>
  );
}
