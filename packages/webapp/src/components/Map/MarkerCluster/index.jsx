import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';

const MarkerCluster = (map, maps, markers, eventListeners) => {
  // return clusterer and marker
  return new MarkerClusterer({
    map,
    markers,
    algorithm: new SuperClusterAlgorithm({ maxZoom: 20, radius: 45 }),
    renderer: {
      render: ({ count, position }) => {
        const svg = window.btoa(
          '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
            '<path d="M0.5 4C0.5 2.067 2.067 0.5 4 0.5H24C25.933 0.5 27.5 2.067 27.5 4V24C27.5 25.933 25.933 27.5 24 27.5H4C2.067 27.5 0.5 25.933 0.5 24V4Z" fill="#028577" stroke="white"/>\n' +
            '</svg>\n',
        );
        const m = new maps.Marker({
          label: { text: String(count), color: 'white', fontSize: '20px' },
          position,
          icon: {
            url: `data:image/svg+xml;base64,${svg}`,
          },
        });
        eventListeners.forEach((e) => {
          maps.event.addListener(m, e.event, e.callbackFunction);
        });
        return m;
      },
    },
  });
};

export default MarkerCluster;
