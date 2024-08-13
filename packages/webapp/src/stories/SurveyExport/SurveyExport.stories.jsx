import React from 'react';
import RenderSurvey from '../../containers/RenderSurvey/RenderSurvey';
import decorators from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/RenderSurvey',
  decorators,
  component: RenderSurvey,
};

const PrimaryTemplate = (args) => {
  window.data = {
    questionAnswerMap: {
      'sinetgubg ksiafuaisasd asidufhsdg asdfuhsdg asdfuhsdg  safusdag':
        'ASjj AOSIDJ woeitj aoij ASF ASOIj  aetA SOifAJET OAISJF oqwjroG AEOtjwoeitj ASF oijweto jSF OWIEJToi wjsDF',
      '2sinetgubg ksiafuaisasd asidufhsdg asdfuhsdg asdfuhsdg  safusdag':
        'ASjj AOSIDJ woeitj aoij ASF ASOIj  aetA SOifAJET OAISJF oqwjroG AEOtjwoeitj ASF oijweto jSF OWIEJToi wjsDF',
    },
    certifier: { certifier_name: 'certifier_name' },
    certification: { certification_translation_key: 'ORGANIC' },
    organicCertifierSurvey: {
      requested_certification: 'requested_certification',
      requested_certifier: 'requested_certifier',
    },
  };
  return <RenderSurvey {...args} />;
};

export const Primary = PrimaryTemplate.bind({});
Primary.args = {};

Primary.parameters = {
  ...chromaticSmallScreen,
};

const SecondaryTemplate = (args) => {
  window.data = {
    questionAnswerMap: {
      'sinetgubg ksiafuaisasd asidufhsdg asdfuhsdg asdfuhsdg  safusdag':
        'ASjj AOSIDJ woeitj aoij ASF ASOIj  aetA SOifAJET OAISJF oqwjroG AEOtjwoeitj ASF oijweto jSF OWIEJToi wjsDF',
      '2sinetgubg ksiafuaisasd asidufhsdg asdfuhsdg asdfuhsdg  safusdag':
        'ASjj AOSIDJ woeitj aoij ASF ASOIj  aetA SOifAJET OAISJF oqwjroG AEOtjwoeitj ASF oijweto jSF OWIEJToi wjsDF',
    },
    organicCertifierSurvey: {
      requested_certification: 'requested_certification',
      requested_certifier: 'requested_certifier',
    },
  };
  return <RenderSurvey {...args} />;
};

export const Secondary = SecondaryTemplate.bind({});
Secondary.args = {};

Secondary.parameters = {
  ...chromaticSmallScreen,
};
