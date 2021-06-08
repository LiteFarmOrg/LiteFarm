import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import CropStatusInfoBox from '../../components/CropCatalogue/CropStatusInfoBox';
import { AddLink, Text } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { cropsSelector } from '../cropSlice';
import { cropsWithVarietyWithoutManagementPlanSelector } from '../managementPlanSlice';
import useCropTileListGap from '../../components/CropTile/useCropTileListGap';
import PureCropTile from '../../components/CropTile';
import PureCropTileContainer from '../../components/CropTile/CropTileContainer';
import React, { useEffect, useState } from 'react';
import { getCrops, getCropVarieties, getManagementPlans } from '../saga';
import MuiFullPagePopup from '../../components/MuiFullPagePopup/v2';
import CropCatalogueFilterPage from '../Filter/CropCatalogue';
import {
  cropCatalogueFilterDateSelector,
  cropCatalogueFilterSelector,
  setCropCatalogueFilterDate,
  isFilterCurrentlyActiveSelector,
} from '../filterSlice';
import { isAdminSelector } from '../userFarmSlice';
import useCropCatalogue from './useCropCatalogue';
import useStringFilteredCrops from './useStringFilteredCrops';
import useSortByCropTranslation from './useSortByCropTranslation';
import { resetAndUnLockFormData } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import useFilterNoPlan from './useFilterNoPlan';
import CatalogSpotlight from './CatalogSpotlight';
import ActiveFilterBox from '../../components/ActiveFilterBox';

export default function CropCatalogue({ history }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);
  const { active, planned, past, sum, cropCatalogue } = useCropCatalogue(filterString);
  const crops = useStringFilteredCrops(
    useSortByCropTranslation(useSelector(cropsSelector)),
    filterString,
  );
  const filteredCropVarietiesWithoutManagementPlan = useFilterNoPlan(cropCatalogue, filterString);
  const { ref: containerRef, gap, padding, cardWidth } = useCropTileListGap([sum, crops.length]);
  useEffect(() => {
    dispatch(getCropVarieties());
    dispatch(getCrops());
    dispatch(getManagementPlans());
  }, []);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const onFilterClose = () => {
    setIsFilterOpen(false);
  };
  const onFilterOpen = () => {
    setIsFilterOpen(true);
  };

  const date = useSelector(cropCatalogueFilterDateSelector);
  const setDate = (date) => dispatch(setCropCatalogueFilterDate(date));

  const cropCatalogueFilter = useSelector(cropCatalogueFilterSelector);
  const isFilterCurrentlyActive = useSelector(isFilterCurrentlyActiveSelector('cropCatalogue'));

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

  return (
    <Layout classes={{ container: { backgroundColor: 'white' } }}>
      <PageTitle title={t('CROP_CATALOGUE.CROP_CATALOGUE')} style={{ paddingBottom: '20px' }} />
      <div style={{ position: 'relative' }}>
        <PureSearchbarAndFilter
          onFilterOpen={onFilterOpen}
          value={filterString}
          onChange={filterStringOnChange}
          isFilterActive={isFilterCurrentlyActive}
        />
        <CatalogSpotlight />
      </div>

      <MuiFullPagePopup open={isFilterOpen} onClose={onFilterClose}>
        <CropCatalogueFilterPage onGoBack={onFilterClose} />
      </MuiFullPagePopup>

      {isFilterCurrentlyActive && (
        <ActiveFilterBox
          pageFilter={cropCatalogueFilter}
          pageFilterKey={'cropCatalogue'}
          style={{ marginBottom: '32px' }}
        />
      )}

      <div ref={containerRef}>
        {!!(sum + filteredCropVarietiesWithoutManagementPlan.length) && (
          <>
            <PageBreak style={{ paddingBottom: '16px' }} label={t('CROP_CATALOGUE.ON_YOUR_FARM')} />
            <CropStatusInfoBox
              status={{ active, past, planned }}
              style={{ marginBottom: '16px' }}
              date={date}
              setDate={setDate}
            />
            <PureCropTileContainer gap={gap} padding={padding}>
              {filteredCropVarietiesWithoutManagementPlan.map((cropVariety) => {
                const { crop_translation_key, crop_photo_url, crop_id } = cropVariety;
                const imageKey = cropVariety.crop_translation_key?.toLowerCase();
                return (
                  <PureCropTile
                    key={crop_id}
                    title={t(`crop:${crop_translation_key}`)}
                    src={crop_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => history.push(`/crop_varieties/crop/${cropVariety.crop_id}`)}
                    needsPlan
                  />
                );
              })}
              {cropCatalogue.map((cropCatalog) => {
                const {
                  crop_translation_key,
                  active,
                  planned,
                  past,
                  needsPlan,
                  imageKey,
                  crop_photo_url,
                } = cropCatalog;
                return (
                  <PureCropTile
                    key={crop_translation_key}
                    cropCount={{
                      active: active.length,
                      planned: planned.length,
                      past: past.length,
                    }}
                    needsPlan={needsPlan}
                    title={t(`crop:${crop_translation_key}`)}
                    src={crop_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => history.push(`/crop_varieties/crop/${cropCatalog.crop_id}`)}
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}
        {isAdmin && !isFilterCurrentlyActive && (
          <>
            {!!crops?.length && (
              <>
                <PageBreak
                  style={{ paddingBottom: '16px' }}
                  label={t('CROP_CATALOGUE.ADD_TO_YOUR_FARM')}
                />
                <PureCropTileContainer gap={gap} padding={padding}>
                  {crops.map((crop) => {
                    const { crop_translation_key } = crop;
                    const imageKey = crop_translation_key.toLowerCase();
                    return (
                      <PureCropTile
                        key={crop.crop_id}
                        title={t(`crop:${crop_translation_key}`)}
                        src={crop.crop_photo_url}
                        alt={imageKey}
                        style={{ width: cardWidth }}
                        isCropTemplate
                        onClick={() => {
                          history.push(`/crop/${crop.crop_id}/add_crop_variety`);
                        }}
                      />
                    );
                  })}
                </PureCropTileContainer>
              </>
            )}
            <Text style={{ paddingBottom: '8px' }}>{t('CROP_CATALOGUE.CAN_NOT_FIND')}</Text>
            <AddLink onClick={() => history.push('/crop/new')}>
              {t('CROP_CATALOGUE.ADD_CROP')}
            </AddLink>
          </>
        )}
      </div>
    </Layout>
  );
}
