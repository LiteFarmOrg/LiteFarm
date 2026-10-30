import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
const geocoderConfig = vi.hoisted(() => ({ searchAsYouType: true }));
vi.mock('../util/geocoding/geocoder', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../util/geocoding/geocoder')>()),
  get SEARCH_AS_YOU_TYPE() {
    return geocoderConfig.searchAsYouType;
  },
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
  return { dispatch, addressInput, nameInput, submit, ...view };
};

describe('MapLibre Add Farm page', () => {
  beforeEach(() => {
    geocoderConfig.searchAsYouType = true;
    vi.mocked(searchAddress).mockReset();
    vi.mocked(reverseCountry).mockReset();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

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

  it.each(['edit', 'unmount'])('cancels a pending reverse lookup on %s', async (action) => {
    vi.useFakeTimers();
    vi.mocked(searchAddress).mockResolvedValue([]);
    const { addressInput, unmount } = renderPage();
    fireEvent.change(addressInput(), { target: { value: '48.0048, 3.6651' } });
    if (action === 'edit') {
      fireEvent.change(addressInput(), { target: { value: 'New address' } });
    } else {
      unmount();
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(reverseCountry).not.toHaveBeenCalled();
  });

  it.each(['edit', 'unmount'])('aborts an in-flight reverse lookup on %s', async (action) => {
    vi.useFakeTimers();
    vi.mocked(searchAddress).mockResolvedValue([]);
    let resolveCountry: (country: string) => void = () => {};
    vi.mocked(reverseCountry).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCountry = resolve;
        }),
    );
    const { addressInput, unmount } = renderPage();
    fireEvent.change(addressInput(), { target: { value: '48.0048, 3.6651' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    const signal = vi.mocked(reverseCountry).mock.calls[0][2]?.signal;
    expect(signal?.aborted).toBe(false);
    if (action === 'edit') {
      fireEvent.change(addressInput(), { target: { value: 'New address' } });
    } else {
      unmount();
    }
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      resolveCountry('FR');
    });
    if (action === 'edit') expect(screen.getByTestId('preview').textContent).toBe('{}');
  });

  it('keeps a selected suggestion when an older reverse response arrives', async () => {
    vi.useFakeTimers();
    vi.mocked(searchAddress).mockResolvedValue([bristol]);
    let resolveCountry: (country: string) => void = () => {};
    vi.mocked(reverseCountry).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCountry = resolve;
        }),
    );
    const { addressInput, nameInput, submit } = renderPage();
    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: '48.0048, 3.6651' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    fireEvent.change(addressInput(), { target: { value: 'Bristol' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    fireEvent.mouseDown(screen.getAllByRole('option')[0]);
    await act(async () => {
      resolveCountry('FR');
    });
    expect(submit().disabled).toBe(false);
    expect(screen.getByTestId('preview').textContent).toBe(
      JSON.stringify({ lat: bristol.lat, lng: bristol.lng }),
    );
  });

  it.each([
    ['success', 'edit'],
    ['error', 'edit'],
    ['success', 'coordinates'],
    ['error', 'coordinates'],
    ['success', 'select'],
    ['error', 'select'],
  ])('ignores a stale geolocation %s after %s', async (outcome, action) => {
    vi.useFakeTimers();
    vi.mocked(searchAddress).mockResolvedValue([bristol]);
    vi.mocked(reverseCountry).mockResolvedValue('FR');
    const getCurrentPosition = vi.fn();
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
    const { addressInput, nameInput, submit, container } = renderPage();
    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: 'Bristol' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    fireEvent.click(container.querySelector('[data-cy="addFarm-mapPin"]')!);
    expect(screen.getByText('ADD_FARM.LOCATING')).toBeTruthy();
    if (action === 'edit') {
      fireEvent.change(addressInput(), { target: { value: 'New address' } });
    } else if (action === 'coordinates') {
      fireEvent.change(addressInput(), { target: { value: '48.0048, 3.6651' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
    } else {
      await act(async () => {
        fireEvent.mouseDown(screen.getAllByRole('option')[0]);
      });
    }
    expect(screen.queryByText('ADD_FARM.LOCATING')).toBeNull();
    expect(submit().disabled).toBe(action === 'edit');

    const lateCallback = () => {
      const [success, error] = getCurrentPosition.mock.calls[0];
      if (outcome === 'success') {
        success({ coords: { latitude: 50, longitude: 1 } });
      } else {
        error({ code: 1 });
      }
    };
    const expectedAddress =
      action === 'edit'
        ? 'New address'
        : action === 'coordinates'
          ? '48.0048, 3.6651'
          : bristol.label;
    const expectedPoints =
      action === 'edit'
        ? {}
        : action === 'coordinates'
          ? { lat: 48.0048, lng: 3.6651 }
          : { lat: bristol.lat, lng: bristol.lng };

    await act(async () => {
      lateCallback();
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(addressInput().value).toBe(expectedAddress);
    expect(screen.getByTestId('preview').textContent).toBe(JSON.stringify(expectedPoints));
    expect(reverseCountry).toHaveBeenCalledTimes(action === 'coordinates' ? 1 : 0);
    expect(screen.queryByText('ADD_FARM.DISABLE_GEO_LOCATION')).toBeNull();
    expect(submit().disabled).toBe(action === 'edit');

    fireEvent.click(container.querySelector('[data-cy="addFarm-mapPin"]')!);
    await act(async () => {
      lateCallback();
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(screen.getByText('ADD_FARM.LOCATING')).toBeTruthy();
    expect(addressInput().value).toBe(expectedAddress);
    expect(screen.getByTestId('preview').textContent).toBe(JSON.stringify(expectedPoints));
    expect(screen.queryByText('ADD_FARM.DISABLE_GEO_LOCATION')).toBeNull();
    expect(reverseCountry).toHaveBeenCalledTimes(action === 'coordinates' ? 1 : 0);
    expect(submit().disabled).toBe(action === 'edit');

    await act(async () => {
      const [success, error] = getCurrentPosition.mock.calls[1];
      if (outcome === 'success') {
        success({ coords: { latitude: 48.0048, longitude: 3.6651 } });
      } else {
        error({ code: 1 });
      }
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByText('ADD_FARM.LOCATING')).toBeNull();
    if (outcome === 'success') {
      expect(addressInput().value).toBe('48.0048, 3.6651');
      expect(screen.getByTestId('preview').textContent).toBe(
        JSON.stringify({ lat: 48.0048, lng: 3.6651 }),
      );
      expect(submit().disabled).toBe(false);
    } else {
      expect(addressInput().value).toBe(expectedAddress);
      expect(screen.getByText('ADD_FARM.DISABLE_GEO_LOCATION')).toBeTruthy();
      expect(submit().disabled).toBe(true);
    }
  });

  it('shows no-results feedback without enabling submission', async () => {
    vi.mocked(searchAddress).mockResolvedValue([]);
    const { addressInput, nameInput, submit } = renderPage();
    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: 'Unknown farm' } });
    expect(await screen.findByText('ADD_FARM.NO_ADDRESS_RESULTS')).toBeTruthy();
    expect(submit().disabled).toBe(true);
  });

  it('wraps keyboard selection, closes on Escape, and selects the active result on Enter', async () => {
    const second = { ...bristol, label: 'Second farm', lat: 52 };
    vi.mocked(searchAddress).mockResolvedValue([bristol, second]);
    const { addressInput } = renderPage();
    fireEvent.change(addressInput(), { target: { value: 'Bristol' } });
    await screen.findAllByRole('option');
    fireEvent.keyDown(addressInput(), { key: 'ArrowUp' });
    expect(screen.getAllByRole('option')[1].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(addressInput(), { key: 'ArrowDown' });
    expect(screen.getAllByRole('option')[0].getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(addressInput(), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(addressInput().getAttribute('aria-expanded')).toBe('false');
    fireEvent.keyDown(addressInput(), { key: 'ArrowUp' });
    fireEvent.keyDown(addressInput(), { key: 'Enter' });
    expect(addressInput().value).toBe(second.label);
    expect(screen.getByTestId('preview').textContent).toBe(
      JSON.stringify({ lat: 52, lng: bristol.lng }),
    );
    expect(reverseCountry).not.toHaveBeenCalled();
  });

  it('looks up the country for a suggestion that does not contain one', async () => {
    vi.mocked(searchAddress).mockResolvedValue([{ ...bristol, country: undefined }]);
    vi.mocked(reverseCountry).mockResolvedValue('GB');
    const { addressInput, nameInput, submit } = renderPage();
    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: 'Bristol' } });
    fireEvent.mouseDown((await screen.findAllByRole('option'))[0]);
    expect(submit().disabled).toBe(true);
    await waitFor(() => expect(submit().disabled).toBe(false));
    expect(reverseCountry).toHaveBeenCalledWith(bristol.lat, bristol.lng, {
      signal: expect.any(AbortSignal),
    });
  });

  it('keeps submission disabled and displays a validation error if reverse geocoding fails', async () => {
    vi.mocked(reverseCountry).mockRejectedValue(new Error('offline'));
    const { addressInput, nameInput, submit } = renderPage();
    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: '48, 3' } });
    expect(await screen.findByText('ADD_FARM.INVALID_FARM_LOCATION')).toBeTruthy();
    expect(screen.getByTestId('preview').textContent).toBe(JSON.stringify({ lat: 48, lng: 3 }));
    expect(submit().disabled).toBe(true);
  });

  it('requests browser location and resolves its country before allowing submission', async () => {
    const getCurrentPosition = vi.fn((success: (position: unknown) => void) =>
      success({ coords: { latitude: 0, longitude: 0 } }),
    );
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
    vi.mocked(reverseCountry).mockResolvedValue('GB');
    const { container, nameInput, addressInput, submit } = renderPage();
    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.click(container.querySelector('[data-cy="addFarm-mapPin"]')!);
    expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 10000,
    });
    await waitFor(() => expect(submit().disabled).toBe(false));
    expect(addressInput().value).toBe('0, 0');
    expect(reverseCountry).toHaveBeenCalledWith(0, 0, { signal: expect.any(AbortSignal) });
    expect(screen.queryByText('ADD_FARM.LOCATING')).toBeNull();
    expect(searchAddress).not.toHaveBeenCalled();
  });

  it('shows a geolocation error and resets the locating indicator on browser denial', async () => {
    const getCurrentPosition = vi.fn(
      (_success: (position: unknown) => void, failure: (error: unknown) => void) =>
        failure({ code: 1 }),
    );
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
    const { container, submit } = renderPage();
    fireEvent.click(container.querySelector('[data-cy="addFarm-mapPin"]')!);
    expect(await screen.findByText('ADD_FARM.DISABLE_GEO_LOCATION')).toBeTruthy();
    expect(screen.queryByText('ADD_FARM.LOCATING')).toBeNull();
    expect(submit().disabled).toBe(true);
    expect(reverseCountry).not.toHaveBeenCalled();
  });

  it('uses explicit Enter search for Nominatim and selects the first suggestion on a second Enter', async () => {
    geocoderConfig.searchAsYouType = false;
    vi.useFakeTimers();
    vi.mocked(searchAddress).mockResolvedValue([bristol]);
    const { addressInput, nameInput, submit } = renderPage();
    fireEvent.change(nameInput(), { target: { value: 'Test farm' } });
    fireEvent.change(addressInput(), { target: { value: 'Bristol' } });
    await act(async () => vi.advanceTimersByTimeAsync(1000));
    expect(searchAddress).not.toHaveBeenCalled();
    fireEvent.keyDown(addressInput(), { key: 'Enter' });
    await act(async () => {});
    expect(searchAddress).toHaveBeenCalledTimes(1);
    expect(searchAddress).toHaveBeenCalledWith('Bristol', { signal: expect.any(AbortSignal) });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.keyDown(addressInput(), { key: 'Enter' });
    await act(async () => {});
    expect(addressInput().value).toBe(bristol.label);
    expect(submit().disabled).toBe(false);
    expect(searchAddress).toHaveBeenCalledTimes(1);
  });

  it.each(['success', 'error'])(
    'ignores an older geolocation %s while the latest request is pending',
    async (outcome) => {
      vi.useFakeTimers();
      vi.mocked(reverseCountry).mockResolvedValue('FR');
      const getCurrentPosition = vi.fn();
      vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
      const { addressInput, container } = renderPage();
      fireEvent.click(container.querySelector('[data-cy="addFarm-mapPin"]')!);
      fireEvent.change(addressInput(), { target: { value: '48.0048, 3.6651' } });
      fireEvent.click(container.querySelector('[data-cy="addFarm-mapPin"]')!);
      expect(getCurrentPosition).toHaveBeenCalledTimes(2);

      await act(async () => {
        if (outcome === 'success') {
          getCurrentPosition.mock.calls[0][0]({ coords: { latitude: 50, longitude: 1 } });
        } else {
          getCurrentPosition.mock.calls[0][1]({ code: 1 });
        }
      });
      expect(screen.getByText('ADD_FARM.LOCATING')).toBeTruthy();
      expect(addressInput().value).toBe('48.0048, 3.6651');
      expect(screen.queryByText('ADD_FARM.DISABLE_GEO_LOCATION')).toBeNull();

      await act(async () => {
        if (outcome === 'success') {
          getCurrentPosition.mock.calls[1][0]({ coords: { latitude: 49, longitude: 2 } });
        } else {
          getCurrentPosition.mock.calls[1][1]({ code: 1 });
        }
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(screen.queryByText('ADD_FARM.LOCATING')).toBeNull();
      if (outcome === 'success') {
        expect(addressInput().value).toBe('49, 2');
        expect(screen.getByTestId('preview').textContent).toBe(JSON.stringify({ lat: 49, lng: 2 }));
      } else {
        expect(screen.getByText('ADD_FARM.DISABLE_GEO_LOCATION')).toBeTruthy();
      }
    },
  );
});
