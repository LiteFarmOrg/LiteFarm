import React, { lazy, Suspense } from 'react';
// import ConsentEnglish from '../../containers/Consent/locales/en/Owner.Consent.md';

const Button = lazy(() => import('../../components/Form/Button'));
const PureConsent = lazy(() => import('../../components/Consent'));
export default {
  title: 'Bugs/suspenseTypeError',
  decorators: [(story) => <Suspense fallback={'loading'}>{story()}</Suspense>],
  component: Button,
};

const Template = (args) => <Button {...args} />;

export const LazyLoadedButton = Template.bind({});
LazyLoadedButton.args = {
  children: 'Lazy loaded',
};

export const I18Lazyload = ({ ...args }) => (
  <Suspense fallback="loading">
    <PureConsent {...args} />
  </Suspense>
);

I18Lazyload.args = {
  onSubmit: () => {},
  onGoBack: () => {},
  checkboxArgs: { label: 'I Agree' },
  // TODO: import consent when https://github.com/storybookjs/storybook/issues/11981#issuecomment-673562202 is fixed
  // consent: <ConsentEnglish />,
};
I18Lazyload.parameters = {
  chromatic: { disable: true },
};
LazyLoadedButton.parameters = {
  chromatic: { disable: true },
};
