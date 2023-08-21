import React from 'react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  container: {
    marginBottom: '32px',
    display: 'inline-flex',
    flexFlow: 'row wrap',
    justifyContent: 'flex-start',
    columnGap: '24px',
    rowGap: '16px',
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
