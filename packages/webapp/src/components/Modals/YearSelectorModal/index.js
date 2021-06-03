import React from 'react';
import { useTranslation } from 'react-i18next';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
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
