import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import PureConsent from './index';
describe('Consent View', () => {
  beforeAll(() => {
    // To get rid of useless error message until better solution
    // https://github.com/jsdom/jsdom/issues/1937
    const tempErrorFn = console.error;
    console.error = (message, optionalParams) => {
      if (!message.includes('Not implemented')) {
        tempErrorFn(message, optionalParams);
      }
    };
  });
  it('renders correctly with given props', () => {
    const fakeFunc = jest.fn();
    render(
      <PureConsent
        onSubmit={fakeFunc}
        onGoBack={fakeFunc}
        checkboxArgs={{}}
        text={'PureConsentTest'}
        disabled={false}
      />,
    );
    expect(screen.queryByText('PureConsentTest')).toBeDefined();
  });

  it('calls on submit when continue button is clicked', () => {
    const mockSubmit = jest.fn();
    const mockGoBack = jest.fn();
    render(
      <PureConsent
        onSubmit={mockSubmit}
        onGoBack={mockGoBack}
        checkboxArgs={{}}
        text={'Terms'}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByText(/continue/i));
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('calls on go back when go back button is clicked', () => {
    const mockGoBack = jest.fn();
    const mockSubmit = jest.fn();
    render(
      <PureConsent
        onSubmit={mockSubmit}
        onGoBack={mockGoBack}
        checkboxArgs={{}}
        text={'Terms'}
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByText(/go back/i));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('disables continue button if disabled prop is true', () => {
    const mockSubmit = jest.fn();
    const mockGoBack = jest.fn();
    render(
      <PureConsent
        onSubmit={mockSubmit}
        onGoBack={mockGoBack}
        checkboxArgs={{}}
        text={'Terms'}
        disabled={true}
      />,
    );
    fireEvent.click(screen.getByText(/continue/i));
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
