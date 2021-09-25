import Layout from '../../../components/Layout';
import PageTitle from '../../../components/PageTitle/v2';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { salesSelector } from '../selectors';
import WholeFarmRevenue from '../../../components/Finances/WholeFarmRevenue';
import { AddLink, Semibold } from '../../../components/Typography';
import DateRangePicker from '../../../components/Form/DateRangePicker';
import ActualCropRevenue from '../ActualCropRevenue';

export default function ActualRevenue({ history, match }) {
  const { t } = useTranslation();
  const onGoBack = () => history.goBack();
  const onAddRevenue = () => history.push(`/add_sale`);
  // TODO: refactor sale data after finance reducer is remade
  const sales = useSelector(salesSelector);
  console.log({ sales });

  // const {
  //   register,
  //   getValues,
  //   control,
  //   formState: { errors, isValid },
  // } = useForm({
  //   mode: 'onChange',
  //   shouldUnregister: true,
  //   defaultValues: {
  //     // from_date: '2021-09-13',
  //     // to_date: new Date(new Date().getFullYear(), 11, 31),
  //   }
  // });

  return (
    <Layout>
      <PageTitle
        title={t('FINANCES.ACTUAL_REVENUE.TITLE')}
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
      />

      <WholeFarmRevenue amount={600} style={{ marginBottom: '14px' }} />
      <AddLink onClick={onAddRevenue} style={{ marginBottom: '32px' }}>
        {t('FINANCES.ACTUAL_REVENUE.ADD_REVENUE')}
      </AddLink>

      <Semibold style={{ marginBottom: '24px' }} sm>
        {t('FINANCES.ACTUAL_REVENUE.VIEW_WITHIN_DATE_RANGE')}
      </Semibold>
      {/* <DateRangePicker
        register={register}
        control={control}
        getValues={getValues}
      /> */}

      {sales.map((sale) => (
        <ActualCropRevenue key={sale.sale_id} sale={sale} style={{ marginBottom: '16px' }} />
      ))}
    </Layout>
  );
}
