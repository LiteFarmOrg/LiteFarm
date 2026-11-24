/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import SoilLayerControl from '../components/Map/SoilLayerControl';

const layers = [
  { id: 'soilgrids-phh2o', labelKey: 'PH' },
  { id: 'soilgrids-clay', labelKey: 'CLAY' },
];

const setup = (props = {}) => {
  const onSelect = vi.fn();
  const onOpacityChange = vi.fn();
  render(
    <SoilLayerControl
      layers={layers}
      selectedId={null}
      opacity={0.6}
      onSelect={onSelect}
      onOpacityChange={onOpacityChange}
      {...props}
    />,
  );
  return { onSelect, onOpacityChange };
};

describe('SoilLayerControl', () => {
  afterEach(cleanup);

  it('renders nothing when there are no layers', () => {
    setup({ layers: [] });
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('starts collapsed and opens from the toggle', () => {
    setup();
    const toggle = screen.getByRole('button', { name: 'FARM_MAP.SOIL_LAYERS.TITLE' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('radio')).toBeNull();
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('marks None as selected when no layer is chosen', () => {
    setup();
    fireEvent.click(screen.getByRole('button'));
    expect((screen.getByLabelText('FARM_MAP.SOIL_LAYERS.NONE') as HTMLInputElement).checked).toBe(
      true,
    );
  });

  it('reports the chosen layer and None', () => {
    const { onSelect } = setup({ selectedId: 'soilgrids-phh2o' });
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByLabelText('FARM_MAP.SOIL_LAYERS.CLAY'));
    expect(onSelect).toHaveBeenLastCalledWith('soilgrids-clay');
    fireEvent.click(screen.getByLabelText('FARM_MAP.SOIL_LAYERS.NONE'));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it('disables opacity until a layer is chosen, then reports changes as numbers', () => {
    const first = setup();
    fireEvent.click(screen.getByRole('button'));
    expect((screen.getByRole('slider') as HTMLInputElement).disabled).toBe(true);
    cleanup();

    const second = setup({ selectedId: 'soilgrids-phh2o' });
    fireEvent.click(screen.getByRole('button'));
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.disabled).toBe(false);
    fireEvent.change(slider, { target: { value: '0.8' } });
    expect(second.onOpacityChange).toHaveBeenCalledWith(0.8);
    expect(first.onOpacityChange).not.toHaveBeenCalled();
  });

  it('shows the accuracy note only while a layer is selected', () => {
    setup();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('FARM_MAP.SOIL_LAYERS.NOTE')).toBeNull();
    cleanup();
    setup({ selectedId: 'soilgrids-clay' });
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('FARM_MAP.SOIL_LAYERS.NOTE')).toBeTruthy();
  });
});
