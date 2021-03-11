const assets = ['ceremonial_area', 'residence', 'ground_water', 'natural_area', 'greenhouse', 'barn', 'field',
  'buffer_zone', 'creek', 'fence', 'gate', 'water_valve'];
const figures = ['area', 'line', 'point'];

const figureMapping = {
  ceremonial_area: 'area',
  residence: 'area',
  ground_water: 'area',
  natural_area: 'area',
  greenhouse: 'area',
  farm_site_boundary: 'area',
  barn: 'area',
  field: 'area',
  buffer_zone: 'line',
  creek: 'line',
  fence: 'line',
  gate: 'point',
  water_valve: 'point',
};

const promiseMapper = {
  area: 'promisedArea',
  line: 'promisedLine',
  point: 'promisedPoint',
};

const modelMapping = {
  ceremonial_area: modelValidation('ceremonial_area'),
  farm_site_boundary: modelValidation('farm_site_boundary'),
  residence: modelValidation('residence'),
  ground_water: modelValidation('ground_water'),
  natural_area: modelValidation('natural_area'),
  greenhouse: modelValidation('greenhouse'),
  barn: modelValidation('barn'),
  field: modelValidation('field'),
  buffer_zone: modelValidation('buffer_zone'),
  creek: modelValidation('creek'),
  fence: modelValidation('fence'),
  gate: modelValidation('gate'),
  water_valve: modelValidation('water_valve'),
}


function figureValidation(data, figure) {
  const nonModifiableFigures = figures.filter((f) => f !== figure);
  const isModifyingOtherFigure = Object.keys(data.figure).some((key) => nonModifiableFigures.includes(key));
  return data.figure && data.figure[figure] && !isModifyingOtherFigure || false;
}

const assetValidation = (data, asset) => {
  const nonModifiableAssets = assets.filter(a => a !== asset);
  const isModifyingOtherAsset = Object.keys(data).some((key) => nonModifiableAssets.includes(key));
  return data && data[asset] && !isModifyingOtherAsset || false;
}

function modelValidation(asset) {
  const figure = figureMapping[asset];
  return (req, res, next) => {
    const data = req.body;
    const isAssetValid = assetValidation(data, asset);
    const isFigureValid = figureValidation(data, figure);
    isAssetValid && isFigureValid ? next() : res.status(400).send({
      message: 'You are trying to modify an unallowed object',
    })
  }
}

module.exports = {
  modelMapping,
  figureMapping,
  promiseMapper,
  assets,
  figures,
}
