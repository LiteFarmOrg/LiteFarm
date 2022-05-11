import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import { AddLink, Semibold } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { cropSelector } from '../cropSlice';
import {
  cropVarietiesWithoutManagementPlanByCropIdSelector,
  currentCropVarietiesByCropIdSelector,
  expiredCropVarietiesByCropIdSelector,
  plannedCropVarietiesByCropIdSelector,
} from '../managementPlanSlice';
import useCropTileListGap from '../../components/CropTile/useCropTileListGap';
import PureCropTile from '../../components/CropTile';
import PureCropTileContainer from '../../components/CropTile/CropTileContainer';
import { useEffect, useState } from 'react';
import { getCropVarieties } from '../saga';
import MuiFullPagePopup from '../../components/MuiFullPagePopup/v2';
import {
  cropCatalogueFilterDateSelector,
  cropVarietyFilterSelector,
  isFilterCurrentlyActiveSelector,
  setCropCatalogueFilterDate,
  setCropVarietyFilterDefault,
  // cropCatalogueFilterSelector
} from '../filterSlice';
import { isAdminSelector } from '../userFarmSlice';
import useStringFilteredCrops from '../CropCatalogue/useStringFilteredCrops';
import useSortByVarietyName from './useSortByVarietyName';
import { resetAndUnLockFormData } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import CropVarietyFilterPage from '../Filter/CropVariety';
import ActiveFilterBox from '../../components/ActiveFilterBox';
import useFilterVarieties from '../CropCatalogue/useFilterVarieties';
import { ACTIVE, COMPLETE, NEEDS_PLAN, PLANNED } from '../Filter/constants';
import { useStartAddCropVarietyFlow } from './useStartAddCropVarietyFlow';
import useCropVarietyCatalogue from './useCropVarietyCatalogue';
import CropStatusInfoBox from '../../components/CropCatalogue/CropStatusInfoBox';

