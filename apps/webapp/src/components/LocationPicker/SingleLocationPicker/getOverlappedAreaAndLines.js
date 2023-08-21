import { isArea, isLine } from '../../../containers/Map/constants';

export function getOverlappedAreaAndLines(latLng, geometries, maps) {
  return geometries
    .filter(
      ({ location, polygon }) =>
        (isArea(location.type) || isLine(location.type)) &&
        polygon?.visible &&
        maps.geometry.poly.containsLocation(latLng, polygon),
    )
    .map(({ location }) => ({
      location_id: location.location_id,
      name: location.name,
      type: location.type,
    }));
}
