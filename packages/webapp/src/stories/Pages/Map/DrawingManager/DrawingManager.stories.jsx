import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/Decorators';
import DrawingManager from '../../../../components/Map/DrawingManager/';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Components/Map/DrawingManager',
  component: DrawingManager,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <DrawingManager {...args} />;

export const DrawingArea = Template.bind({});
DrawingArea.args = {
  drawingState: 'field',
  isDrawing: true,
};
DrawingArea.parameters = {
  ...chromaticSmallScreen,
};

export const DrewArea = Template.bind({});
DrewArea.args = {
  drawingState: 'field',
  isDrawing: false,
};
DrewArea.parameters = {
  ...chromaticSmallScreen,
};

export const DrawingPoint = Template.bind({});
DrawingPoint.args = {
  drawingState: 'gate',
  isDrawing: true,
};
DrawingPoint.parameters = {
  ...chromaticSmallScreen,
};

export const DrewPoint = Template.bind({});
DrewPoint.args = {
  drawingState: 'gate',
  isDrawing: false,
};
DrewPoint.parameters = {
  ...chromaticSmallScreen,
};
