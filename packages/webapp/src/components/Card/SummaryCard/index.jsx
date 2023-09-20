/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Info, Semibold } from '../../Typography';
import Card from '../index';
import styles from '../card.module.scss';

export default function SummaryCard({ label, data, color, size, classes = {} }) {
  return (
    <Card color={'secondary'} className={clsx(styles[color], styles.summaryCard, classes.card)}>
      <Info
        className={clsx(
          styles.summaryInfo,
          styles[color],
          styles[`${size}SummaryLabel`],
          classes.info,
        )}
      >
        {label}
      </Info>
      <Semibold className={clsx(styles[color], styles[`${size}SummaryData`], classes.data)}>
        {data}
      </Semibold>
    </Card>
  );
}

SummaryCard.propTypes = {
  label: PropTypes.string,
  data: PropTypes.string,
  color: PropTypes.oneOf(['positive', 'negative']),
  size: PropTypes.oneOf(['lg']),
  classes: PropTypes.shape({
    card: PropTypes.object,
    info: PropTypes.object,
    data: PropTypes.object,
  }),
};
