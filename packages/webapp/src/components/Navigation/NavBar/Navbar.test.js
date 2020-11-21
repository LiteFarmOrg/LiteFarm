import React from 'react';
import {render, fireEvent, screen, act} from '@testing-library/react'
import PureNavBar  from "./index";
import '@testing-library/jest-dom';


describe('Navbar view', () => {
  beforeAll(() => {
  })
  it('should renders correctly with non required props', () => {
    render(<PureNavBar />);
    expect(screen.getAllByRole('button')).toBeDefined(); // Icons are buttons
    expect(screen.getAllByRole('button').length).toBe(3);
  })

  it('should  open profile if click is performed on profile icon', () => {
    render(<PureNavBar />);
    screen.getByTestId('thirdStep').click();
    expect(screen.getByText(/Log out/i)).toBeVisible();
    expect(screen.getByText(/help/i)).toBeVisible();
    expect(screen.getByText(/switch farm/i)).toBeVisible();
    expect(screen.getByText(/my info/i)).toBeVisible();
  })

  it('should close profile if click is performed on icon', () => {
    render(<PureNavBar />);
    screen.getByTestId('thirdStep').click();
    expect(screen.getByText(/Log out/i)).toBeVisible();
    screen.getByTestId('thirdStep').click();
    expect(screen.getByText(/Log out/i)).not.toBeVisible();
    expect(screen.getByText(/help/i)).not.toBeVisible();
    expect(screen.getByText(/switch farm/i)).not.toBeVisible();
    expect(screen.getByText(/my info/i)).not.toBeVisible();
  })
})
