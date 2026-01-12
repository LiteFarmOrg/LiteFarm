import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { barnEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import locationDetailStyles from '../../styles.module.scss';
import RadioGroup from '../../../Form/RadioGroup';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureBarnWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureBarn {...props} />
    </PersistedFormWrapper>
  );
}

export function PureBarn({
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  persistedFormData,
  useHookFormPersist,
  handleRetire,
  isAdmin,
}) {
  const onSubmit = (data) => {
    const washPackSelection = data[barnEnum.wash_and_pack];
    const coldStorage = data[barnEnum.cold_storage];
    const usedForAnimals = data[barnEnum.used_for_animals];
    data[barnEnum.total_area_unit] = data[barnEnum.total_area_unit]?.value;
    data[barnEnum.perimeter_unit] = data[barnEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      type: 'barn',
      wash_and_pack: washPackSelection,
      cold_storage: coldStorage,
      used_for_animals: usedForAnimals,
    });
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      system={system}
      locationType={'barn'}
      locationCategory={'area'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'BARN'}
      detailsChildren={<BarnDetailChildren isViewLocationPage={isViewLocationPage} />}
      showPerimeter={false}
    />
  );
}

export function BarnDetailChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  return (
    <>
      <div>
        <div className={locationDetailStyles.radioLabel}>
          <Label>{t('FARM_MAP.BARN.WASH_PACK')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={barnEnum.wash_and_pack}
            hookFormControl={control}
          />
        </div>
      </div>
      <div>
        <div className={locationDetailStyles.radioLabel}>
          <Label>{t('FARM_MAP.BARN.COLD_STORAGE')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={barnEnum.cold_storage}
            hookFormControl={control}
          />
        </div>
      </div>
      <div>
        <div className={locationDetailStyles.radioLabel}>
          <Label>{t('FARM_MAP.BARN.ANIMALS')}</Label>
          <Label sm>{t('common:OPTIONAL')}</Label>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <RadioGroup
            row
            disabled={isViewLocationPage}
            name={barnEnum.used_for_animals}
            hookFormControl={control}
          />
        </div>
      </div>
    </>
  );
}
