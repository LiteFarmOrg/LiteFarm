import React from 'react';
import { fireEvent, render, screen } from '../../tests/utils';
import ConsentForm from './index';
import '@testing-library/jest-dom'
import { createStore } from 'redux'
import { act } from '@testing-library/react';
import { UPDATE_AGREEMENT } from '../constants';

const baseReducer = {
  users: {},
  farm: { role_id: 1 }
}

describe('Consent Container', () => {

  it('should render properly given correct store', () => {
    render(<ConsentForm/>, { initialState: { baseReducer } });
    expect(screen.getByText(/i agree/i)).toBeDefined();
  })

  it('should show disabled continue button at 1st render', () => {
    render(<ConsentForm/>, { initialState: { baseReducer } });
    expect(screen.getByText(/continue/i)).toHaveAttribute('disabled')
  })

  it('should enable button upon selecting checkbox', () => {
    render(<ConsentForm/>, { initialState: { baseReducer } });
    expect(screen.getByText(/continue/i)).toHaveAttribute('disabled')
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByText(/continue/i)).not.toHaveAttribute('disabled')
  })

  it('should dispatch action when clicking continue', async () => {
    let store = createStore((state) => ({...state} ), { baseReducer });
    store.dispatch = jest.fn();
    act(()=> {
      render(<ConsentForm/>, { store });
    })
    act(() => {
      fireEvent.click(screen.getByRole('checkbox'));
    });
    await act(() => {
      fireEvent.submit(screen.getByText(/continue/i));
    })

    expect(store.dispatch).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith( {
        type: UPDATE_AGREEMENT,
        consent_bool: { consent: true },
        consent_version: '3.0',
      }
    );
  })
})
