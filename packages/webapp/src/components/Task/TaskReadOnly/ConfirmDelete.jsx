/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import Button from '../../Form/Button';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { ReactComponent as TrashIcon } from '../../../assets/images/document/trash.svg';

const useStyles = makeStyles({
  deleteBox: {
    border: '1px var(--red700) solid',
    borderRadius: 4,
    padding: '20px',
    margin: '20px 0',
    background: 'var(--grey100)',
  },
  title: {
    color: 'var(--red700)',
    paddingBottom: '10px',
    '& svg': {
      fill: 'var(--red700)',
      stroke: 'var(--red700)',
      transform: 'translate(0px, 5px)',
    },
  },
  buttons: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    flexFlow: 'row wrap',
    '& button': {
      margin: '30px 8px 8px 8px',
    },
    '& button:nth-of-type(1)': {
      flexGrow: 1,
    },
    '& button:nth-of-type(2)': {
      flexGrow: 2,
    },
  },
});

export default function ConfirmDelete({ onDelete, onCancel }) {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div className={classes.deleteBox}>
      <h3 className={classes.title}>
        <TrashIcon />
        {t('TASK.DELETE.DELETE_TASK_QUESTION')}
      </h3>
      <p>{t('TASK.DELETE.DELETE_TASK_MESSAGE')}</p>
      <div className={classes.buttons}>
        <Button data-cy="taskReadOnly-complete" color={'secondary'} onClick={onCancel}>
          {t('common:CANCEL')}
        </Button>
        <Button data-cy="taskReadOnly-complete" color={'error'} onClick={onDelete}>
          {t('TASK.DELETE.CONFIRM_DELETION')}
        </Button>
      </div>
    </div>
  );
}
