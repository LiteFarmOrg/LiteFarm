import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { colors, DefaultThemeProvider } from '../../assets/theme';
import PropTypes from 'prop-types';
import { Main } from '../Typography';
import styles from './styles.module.scss';
export default function MapDrawerMenuItem({
  onClick,
  isFilterMenuItem,
  isFiltered,
  children,
  name,
}) {
  return (
    <DefaultThemeProvider>
      <ListItem
        button
        style={{ backgroundColor: isFiltered ? '#F3F6FB' : 'white' }}
        onClick={onClick}
      >
        <ListItemIcon>{children}</ListItemIcon>

        <ListItemText>
          <Main>{name}</Main>
        </ListItemText>

        {isFilterMenuItem ? (
          <EyeToggleIcon isFiltered={isFiltered} />
        ) : (
          <span className={styles.plusIcon}>+</span>
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
