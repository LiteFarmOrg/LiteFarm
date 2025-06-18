import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { colors, DefaultThemeProvider } from '../../assets/theme';
import PropTypes from 'prop-types';
import { Main } from '../Typography';
import styles from './styles.module.scss';
import Icon from '../Icons';

export default function MapDrawerMenuItem({
  onClick,
  isFilterMenuItem,
  isFiltered,
  children,
  name,
}) {
  const { t } = useTranslation();

  return (
    <DefaultThemeProvider>
      <ListItem
        button
        className={clsx(isFiltered ? styles.filteredItem : styles.menuItem)}
        onClick={onClick}
      >
        <ListItemIcon>{children}</ListItemIcon>

        <ListItemText>
          <Main>{name}</Main>
        </ListItemText>

        {isFilterMenuItem ? (
          <EyeToggleIcon isFiltered={isFiltered} />
        ) : (
          <div className={styles.plusAdd}>
            <Icon iconName={'PLUS_CIRCLE'} />
            {t('common:ADD')}
          </div>
        )}
      </ListItem>
    </DefaultThemeProvider>
  );
}

function EyeToggleIcon({ isFiltered }) {
  return isFiltered ? (
    <MdVisibilityOff size={24} color={colors.grey600} />
  ) : (
    <MdVisibility size={24} color={colors.grey600} />
  );
}

MapDrawerMenuItem.prototype = {
  onClick: PropTypes.func,
  isFilterMenuItem: PropTypes.bool,
  isFiltered: PropTypes.bool,
  children: PropTypes.node,
  name: PropTypes.string,
};
