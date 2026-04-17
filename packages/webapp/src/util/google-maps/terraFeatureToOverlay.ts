import type { GeoJSONStoreFeatures, GeoJSONStoreGeometries } from 'terra-draw';
import { getDrawingOptions } from '../../containers/Map/useDrawingManager';
import { icons } from '../../containers/Map/mapStyles';

type PolygonOverlay = { type: 'polygon'; overlay: google.maps.Polygon };
type PolylineOverlay = { type: 'polyline'; overlay: google.maps.Polyline };
type MarkerOverlay = { type: 'marker'; overlay: google.maps.Marker };

export type DrawnOverlay = PolygonOverlay | PolylineOverlay | MarkerOverlay;

const toLatLng = ([lng, lat]: [number, number] | number[]): google.maps.LatLngLiteral => ({
  lat,
  lng,
});

export const terraFeatureToOverlay = (
  feature: GeoJSONStoreFeatures<GeoJSONStoreGeometries>,
  map: google.maps.Map,
  maps: typeof google.maps,
  locationType: string,
): DrawnOverlay | null => {
  const { geometry } = feature;
  const drawingOptions = getDrawingOptions(locationType);

  if (geometry.type === 'Polygon' && drawingOptions?.polygonOptions) {
    const ring = geometry.coordinates[0];
    const paths = ring.slice(0, -1).map(toLatLng);
    const overlay = new maps.Polygon({
      paths,
      map,
      ...drawingOptions.polygonOptions,
    });
    return { type: 'polygon', overlay };
  }

  if (geometry.type === 'LineString' && drawingOptions?.polylineOptions) {
    const path = geometry.coordinates.map(toLatLng);
    const overlay = new maps.Polyline({
      path,
      map,
      ...drawingOptions.polylineOptions,
    });
    return { type: 'polyline', overlay };
  }

  if (geometry.type === 'Point') {
    const position = toLatLng(geometry.coordinates);
    const overlay = new maps.Marker({
      position,
      map,
      icon: (icons as Record<string, string | undefined>)[locationType],
      draggable: true,
      crossOnDrag: false,
    });
    return { type: 'marker', overlay };
  }

  return null;
};
