import React from 'react';
import { useTranslation } from 'react-i18next';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import styles from './styles.module.scss';
import { Semibold } from '../../Typography';

export default function YearSelectorModal({ dismissModal, isOpen, initYear, selectYear }) {
  const { t } = useTranslation();
  const years = [...Array(50)].map((_, i) => initYear + i);
  return (
    <Dialog
      classes={{
        root: styles.rootDialog,
      }}
      onClose={dismissModal}
      open={isOpen}
    >
      <DialogTitle
        classes={{
          root: styles.dialogTitle,
        }}
      >
        <Semibold style={{ color: 'var(--teal700)', textAlign: 'center' }}>
          {t('YEAR_SELECTOR.TITLE')}
        </Semibold>
      </DialogTitle>
      <List>
        {years.map((year) => (
          <ListItem
            key={year}
            onClick={() => selectYear(year)}
            alignItems={'center'}
            style={{ width: '227px' }}
            button
          >
            <ListItemText
              classes={{
                primary: initYear === year ? styles.initYear : styles.allYears,
              }}
              inset
              primary={year}
            />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}
