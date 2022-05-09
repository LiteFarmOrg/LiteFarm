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
  allVarietyCropManagementPlanSelector,
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
import useCropCatalogue from '../CropCatalogue/useCropCatalogue';
import useCropVarietyCatalogue from '../CropCatalogue/useCropVarietyCatalogue';
import CropStatusInfoBox from '../../components/CropCatalogue/CropStatusInfoBox';
import { cropVarietyDataSelector } from '../../containers/cropVarietySlice';
import { managementPlanDataSelector } from '../../containers/managementPlanSlice';
import { createSelector } from 'reselect';

export default function CropVarieties({ history, match }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();
  const crop_id = Number(match.params.crop_id);
  const crop = useSelector(cropSelector(crop_id));

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);

  const {
    active,
    planned,
    past,
    needsPlan,
    sum,
    cropCatalogue,
    filteredCropsWithoutManagementPlan,
  } = useCropVarietyCatalogue(filterString, crop_id);

  console.log('needsPlan', needsPlan);

  const allVarietyCropManagementPlan = useFilterVarieties(
    useStringFilteredCrops(useSortByVarietyName(cropCatalogue), filterString),
    crop_id,
    NEEDS_PLAN,
  );

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
  } = useCropTileListGap([
    currentCropVarieties.length,
    plannedCropVarieties.length,
    expiredCropVarieties.length,
    cropVarietiesWithoutManagementPlan.length,
  ]);
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

  const cropVarietyFilter = useSelector(cropVarietyFilterSelector(crop_id));
  const isFilterCurrentlyActive = useSelector(isFilterCurrentlyActiveSelector(crop_id));

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

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
          pageFilter={cropVarietyFilter}
          pageFilterKey={`${crop_id}`}
          style={{ marginBottom: '32px' }}
        />
      )}

      {/* <CropStatusInfoBox style={{ marginBottom: '16px' }} date={date} setDate={setDate} /> */}

      {!!(sum + allVarietyCropManagementPlan.length) ? (
        <>
          <PageBreak style={{ paddingBottom: '16px' }} label={t('CROP_CATALOGUE.ON_YOUR_FARM')} />
          <CropStatusInfoBox
            status={{ active, past, planned, needsPlan }}
            style={{ marginBottom: '16px' }}
            date={date}
            setDate={setDate}
          />
          <PureCropTileContainer gap={gap} padding={padding}>
            {allVarietyCropManagementPlan.map((cropVariety, index) => {
              const {
                crop_variety_name,
                crop_photo_url,
                crop_id,
                crop_variety_id,
                active,
                planned,
                noplan,
                past,
              } = cropVariety;
              const imageKey = cropVariety.crop_translation_key?.toLowerCase();

              return (
                <PureCropTile
                  key={index}
                  title={t(`crop:${crop_variety_name}`)}
                  src={crop_photo_url}
                  alt={imageKey}
                  cropCount={{
                    active,
                    planned,
                    past,
                    needsPlan: noplan,
                  }}
                  style={{ width: cardWidth }}
                  onClick={() => goToVarietyManagement(crop_variety_id)}
                  needsPlan={cropVariety.noplan !== 0}
                />
              );
            })}
            {/* {cropCatalogue.map((cropCatalog) => {
            const {
              crop_translation_key,
              active,
              planned,
              past,
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
          })} */}
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
        <AddLink onClick={goToVarietyCreation}>{t('CROP_VARIETIES.ADD_VARIETY')}</AddLink>
      )}
    </Layout>
  );
}
