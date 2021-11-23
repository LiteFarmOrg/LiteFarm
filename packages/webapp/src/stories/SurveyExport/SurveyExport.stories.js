import React from 'react';
import RenderSurvey from '../../containers/RenderSurvey/RenderSurvey';
import decorators from '../Pages/config/decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/RenderSurvey',
  decorators,
  component: RenderSurvey,
};

const Template = (args) => {
  window.data = {
    questionAnswerMap: {
      'sinetgubg ksiafuaisasd asidufhsdg asdfuhsdg asdfuhsdg  safusdag': 'ASjj AOSIDJ woeitj aoij ASF ASOIj  aetA SOifAJET OAISJF oqwjroG AEOtjwoeitj ASF oijweto jSF OWIEJToi wjsDF',
      '2sinetgubg ksiafuaisasd asidufhsdg asdfuhsdg asdfuhsdg  safusdag': 'ASjj AOSIDJ woeitj aoij ASF ASOIj  aetA SOifAJET OAISJF oqwjroG AEOtjwoeitj ASF oijweto jSF OWIEJToi wjsDF',
    },
    certifier: { certifier_name: 'certifier_name' },
    organicCertifierSurvey: {
      requested_certification: 'requested_certification',
      requested_certifier: 'requested_certifier',
      certification: { certification_translation_key: 'ORGANIC' },
    },
  };
  return <RenderSurvey {...args} />;
};

export const Primary = Template.bind({});
Primary.args = {};

Primary.parameters = {
  ...chromaticSmallScreen,
};
