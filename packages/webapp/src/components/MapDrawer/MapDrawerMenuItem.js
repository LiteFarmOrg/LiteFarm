import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { MdVisibility, MdVisibilityOff } from 'react-icons/all';
import { colors } from '../../assets/theme';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
  plusIcon: {
    color: colors.teal700,
    fontSize: '42px',
    lineHeight: '16px',
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
    <ListItem
      style={{ backgroundColor: isFiltered ? '#F3F6FB' : 'white' }}
      button
      onClick={onClick}
    >
      <ListItemIcon>{/*{children}*/}</ListItemIcon>

      <ListItemText primary={name} />

      {isFilterMenuItem ? (
        <EyeToggleIcon isFiltered={isFiltered} />
      ) : (
        <span className={classes.plusIcon}>+</span>
      )}
    </ListItem>
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
