import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import CropStatusInfoBox from '../../components/CropCatalogue/CropStatusInfoBox';
import { AddLink, Semibold, Text, Underlined } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { cropsSelector } from '../cropSlice';
import useCropTileListGap from '../../components/CropTile/useCropTileListGap';
import PureCropTile from '../../components/CropTile';
import PureCropTileContainer from '../../components/CropTile/CropTileContainer';
import React, { useEffect, useState } from 'react';
import { getCropsAndManagementPlans } from '../saga';
import MuiFullPagePopup from '../../components/MuiFullPagePopup/v2';
import CropCatalogueFilterPage from '../Filter/CropCatalogue';
import {
  cropCatalogueFilterDateSelector,
  cropCatalogueFilterSelector,
  isFilterCurrentlyActiveSelector,
  setCropCatalogueFilterDate,
  resetCropCatalogueFilter,
} from '../filterSlice';
import { isAdminSelector } from '../userFarmSlice';
import useCropCatalogue from './useCropCatalogue';
import useStringFilteredCrops from './useStringFilteredCrops';
import useSortByCropTranslation from './useSortByCropTranslation';
import {
  resetAndUnLockFormData,
  setPersistedPaths,
} from '../hooks/useHookFormPersist/hookFormPersistSlice';
import CatalogSpotlight from './CatalogSpotlight';
import ActiveFilterBox from '../../components/ActiveFilterBox';
import { useStartAddCropVarietyFlow } from '../CropVarieties/useStartAddCropVarietyFlow';

export default function CropCatalogue({ history }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);
  const { active, abandoned, planned, completed, noPlans, sum, cropCatalogue, filteredCropsWithoutManagementPlan } =
    useCropCatalogue(filterString);
  const crops = useStringFilteredCrops(
    useSortByCropTranslation(useSelector(cropsSelector)),
    filterString,
  );
  const { ref: containerRef, gap, padding, cardWidth } = useCropTileListGap([sum, crops.length]);
  useEffect(() => {
    dispatch(getCropsAndManagementPlans());
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

  const { onAddCropVariety } = useStartAddCropVarietyFlow();
  const onAddCrop = () => {
    dispatch(
      setPersistedPaths([
        '/crop/new',
        '/crop/new/add_crop_variety',
        '/crop/new/add_crop_variety/compliance',
      ]),
    );
    history.push('/crop/new');
  };
  const resetFilter = () => dispatch(resetCropCatalogueFilter());
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
        <div style={{ marginBottom: '32px' }}>
          <ActiveFilterBox pageFilter={cropCatalogueFilter} pageFilterKey={'cropCatalogue'} />
          <div style={{ marginTop: '12px' }}>
            <Underlined style={{ color: '#AA5F04' }} onClick={resetFilter}>
              {t('FILTER.CLEAR_ALL_FILTERS')}
            </Underlined>
          </div>
        </div>
      )}

      <div ref={containerRef}>
        {sum + filteredCropsWithoutManagementPlan.length ? (
          <>
            <PageBreak style={{ paddingBottom: '16px' }} label={t('CROP_CATALOGUE.ON_YOUR_FARM')} />
            <CropStatusInfoBox
              status={{ active, abandoned, completed, planned, noPlans }}
              style={{ marginBottom: '16px' }}
              date={date}
              setDate={setDate}
            />
            <PureCropTileContainer gap={gap} padding={padding}>
              {filteredCropsWithoutManagementPlan.map((cropVariety) => {
                const { crop_translation_key, crop_photo_url, crop_id, noPlansCount } = cropVariety;
                const imageKey = cropVariety.crop_translation_key?.toLowerCase();

                return (
                  <PureCropTile
                    key={crop_id}
                    title={t(`crop:${crop_translation_key}`)}
                    src={crop_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => history.push(`/crop_varieties/crop/${cropVariety.crop_id}`)}
                    cropCount={{
                      noPlans: noPlansCount,
                    }}
                  />
                );
              })}
              {cropCatalogue.map((cropCatalog) => {
                const {
                  crop_translation_key,
                  active,
                  abandoned,
                  planned,
                  completed,
                  imageKey,
                  crop_photo_url,
                  crop_id,
                  needsPlan,
                } = cropCatalog;

                return (
                  <PureCropTile
                    key={crop_translation_key}
                    cropCount={{
                      active: active.length,
                      abandoned: abandoned.length,
                      planned: planned.length,
                      completed: completed.length,
                      noPlans: cropCatalog?.noPlans?.length,
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
        ) : (
          isFilterCurrentlyActive && (
            <Semibold style={{ color: 'var(--teal700)' }}>
              {t('CROP_CATALOGUE.NO_RESULTS_FOUND')}
            </Semibold>
          )
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
                    const imageKey = crop_translation_key?.toLowerCase();
                    return (
                      <PureCropTile
                        key={crop.crop_id}
                        title={t(`crop:${crop_translation_key}`)}
                        src={crop.crop_photo_url}
                        alt={imageKey}
                        style={{ width: cardWidth }}
                        isCropTemplate
                        onClick={() => {
                          onAddCropVariety(crop.crop_id);
                        }}
                      />
                    );
                  })}
                </PureCropTileContainer>
              </>
            )}
            <Text style={{ paddingBottom: '8px' }}>{t('CROP_CATALOGUE.CAN_NOT_FIND')}</Text>
            <AddLink data-cy="crop-addLink" onClick={onAddCrop}>
              {t('CROP_CATALOGUE.ADD_CROP')}
            </AddLink>
          </>
        )}
      </div>
    </Layout>
  );
}
