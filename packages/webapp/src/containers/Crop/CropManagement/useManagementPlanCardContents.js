import { useSelector } from 'react-redux';
import { taskEntitiesSelector } from '../../taskSlice';

export const useManagementPlanCardContents = () => {
  const tasks = useSelector(taskEntitiesSelector);
};
