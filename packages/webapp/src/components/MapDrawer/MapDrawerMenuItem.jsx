import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { MdVisibility, MdVisibilityOff } from 'react-icons/all';
import { colors, DefaultThemeProvider } from '../../assets/theme';
import PropTypes from 'prop-types';
import { Main } from '../Typography';

const useStyles = makeStyles({
  plusIcon: {
    color: colors.teal700,
    fontSize: '42px',
    lineHeight: '16px',
  },
  menuItem: {
    paddingLeft: '40px',
    paddingRight: '40px',
  },
});
export default function MapDrawerMenuItem({
  onClick,
  isFilterMenuItem,
  isFiltered,
  children,
  name,
}) {
  const classes = useStyles();
  return (
    <DefaultThemeProvider>
      <ListItem
        style={{ backgroundColor: isFiltered ? '#F3F6FB' : 'white' }}
        button
        className={classes.menuItem}
        onClick={onClick}
      >
        <ListItemIcon>{children}</ListItemIcon>

        <ListItemText>
          <Main>{name}</Main>
        </ListItemText>

        {isFilterMenuItem ? (
          <EyeToggleIcon isFiltered={isFiltered} />
        ) : (
          <span className={classes.plusIcon}>+</span>
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
