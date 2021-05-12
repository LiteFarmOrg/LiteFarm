import Layout from "../Layout";
import CropHeader from "./cropHeader";
import RouterTab from "../RouterTab";
import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../Form/Button";
import { ReactComponent as Leaf } from '../../assets/images/signUp/leaf.svg';
import { ReactComponent as Expense } from '../../assets/images/fieldCrops/expense.svg';
import { ReactComponent as Document } from '../../assets/images/fieldCrops/Document.svg';
import { Main } from "../Typography";
import Checkbox from "../Form/Checkbox";
import Radio from "../Form/Radio";

function PureCropDetail({ history, match={params: {crop_id: 2}}, crop}) {
  const { t } = useTranslation();
  return (
    <Layout buttonGroup={(
      <>
        <Button color={'secondary'} fullLength>Edit</Button>
        <Button fullLength>Copy</Button>
      </>
    )}>
      <CropHeader {...crop} />
      <RouterTab
        classes={{ container: { margin: '24px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={[
          {
            label: t('CROP_DETAIL.MANAGEMENT_TAB'),
            path: `/crop/${match.params.crop_id}/management`,
          },
          {
            label: t('CROP_DETAIL.DETAIL_TAB'),
            path: `/crop/${match.params.crop_id}/detail`,
          },
        ]}
      />
      <Button style={{marginBottom: '16px', width: '100%' }} color={'success'}>
        <Expense style={{ marginRight: '8px'}} />Expense records  <Leaf style={{ marginLeft: '14px'}}  />
      </Button>
      <Button style={{marginBottom: '32px', width: '100%'}} color={'success'}>
        <Document style={{ marginRight: '1px'}} /> Compliance Documents <Leaf style={{ marginLeft: '14px'}}  />
      </Button>

      <Main style={{marginBottom: '28px'}}>Organic Compliance</Main>
      <Checkbox style={{marginBottom: '12px'}} label={'Certified Organic'}/>
      <Checkbox style={{marginBottom: '12px'}} label={'Non-GMO'}/>
      <Checkbox style={{marginBottom: '28px'}} label={'Non-treated'}/>

      <Main style={{marginBottom: '28px'}}>Annual/Perennial</Main>
      <Radio style={{marginBottom: '24px'}}label={'Annual'} />
      <Radio style={{marginBottom: '24px'}} label={'Perennial'} />
    </Layout>
  )
}

export default PureCropDetail;