export const isArea = (type) => {
  return [
    'barn',
    'ceremonial',
    'farmBound',
    'field',
    'greenhouse',
    'groundwater',
    'natural',
    'residence',
  ].includes(type);
}

export const isLine = (type) => {
  return [
    'creek',
    'fence',
  ].includes(type);
}

export const isPoint = (type) => {
  return [
    'gate',
    'waterValve',
  ].includes(type);
}
