import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { useEffect } from 'react';

export const markerSVG = (stroke, fill) =>
  window.btoa(
    '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
      `<path d="M0.5 4C0.5 2.067 2.067 0.5 4 0.5H24C25.933 0.5 27.5 2.067 27.5 4V24C27.5 25.933 25.933 27.5 24 27.5H4C2.067 27.5 0.5 25.933 0.5 24V4Z" fill="${fill}" stroke="${stroke}"/>\n` +
      '</svg>\n',
  );
const CreateMarkerCluster = (
  map,
  maps,
  markers,
  eventListeners,
  clustererRef,
  selectedLocationsRef = null,
  maxZoom,
) => {
  // return clusterer and marker
  clustererRef.current = new MarkerClusterer({
    map,
    markers,
    algorithm: new SuperClusterAlgorithm({ maxZoom: maxZoom, radius: 45.5 }),
    renderer: {
      render: ({ count, position, markers }) => {
        let fill = selectedLocationsRef?.current ? '#ffffff' : '#028577';
        let stroke = selectedLocationsRef?.current ? '#028577' : '#ffffff';
        selectedLocationsRef?.current?.some((location_id) => {
          if (markers.some((m) => m.location_id === location_id)) {
            fill = '#028577';
            stroke = '#ffffff';
            return true;
          } else {
            fill = '#ffffff';
            stroke = '#028577';
            return false;
          }
        });
        const svg = markerSVG(stroke, fill);
        const m = new maps.Marker({
          label: { text: String(count), color: stroke, fontSize: '20px' },
          position,
          icon: {
            url: `data:image/svg+xml;base64,${svg}`,
          },
          zIndex: 10,
        });
        eventListeners.forEach((e) => {
          m.addListener(e.event, e.callbackFunction(m));
        });
        return m;
      },
    },
  });
};

export default CreateMarkerCluster;
