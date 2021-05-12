import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  container: {
    marginBottom: '30px',
    display: 'inline-flex',
    flexFlow: 'row wrap',
    justifyContent: 'flex-start',
    gap: '24px',
  },
});
//TODO storybook
export default function PureCropTileContainer({ children, gap, padding }) {
  const classes = useStyles();
  return (
    <div className={classes.container} style={{ columnGap: gap, padding: `0 ${padding}px` }}>
      {children}
    </div>
  );
}
