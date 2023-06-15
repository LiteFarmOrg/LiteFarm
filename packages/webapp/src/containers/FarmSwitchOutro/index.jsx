import React from 'react';
import FarmSwitchOutro from '../../components/FarmSwitchOutro';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../userFarmSlice';
import { Dialog } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    overflow: 'hidden',
  },
}));
export default function FarmSwitchOutroFloater({ children, onFinish }) {
  const { farm_name } = useSelector(userFarmSelector);
  const classes = useStyles();
  return (
    <Dialog
      open={true}
      PaperProps={{ className: classes.paper }}
      placement={'center'}
      onClose={onFinish}
    >
      <FarmSwitchOutro onFinish={onFinish} farm_name={farm_name} />
    </Dialog>
  );
}
