import React from 'react';
import decorators, { componentDecoratorsWithoutPadding } from '../../config/decorators';
import DrawingManager from '../../../../components/Map/DrawingManager/';

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
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const DrewArea = Template.bind({});
DrewArea.args = {
  drawingState: 'field',
  isDrawing: false,
};
DrewArea.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const DrawingPoint = Template.bind({});
DrawingPoint.args = {
  drawingState: 'gate',
  isDrawing: true,
};
DrawingPoint.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const DrewPoint = Template.bind({});
DrewPoint.args = {
  drawingState: 'gate',
  isDrawing: false,
};
DrewPoint.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
