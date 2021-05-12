import Layout from "../Layout";
import CropHeader from "./cropHeader";
import RouterTab from "../RouterTab";
import React from "react";
import { Semibold, Underlined } from "../Typography";


function PureCropManagement({ history, match={params: {crop_id: 2}}, crop}) {
  // const t = useTranslation();
  return (
    <Layout>
      <CropHeader {...crop} />
      <RouterTab
        classes={{ container: { margin: '6px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={[
          {
            label: 'Management',
            // label: t('CROP_DETAIL.MANAGEMENT_TAB'),
            path: `/crop/${match.params.crop_id}/plan`,
          },
          {
            label: 'Details',
            // label: t('CROP_DETAIL.DETAIL_TAB'),
            path: `/crop/${match.params.crop_id}/details`,
          },
        ]}
      />
      <Semibold style={{marginBottom: '16px'}}>Management Plans</Semibold>
      <Underlined>+ Add a plan</Underlined>
    </Layout>
  )
}

export default PureCropManagement;