const selectionHandler = () => {
  const getLatLng = (maps, assetType) => {
    assetType !== null
      ? maps.event.addListener(assetType, 'click', function (mapsMouseEvent) {
          console.log('clicked line, pt, or area');
          console.log(mapsMouseEvent.latLng.toJSON());
        })
      : maps.addListener('click', (mapsMouseEvent) => {
          console.log('clicked anywhere on map');
          console.log(mapsMouseEvent.latLng.toJSON());
        });
  };
  return { getLatLng };
};

export default selectionHandler;