export default function CropVarieties({ history, match }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();
  const crop_id = Number(match.params.crop_id);
  const crop = useSelector(cropSelector(crop_id));

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);

  const cropCatalogueFilter = useSelector(cropVarietyFilterSelector(crop_id));
  const isFilterCurrentlyActive = useSelector(isFilterCurrentlyActiveSelector(crop_id));

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

  const { active, planned, past, sum, cropCatalogue, filteredCropsWithoutManagementPlan } =
    useCropVarietyCatalogue(filterString, crop_id);

  const cropVarietiesWithoutManagementPlan = useFilterVarieties(
    useStringFilteredCrops(
      useSortByVarietyName(
        useSelector(cropVarietiesWithoutManagementPlanByCropIdSelector(crop_id)),
      ),
      filterString,
    ),
    crop_id,
    NEEDS_PLAN,
  );
  const currentCropVarieties = useFilterVarieties(
    useStringFilteredCrops(
      useSortByVarietyName(useSelector(currentCropVarietiesByCropIdSelector(crop_id))),
      filterString,
    ),
    crop_id,
    ACTIVE,
  );
  const plannedCropVarieties = useFilterVarieties(
    useStringFilteredCrops(
      useSortByVarietyName(useSelector(plannedCropVarietiesByCropIdSelector(crop_id))),
      filterString,
    ),
    crop_id,
    PLANNED,
  );
  const expiredCropVarieties = useFilterVarieties(
    useStringFilteredCrops(
      useSortByVarietyName(useSelector(expiredCropVarietiesByCropIdSelector(crop_id))),
      filterString,
    ),
    crop_id,
    COMPLETE,
  );

  const {
    ref: containerRef,
    gap,
    padding,
    cardWidth,
  } = useCropTileListGap([cropCatalogue.length, filteredCropsWithoutManagementPlan.length]);
  useEffect(() => {
    dispatch(getCropVarieties());
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

  const onGoBack = () => history.push('/crop_catalogue');

  const goToVarietyManagement = (varietyId) => {
    history.push(`/crop/${varietyId}/management`);
  };

  const { onAddCropVariety } = useStartAddCropVarietyFlow();
  const goToVarietyCreation = () => {
    onAddCropVariety(crop_id);
  };

  return (
    <Layout>
      <PageTitle
        title={`${t(`crop:${crop.crop_translation_key}`)} ${t('CROP_VARIETIES.CROP_VARIETIES')}`}
        style={{ paddingBottom: '20px' }}
        onGoBack={onGoBack}
      />
      <PureSearchbarAndFilter
        onFilterOpen={onFilterOpen}
        value={filterString}
        onChange={filterStringOnChange}
      />
      <MuiFullPagePopup open={isFilterOpen} onClose={onFilterClose}>
        <CropVarietyFilterPage cropId={crop_id} onGoBack={onFilterClose} />
      </MuiFullPagePopup>

      {isFilterCurrentlyActive && (
        <ActiveFilterBox
          pageFilter={cropCatalogueFilter}
          pageFilterKey={`${crop_id}`}
          style={{ marginBottom: '32px' }}
        />
      )}

      {/* <CropStatusInfoBox style={{ marginBottom: '16px' }} date={date} setDate={setDate} /> */}

      <div ref={containerRef}>
        {!!(sum + filteredCropsWithoutManagementPlan.length) ? (
          <>
            <PageBreak style={{ paddingBottom: '16px' }} label={t('CROP_CATALOGUE.ON_YOUR_FARM')} />
            <CropStatusInfoBox
              status={{ active, past, planned }}
              style={{ marginBottom: '16px' }}
              date={date}
              setDate={setDate}
            />
            <PureCropTileContainer gap={gap} padding={padding}>
              {filteredCropsWithoutManagementPlan.map((cropVariety) => {
                const {
                  crop_translation_key,
                  crop_photo_url,
                  crop_id,
                  crop_variety_name,
                  crop_variety_id,
                } = cropVariety;
                const imageKey = cropVariety.crop_translation_key?.toLowerCase();

                return (
                  <PureCropTile
                    key={crop_variety_id}
                    title={crop_variety_name}
                    src={crop_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => goToVarietyManagement(crop_variety_id)}
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
                  imageKey,
                  crop_photo_url,
                  crop_id,
                  needsPlan,
                  crop_variety_name,
                  crop_variety_id,
                } = cropCatalog;

                return (
                  <PureCropTile
                    key={crop_variety_id}
                    cropCount={{
                      active: active.length,
                      planned: planned.length,
                      past: past.length,
                    }}
                    needsPlan={needsPlan}
                    title={crop_variety_name}
                    src={crop_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => goToVarietyManagement(crop_variety_id)}
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
      </div>

      {/* <div ref={containerRef}>
        {!!cropVarietiesWithoutManagementPlan.length && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('CROP_VARIETIES.NEEDS_PLAN')} />
            <PureCropTileContainer gap={gap} padding={padding}>
              {cropVarietiesWithoutManagementPlan.map((cropVariety) => {
                const {
                  crop_translation_key,
                  crop_variety_name,
                  crop_variety_id,
                  crop_variety_photo_url,
                } = cropVariety;
                const imageKey = crop_translation_key.toLowerCase();
                return (
                  <PureCropTile
                    key={cropVariety.crop_variety_id}
                    title={crop_variety_name || t(`crop:${crop_translation_key}`)}
                    src={crop_variety_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => goToVarietyManagement(crop_variety_id)}
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}

        {!!currentCropVarieties.length && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('common:ACTIVE')} />
            <PureCropTileContainer gap={gap} padding={padding}>
              {currentCropVarieties.map((cropVariety) => {
                const {
                  crop_translation_key,
                  crop_variety_name,
                  crop_variety_id,
                  crop_variety_photo_url,
                } = cropVariety;
                const imageKey = crop_translation_key.toLowerCase();
                return (
                  <PureCropTile
                    key={cropVariety.crop_variety_id}
                    title={crop_variety_name || t(`crop:${crop_translation_key}`)}
                    src={crop_variety_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => goToVarietyManagement(crop_variety_id)}
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}

        {!!plannedCropVarieties.length && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('common:PLANNED')} />
            <PureCropTileContainer gap={gap} padding={padding}>
              {plannedCropVarieties.map((cropVariety) => {
                const {
                  crop_translation_key,
                  crop_variety_name,
                  crop_variety_id,
                  crop_variety_photo_url,
                } = cropVariety;
                const imageKey = crop_translation_key.toLowerCase();
                return (
                  <PureCropTile
                    key={cropVariety.crop_variety_id}
                    title={crop_variety_name || t(`crop:${crop_translation_key}`)}
                    src={crop_variety_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => goToVarietyManagement(crop_variety_id)}
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}

        {!!expiredCropVarieties.length && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('common:PAST')} />
            <PureCropTileContainer gap={gap} padding={padding}>
              {expiredCropVarieties.map((cropVariety) => {
                const {
                  crop_translation_key,
                  crop_variety_name,
                  crop_variety_id,
                  crop_variety_photo_url,
                } = cropVariety;
                const imageKey = crop_translation_key.toLowerCase();
                return (
                  <PureCropTile
                    key={cropVariety.crop_variety_id}
                    title={crop_variety_name || t(`crop:${crop_translation_key}`)}
                    src={crop_variety_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => goToVarietyManagement(crop_variety_id)}
                    isPastVariety
                  />
                );
              })}
            </PureCropTileContainer>
          </>
        )}

        {!cropVarietiesWithoutManagementPlan.length &&
          !currentCropVarieties.length &&
          !plannedCropVarieties.length &&
          !expiredCropVarieties.length &&
          isFilterCurrentlyActive && (
            <Semibold style={{ color: 'var(--teal700)' }}>
              {t('CROP_CATALOGUE.NO_RESULTS_FOUND')}
            </Semibold>
          )}
      </div> */}

      {isAdmin && !isFilterCurrentlyActive && (
        <AddLink onClick={goToVarietyCreation}>{t('CROP_VARIETIES.ADD_VARIETY')}</AddLink>
      )}
    </Layout>
  );
}
