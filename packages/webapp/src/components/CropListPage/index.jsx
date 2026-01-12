import { useNavigate } from 'react-router-dom';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import CardLayout from '../Layout/CardLayout';
import RouterTab from '../RouterTab';
import PageTitle from '../PageTitle/v2';
import PureManagementPlanTile from '../CropTile/ManagementPlanTile';
import useCropTileListGap from '../CropTile/useCropTileListGap';
import PureCropTileContainer from '../CropTile/CropTileContainer';
import PageBreak from '../PageBreak';
import Square from '../Square';
import { AddLink } from '../Typography';
import { Variant } from '../RouterTab/Tab';

export default function PureCropList({
  onFilterChange,
  onAddCrop,
  activeCrops,
  pastCrops,
  plannedCrops,
  isAdmin,
  title,
  location,
  routerTabs,
}) {
  const isSearchable = true;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    ref: containerRef,
    gap,
    padding,
    cardWidth,
  } = useCropTileListGap([activeCrops?.length, plannedCrops?.length, pastCrops?.length]);

  return (
    <CardLayout>
      <PageTitle title={title} onGoBack={() => navigate('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        tabs={routerTabs}
        variant={Variant.UNDERLINE}
      />
      {isSearchable && (
        <Input
          style={{ marginBottom: '24px' }}
          placeholder={t('LOCATION_CROPS.INPUT_PLACEHOLDER')}
          isSearchBar={true}
          onChange={onFilterChange}
        />
      )}
      {isAdmin && (
        <div
          style={{
            marginBottom: '20px',
            width: 'fit-content',
            fontSize: '16px',
            color: 'var(--iconActive)',
            lineHeight: '16px',
            cursor: 'pointer',
          }}
          onClick={onAddCrop}
        >
          <AddLink>{t('LOCATION_CROPS.ADD_NEW')}</AddLink>
        </div>
      )}

      <div ref={containerRef}>
        {activeCrops.length > 0 && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('LOCATION_CROPS.ACTIVE_CROPS')}>
              <Square color={'active'}>{activeCrops.length}</Square>
            </PageBreak>
            <PureCropTileContainer gap={gap} padding={padding}>
              {activeCrops.map((fc) => (
                <PureManagementPlanTile
                  key={fc.management_plan_id}
                  managementPlan={fc}
                  status={'active'}
                  style={{ width: `${cardWidth}px` }}
                  onClick={() =>
                    navigate(`/crop/${fc.crop_variety_id}/management`, {
                      returnPath: location?.pathname,
                    })
                  }
                />
              ))}
            </PureCropTileContainer>
          </>
        )}
        {plannedCrops.length > 0 && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('LOCATION_CROPS.PLANNED_CROPS')}>
              <Square color={'planned'}>{plannedCrops.length}</Square>
            </PageBreak>

            <PureCropTileContainer gap={gap} padding={padding}>
              {plannedCrops.map((fc) => (
                <PureManagementPlanTile
                  key={fc.management_plan_id}
                  managementPlan={fc}
                  status={'planned'}
                  style={{ width: `${cardWidth}px` }}
                  onClick={() =>
                    navigate(`/crop/${fc.crop_variety_id}/management`, {
                      returnPath: location?.pathname,
                    })
                  }
                />
              ))}
            </PureCropTileContainer>
          </>
        )}
        {pastCrops.length > 0 && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('LOCATION_CROPS.PAST_CROPS')}>
              <Square color={'past'}>{pastCrops.length}</Square>
            </PageBreak>

            <PureCropTileContainer gap={gap} padding={padding}>
              {pastCrops.map((fc) => (
                <PureManagementPlanTile
                  key={fc.management_plan_id}
                  managementPlan={fc}
                  style={{ width: `${cardWidth}px` }}
                  onClick={() =>
                    navigate(`/crop/${fc.crop_variety_id}/management`, {
                      returnPath: location?.pathname,
                    })
                  }
                />
              ))}
            </PureCropTileContainer>
          </>
        )}
      </div>
    </CardLayout>
  );
}
