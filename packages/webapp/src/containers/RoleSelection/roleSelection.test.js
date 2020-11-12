import React from 'react';
import { render, fireEvent, screen } from '../../tests/utils';
import RoleSelection from './index'
import '@testing-library/jest-dom'
import { createStore } from 'redux'
import { act } from "@testing-library/react";
import { FINISH_STEP_TW0 } from "./constants";

const baseReducer = {
    users: {},
    farm: { role_id: 1 }
  }

describe('RoleSelection Container', () => {

  it('should render properly given correct store', () => {
    render(<RoleSelection/>, {initialState: {baseReducer}});
    expect(screen.getByText(/Continue/i)).toBeDefined();
  })

  it('should dispatch action when clicking continue', async () => {
    let store = createStore((state) => ({...state} ), {baseReducer});
    store.dispatch = jest.fn();
    act(()=> {
      render(<RoleSelection/>, { store });
    });
    act(() => {
      fireEvent.click(screen.getByRole('button'));
    });
    act(() => {
      fireEvent.submit(screen.getByText(/Continue/i));
    });

    expect(store.dispatch).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith( {
        type: FINISH_STEP_TW0,
      }
    );
  })
})