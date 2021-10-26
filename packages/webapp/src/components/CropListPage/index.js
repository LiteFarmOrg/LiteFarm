import React from 'react';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import Layout from '../Layout';
import RouterTab from '../RouterTab';
import PageTitle from '../PageTitle/v2';
import PureManagementPlanTile from '../CropTile/ManagementPlanTile';
import useCropTileListGap from '../CropTile/useCropTileListGap';
import PureCropTileContainer from '../CropTile/CropTileContainer';
import PageBreak from '../PageBreak';
import Square from '../Square';

export default function PureCropList({
  onFilterChange,
  onAddCrop,
  activeCrops,
  pastCrops,
  plannedCrops,
  history,
  match,
  isAdmin,
  title,
}) {
  const isSearchable = true;
  const { t } = useTranslation();

  const { ref: containerRef, gap, padding, cardWidth } = useCropTileListGap([
    activeCrops?.length,
    plannedCrops?.length,
    pastCrops?.length,
  ]);

  return (
    <Layout>
      <PageTitle title={title} onGoBack={() => history.push('/map')} />
      <RouterTab
        classes={{ container: { margin: '30px 0 26px 0' } }}
        history={history}
        match={match}
        tabs={[
          {
            label: t('FARM_MAP.TAB.CROPS'),
            path: match.url,
          },
          {
            label: t('FARM_MAP.TAB.DETAILS'),
            path: match.url.replace('crops', 'details'),
          },
        ]}
      />
      {isSearchable && (
        <Input
          style={{ marginBottom: '24px' }}
          placeholder={t('LOCATION_CROPS.INPUT_PLACEHOLDER')}
          isSearchBar={true}
          onChange={onFilterChange}
        />
      )}
      {/*TODO: figure out how to deal with creation flow with cancel button with multiple entry point*/}
      {/*{isAdmin && (*/}
      {/*  <div*/}
      {/*    style={{*/}
      {/*      marginBottom: '20px',*/}
      {/*      width: 'fit-content',*/}
      {/*      fontSize: '16px',*/}
      {/*      color: 'var(--iconActive)',*/}
      {/*      lineHeight: '16px',*/}
      {/*      cursor: 'pointer',*/}
      {/*    }}*/}
      {/*    onClick={onAddCrop}*/}
      {/*  >*/}
      {/*    <AddLink>{t('LOCATION_CROPS.ADD_NEW')}</AddLink>*/}
      {/*  </div>*/}
      {/*)}*/}

      <div ref={containerRef}>
        {activeCrops.length > 0 && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('LOCATION_CROPS.ACTIVE_CROPS')}>
              <Square color={'active'}>{activeCrops.length}</Square>
            </PageBreak>
            <PureCropTileContainer gap={gap} padding={padding}>
              {activeCrops.map((managementPlan) => (
                <PureManagementPlanTile
                  history={history}
                  key={managementPlan.management_plan_id}
                  managementPlan={managementPlan}
                  status={'Active'}
                  style={{ width: `${cardWidth}px` }}
                  onClick={() =>
                    history.push(
                      `/crop/${managementPlan.crop_variety.crop_variety_id}/management_plan/${managementPlan.management_plan_id}/tasks`,
                    )
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
              {plannedCrops.map((managementPlan) => (
                <PureManagementPlanTile
                  history={history}
                  key={managementPlan.management_plan_id}
                  managementPlan={managementPlan}
                  status={'Planned'}
                  style={{ width: `${cardWidth}px` }}
                  onClick={() =>
                    history.push(
                      `/crop/${managementPlan.crop_variety.crop_variety_id}/management_plan/${managementPlan.management_plan_id}/tasks`,
                    )
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
              {pastCrops.map((managementPlan) => (
                <PureManagementPlanTile
                  history={history}
                  key={managementPlan.management_plan_id}
                  managementPlan={managementPlan}
                  status={'Past'}
                  style={{ width: `${cardWidth}px` }}
                />
              ))}
            </PureCropTileContainer>
          </>
        )}
      </div>
    </Layout>
  );
}
