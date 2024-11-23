/*
 *  Copyright 2024 LiteFarm.org
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

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { TourProviderWrapper } from '../../../components/TourProviderWrapper/TourProviderWrapper';
import { setSpotlightToShown } from '../../Map/saga';
import { showedSpotlightSelector } from '../../showedSpotlightSlice';
import { Trans } from 'react-i18next';
import Badge from '../../../components/Badge';
import { ReactComponent as SendIcon } from '../../../assets/images/send-icon.svg';
import styles from './styles.module.scss';

export default function AnimalsBetaSpotlight({ children, setFeedbackSurveyOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { animals_beta } = useSelector(showedSpotlightSelector);
  const onFinish = () => dispatch(setSpotlightToShown('animals_beta'));

  return (
    <TourProviderWrapper
      showCloseButton
      open={!animals_beta}
      steps={[
        {
          title: (
            <Badge
              title={t('BADGE.BETA.TITLE')}
              showIcon={false}
              position={'left'}
              disableHover
              classes={{ iconButton: styles.disableHover }}
            />
          ),
          contents: [
            <b key={'animals_beta_step_1_heading'}>{t('ANIMAL.BETA_SPOTLIGHT_HEADING')}</b>,
            <Trans
              key={'animals_beta_step_1_content'}
              i18nKey={'BADGE.BETA.ANIMALS_CONTENT'}
              components={{ a: <a href="#" /> }}
            />,
          ],
          selector: '#animalsBeta',
          position: 'center',
          buttonText: (
            <div className={styles.buttonText}>
              {t('HELP.SEND_US_FEEDBACK')}
              <SendIcon />
            </div>
          ),
          buttonProps: {
            color: 'secondary',
          },
          onNext: () => setFeedbackSurveyOpen(true),
        },
      ]}
      onFinish={onFinish}
    >
      {children}
    </TourProviderWrapper>
  );
}
