import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  container: {
    marginBottom: '32px',
    display: 'inline-flex',
    flexFlow: 'row wrap',
    justifyContent: 'flex-start',
    columnGap: '14px',
    rowGap: '16px',
  },
});

export default function PureDocumentTileContainer({ children, gap, padding }) {
  const classes = useStyles();
  return (
    <div className={classes.container} style={{ columnGap: gap, padding: `0 ${padding}px` }}>
      {children}
    </div>
  );
}
