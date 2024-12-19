import Layout from '../Layout';
import CropHeader from './CropHeader';
import RouterTab from '../RouterTab';
import { useMemo, useState } from 'react';
import { AddLink, Semibold } from '../Typography';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CardWithStatusContainer } from '../CardWithStatus/CardWithStatusContainer/CardWithStatusContainer';
import { ManagementPlanCard } from '../CardWithStatus/ManagementPlanCard/ManagementPlanCard';
import Input from '../Form/Input';
import { useSelector } from 'react-redux';
import { cropLocationsSelector } from '../../containers/locationSlice';
import LocationCreationModal from '../LocationCreationModal';
import CropPlansModal from '../Modals/CropModals/CropPlansModal';
import { useNavigate, useParams, useLocation } from 'react-router-dom-v5-compat';

export default function PureCropManagement({
  onBack,
  variety,
  onAddManagementPlan,
  managementPlanCardContents,
  isAdmin,
}) {
  let navigate = useNavigate();
  let location = useLocation();
  let { variety_id } = useParams();
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');
  const [plansForModal, setPlansForModal] = useState([]);
  const searchStringOnChange = (e) => setSearchString(e.target.value);
  const filteredManagementPlanCardContents = useMemo(() => {
    return searchString
      ? managementPlanCardContents.filter(
          ({ locationName, managementPlanName, status }) =>
            locationName?.toLowerCase()?.includes(searchString?.toLowerCase()) ||
            managementPlanName?.toLowerCase()?.includes(searchString?.toLowerCase()) ||
            status?.toLowerCase()?.includes(searchString?.toLowerCase()),
        )
      : managementPlanCardContents;
  }, [searchString, managementPlanCardContents]);
  const cropLocations = useSelector(cropLocationsSelector);
  const [createCropLocation, setCreateCropLocation] = useState(false);

  const dismissLocationCreationModal = () => {
    setCreateCropLocation(false);
  };

  const handleAddPlan = () => {
    if (cropLocations.length) {
      onAddManagementPlan();
    } else {
      setCreateCropLocation(true);
    }
  };

  const setPlansInGroup = (groupId) => {
    const plans = managementPlanCardContents.filter(({ management_plan_group_id }) => {
      return management_plan_group_id === groupId;
    });
    setPlansForModal(plans);
  };

  const dismissCropPlansModal = () => {
    setPlansForModal([]);
  };

  return (
    <Layout>
      <CropHeader variety={variety} onBackClick={onBack} />
      <RouterTab
        classes={{ container: { margin: '24px 0 26px 0' } }}
        tabs={[
          {
            label: t('CROP_DETAIL.MANAGEMENT_TAB'),
            path: `/crop/${variety_id}/management`,
            state: location?.state,
          },
          {
            label: t('CROP_DETAIL.DETAIL_TAB'),
            path: `/crop/${variety_id}/detail`,
            state: location?.state,
          },
        ]}
      />
      <Semibold style={{ marginBottom: '16px' }}>{t('CROP_DETAIL.MANAGEMENT_PLANS')}</Semibold>
      {managementPlanCardContents?.length > 2 && (
        <Input
          style={{ paddingBottom: '16px' }}
          value={searchString}
          onChange={searchStringOnChange}
          isSearchBar
        />
      )}
      {isAdmin && (
        <AddLink data-cy="crop-addPlan" onClick={handleAddPlan}>
          {' '}
          {t('CROP_DETAIL.ADD_PLAN')}
        </AddLink>
      )}
      {createCropLocation && (
        <LocationCreationModal
          title={t('LOCATION_CREATION.TITLE')}
          body={t('LOCATION_CREATION.CROP_PLAN_BODY')}
          dismissModal={dismissLocationCreationModal}
          isAdmin={isAdmin}
        />
      )}
      {managementPlanCardContents && (
        <CardWithStatusContainer style={{ paddingTop: '16px' }}>
          {filteredManagementPlanCardContents.map((managementPlan, index) => {
            // Handle repeat plan info click event
            const repeatPlanInfoOnClick =
              managementPlan.repetition_count && managementPlan.repetition_number
                ? (e) => {
                    e.stopPropagation(); // to stop click propagating to parent
                    setPlansInGroup(managementPlan.management_plan_group_id);
                  }
                : undefined;

            return (
              <ManagementPlanCard
                onClick={() =>
                  navigate(
                    `/crop/${variety.crop_variety_id}/management_plan/${managementPlan.management_plan_id}/tasks`,
                    { state: location.state },
                  )
                }
                {...managementPlan}
                key={index}
                repeatPlanInfoOnClick={repeatPlanInfoOnClick}
                repeatingPlan={managementPlan.repetition_count && managementPlan.repetition_number}
              />
            );
          })}
        </CardWithStatusContainer>
      )}
      {!!plansForModal.length && (
        <CropPlansModal
          variety={variety}
          managementPlanCardContents={plansForModal}
          dismissModal={dismissCropPlansModal}
        />
      )}
    </Layout>
  );
}

PureCropManagement.propTypes = {
  managementPlanCardContents: PropTypes.arrayOf(
    PropTypes.shape({
      managementPlanName: PropTypes.string,
      locationName: PropTypes.string,
      notes: PropTypes.string,
      startDate: PropTypes.any,
      endDate: PropTypes.any,
      numberOfPendingTask: PropTypes.number,
      status: PropTypes.oneOf(['active', 'planned', 'completed', 'abandoned']),
      management_plan_id: PropTypes.number,
      management_plan_group_id: PropTypes.string,
      repetition_count: PropTypes.number,
      repetition_number: PropTypes.number,
    }),
  ),
  onBack: PropTypes.func,
  variety: PropTypes.object,
  onAddManagementPlan: PropTypes.func,
  isAdmin: PropTypes.bool,
};
