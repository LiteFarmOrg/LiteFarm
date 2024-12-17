import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import { AddLink, Semibold } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { cropSelector } from '../cropSlice';
import useCropTileListGap from '../../components/CropTile/useCropTileListGap';
import PureCropTile from '../../components/CropTile';
import PureCropTileContainer from '../../components/CropTile/CropTileContainer';
import { useEffect, useState } from 'react';
import { getCropVarieties } from '../saga';
import {
  cropCatalogueFilterDateSelector,
  cropVarietyFilterSelector,
  isFilterCurrentlyActiveSelector,
  setCropCatalogueFilterDate,
} from '../filterSlice';
import { isAdminSelector } from '../userFarmSlice';
import { resetAndUnLockFormData } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import CropVarietyFilterPage from '../Filter/CropVariety';
import ActiveFilterBox from '../../components/ActiveFilterBox';
import { useStartAddCropVarietyFlow } from './useStartAddCropVarietyFlow';
import useCropVarietyCatalogue from './useCropVarietyCatalogue';
import CropStatusInfoBox from '../../components/CropCatalogue/CropStatusInfoBox';
import Drawer from '../../components/Drawer';
import { useParams } from 'react-router-dom';

export default function CropVarieties({ history, location }) {
  let { crop_id: strCropId } = useParams();
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();
  const crop_id = Number(strCropId);
  const crop = useSelector(cropSelector(crop_id));

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);

  const cropCatalogueFilter = useSelector(cropVarietyFilterSelector(crop_id));
  const isFilterCurrentlyActive = useSelector(isFilterCurrentlyActiveSelector(crop_id));

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

  const {
    active,
    abandoned,
    planned,
    completed,
    noPlans,
    sum,
    cropCatalogue,
    filteredCropsWithoutManagementPlan,
  } = useCropVarietyCatalogue(filterString, crop_id);

  const {
    ref: containerRef,
    gap,
    padding,
    cardWidth,
  } = useCropTileListGap([sum, cropCatalogue.length]);

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
    history.push(`/crop/${varietyId}/management`, { returnPath: location.pathname });
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
        isFilterActive={isFilterCurrentlyActive}
      />
      <Drawer
        title={t('CROP_CATALOGUE.FILTER.TITLE')}
        isOpen={isFilterOpen}
        onClose={onFilterClose}
      >
        <CropVarietyFilterPage cropId={crop_id} onGoBack={onFilterClose} />
      </Drawer>

      {isFilterCurrentlyActive && (
        <ActiveFilterBox
          pageFilter={cropCatalogueFilter}
          pageFilterKey={`${crop_id}`}
          style={{ marginBottom: '32px' }}
        />
      )}

      {/* <CropStatusInfoBox style={{ marginBottom: '16px' }} date={date} setDate={setDate} /> */}

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
                const {
                  crop_translation_key,
                  crop_photo_url,
                  crop_id,
                  crop_variety_photo_url,
                  crop_variety_name,
                  crop_variety_id,
                  noPlansCount,
                } = cropVariety;
                const imageKey = cropVariety.crop_translation_key?.toLowerCase();

                return (
                  <PureCropTile
                    key={crop_variety_id}
                    title={crop_variety_name}
                    src={crop_variety_photo_url ?? crop_photo_url}
                    alt={imageKey}
                    style={{ width: cardWidth }}
                    onClick={() => goToVarietyManagement(crop_variety_id)}
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
                  noPlans,
                  noPlansCount,
                  crop_variety_photo_url,
                  crop_variety_name,
                  crop_variety_id,
                } = cropCatalog;

                return (
                  <PureCropTile
                    key={crop_variety_id}
                    cropCount={{
                      active: active.length,
                      abandoned: abandoned.length,
                      planned: planned.length,
                      completed: completed.length,
                      noPlans: noPlans.length,
                    }}
                    needsPlan={!!noPlansCount}
                    title={crop_variety_name}
                    src={crop_variety_photo_url ?? crop_photo_url}
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
      {isAdmin && !isFilterCurrentlyActive && (
        <AddLink onClick={goToVarietyCreation}>{t('CROP_VARIETIES.ADD_VARIETY')}</AddLink>
      )}
    </Layout>
  );
}
