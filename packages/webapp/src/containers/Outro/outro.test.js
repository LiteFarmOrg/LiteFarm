import React from 'react';
import { render, fireEvent, screen } from '../../tests/utils';
import Outro from './index'
import '@testing-library/jest-dom'
import { createStore } from 'redux'
import { act } from "@testing-library/react";
import { FINISH_ONBOARDING } from "./constants";

const baseReducer = {
    users: {},
    farm: { role_id: 1 }
  }

describe('Outro Container', () => {

  it('should render properly given correct store', () => {
    render(<Outro/>, {initialState: {baseReducer}});
    expect(screen.getByText(/Finish/i)).toBeDefined();
    expect(screen.getByText(/Go back/i)).toBeDefined();
  })

  it('should dispatch action when clicking finish', async () => {
    let store = createStore((state) => ({...state} ), {baseReducer});
    store.dispatch = jest.fn();
    act(()=> {
      render(<Outro/>, { store });
    });
    act(() => {
      fireEvent.click(screen.getByText(/Finish/i));
    });
    act(() => {
      fireEvent.submit(screen.getByText(/Finish/i));
    });

    expect(store.dispatch).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith( {
        type: FINISH_ONBOARDING,
      }
    );
  })

  it('should dispatch action when clicking back', async () => {
    let store = createStore((state) => ({...state} ), {baseReducer});
    store.dispatch = jest.fn();
    act(()=> {
      render(<Outro/>, { store });
    });
    act(() => {
      fireEvent.click(screen.getByText(/Go back/i));
    });
    act(() => {
      fireEvent.submit(screen.getByText(/Go back/i));
    });

    // expect(store.dispatch).toHaveBeenCalled();
  })

})