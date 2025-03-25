import { useSelector } from 'react-redux';
import { locationByIdSelector } from '../../locationSlice';
import PureLocationFieldTechnology from '../../../components/LocationFieldTechnology';
import useFieldTechnology from './useFieldTechnology';
import useLocationRouterTabs from '../useLocationRouterTabs';

function LocationFieldTechnology({ history, match }) {
  const { location_id } = match.params;
  const location = useSelector(locationByIdSelector(location_id));

  const fieldTechnology = useFieldTechnology(location);
  const routerTabs = useLocationRouterTabs(location, match);

  return (
    <PureLocationFieldTechnology
      fieldTechnology={fieldTechnology}
      history={history}
      match={match}
      location={location}
      routerTabs={routerTabs}
    />
  );
}

export default LocationFieldTechnology;
