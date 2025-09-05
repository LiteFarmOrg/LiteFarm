/*
 *  Copyright 2025 LiteFarm.org
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
import Button from '../../Form/Button';
import styles from './styles.module.scss';

interface RevisionPromptProps {
  text: string;
  onClick: () => void;
}

const RevisionPrompt = ({ text, onClick }: RevisionPromptProps) => {
  const { t } = useTranslation(['translation', 'common']);

  return (
    <div className={styles.revisionPrompt}>
      <div>
        <h3>{t('REVISION_PROMPT.NOTICED_SOMETHING_OFF')}</h3>
        <p>{text}</p>
      </div>
      <Button className={styles.button} type="button" sm color="secondary-2" onClick={onClick}>
        {t('common:FIX_IT_NOW')}
      </Button>
    </div>
  );
};

export default RevisionPrompt;
