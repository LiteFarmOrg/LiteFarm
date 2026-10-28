import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Evaluate store/store first, see useAuthenticatedSession.test.tsx.
import '../store/store';
import rootReducer from '../store/reducer';

// Without a loaded i18n instance useTranslation suspends, so render with keys as text.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
  Trans: ({ children }: { children?: ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
vi.mock('../containers/AddFarm/saga', () => ({
  postFarm: (payload: unknown) => ({ type: 'test/postFarm', payload }),
  patchFarm: (payload: unknown) => ({ type: 'test/patchFarm', payload }),
}));
vi.mock('../containers/ChooseFarm/saga', () => ({
  getUserFarms: () => ({ type: 'test/getUserFarms' }),
}));
vi.mock('../containers/AddFarm/MapLibrePreview', () => ({
  default: ({ gridPoints }: { gridPoints: unknown }) => (
    <div data-testid="preview">{JSON.stringify(gridPoints)}</div>
  ),
}));
vi.mock('../util/geocoding/geocoder', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../util/geocoding/geocoder')>()),
  SEARCH_AS_YOU_TYPE: true,
  searchAddress: vi.fn(),
  reverseCountry: vi.fn(),
}));

import { reverseCountry, searchAddress } from '../util/geocoding/geocoder';
import MapLibreAddFarm from '../containers/AddFarm/MapLibreAddFarm';

const bristol = {
  label: 'Bristol, England, United Kingdom',
  lat: 51.4545,
  lng: -2.5879,
  country: 'GB',
};

const renderPage = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }),
  });
  const dispatch = vi.spyOn(store, 'dispatch');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );
  const view = render(<MapLibreAddFarm />, { wrapper });
  const addressInput = () => view.container.querySelector('#autocomplete') as HTMLInputElement;
  const nameInput = () =>
    view.container.querySelector('input[name="farm_name"]') as HTMLInputElement;
  const submit = () =>
    view.container.querySelector('[data-cy="addFarm-continue"]') as HTMLButtonElement;
  return { dispatch, addressInput, nameInput, submit };
};

describe('MapLibre Add Farm page', () => {
  beforeEach(() => {
    vi.mocked(searchAddress).mockReset();
    vi.mocked(reverseCountry).mockReset();
  });
  afterEach(cleanup);

  it('searches while typing, selects a suggestion and submits its coordinates and country', async () => {
    vi.mocked(searchAddress).mockResolvedValue([bristol]);
    const { dispatch, addressInput, nameInput, submit } = renderPage();

    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: 'Bristol' } });

    const options = await screen.findAllByRole('option', {}, { timeout: 3000 });
    expect(options[0].textContent).toBe(bristol.label);
    expect(submit().disabled).toBe(true);

    // The browser fires mousedown before blur; the handler must not depend on the click.
    fireEvent.mouseDown(options[0]);

    await waitFor(() => expect(submit().disabled).toBe(false));
    expect(addressInput().value).toBe(bristol.label);
    expect(screen.getByTestId('preview').textContent).toBe(
      JSON.stringify({ lat: bristol.lat, lng: bristol.lng }),
    );
    expect(screen.queryAllByRole('option')).toHaveLength(0);

    fireEvent.click(submit());
    await waitFor(() =>
      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test/postFarm',
          payload: expect.objectContaining({
            farm_name: 'Test farm',
            address: bristol.label,
            country: 'GB',
            gridPoints: { lat: bristol.lat, lng: bristol.lng },
          }),
        }),
      ),
    );
  });

  it('selects with the keyboard and clears the place again when the text is edited', async () => {
    vi.mocked(searchAddress).mockResolvedValue([bristol]);
    const { addressInput, nameInput, submit } = renderPage();

    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: 'Bristol' } });
    await screen.findAllByRole('option', {}, { timeout: 3000 });

    fireEvent.keyDown(addressInput(), { key: 'ArrowDown' });
    fireEvent.keyDown(addressInput(), { key: 'Enter' });
    await waitFor(() => expect(submit().disabled).toBe(false));

    fireEvent.change(addressInput(), { target: { value: 'Bristol, Somewhere else' } });
    await waitFor(() => expect(submit().disabled).toBe(true));
    expect(screen.getByTestId('preview').textContent).toBe('{}');
  });

  it('takes typed coordinates without searching, and looks up the country', async () => {
    vi.mocked(reverseCountry).mockResolvedValue('FR');
    const { addressInput, nameInput, submit } = renderPage();

    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: '48.0048, 3.6651' } });

    await waitFor(() => expect(submit().disabled).toBe(false), { timeout: 3000 });
    expect(reverseCountry).toHaveBeenCalledTimes(1);
    expect(vi.mocked(reverseCountry).mock.calls[0].slice(0, 2)).toEqual([48.0048, 3.6651]);
    expect(searchAddress).not.toHaveBeenCalled();
    expect(screen.getByTestId('preview').textContent).toBe(
      JSON.stringify({ lat: 48.0048, lng: 3.6651 }),
    );
  });

  it('keeps the form blocked when the coordinate has no country', async () => {
    vi.mocked(reverseCountry).mockResolvedValue(undefined);
    const { addressInput, nameInput, submit } = renderPage();

    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: '0, -30' } });

    await waitFor(() => expect(reverseCountry).toHaveBeenCalled(), { timeout: 3000 });
    await waitFor(() =>
      expect(screen.getByTestId('preview').textContent).toBe(JSON.stringify({ lat: 0, lng: -30 })),
    );
    expect(submit().disabled).toBe(true);
  });

  it('shows a message when the address search fails', async () => {
    vi.mocked(searchAddress).mockRejectedValue(new Error('offline'));
    const { addressInput } = renderPage();

    fireEvent.change(addressInput(), { target: { value: 'Bristol' } });

    expect(
      await screen.findByText('ADD_FARM.ADDRESS_SEARCH_UNAVAILABLE', {}, { timeout: 3000 }),
    ).toBeTruthy();
  });
});
