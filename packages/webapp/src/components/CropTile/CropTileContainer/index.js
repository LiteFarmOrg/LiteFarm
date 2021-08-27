import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  container: {
    marginBottom: '32px',
    display: 'inline-flex',
    flexFlow: 'row wrap',
    justifyContent: 'flex-start',
    columnGap: '24px',
    rowGap: '16px',
  },
  harvest: {
    display: 'inline-block',
    justifyContent: 'flex-start',
  }
});

//TODO storybook
export default function PureCropTileContainer({ children, gap, padding, harvestInputs, }) {
  const classes = useStyles();
  return (
    <div className={harvestInputs ? classes.harvest : classes.container} style={{ columnGap: gap, padding: `0 ${padding}px` }}>
      {children}
    </div>
  );
}
