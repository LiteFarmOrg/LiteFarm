import React from 'react';
import Input from '../Form/Input';
import { useTranslation } from 'react-i18next';
import Layout from '../Layout';
import RouterTab from '../RouterTab';
import PageTitle from '../PageTitle/v2';
import NewFieldCropModal from '../Forms/NewFieldCropModal';
import PureFieldCropTile from '../CropTile/FieldCropTile';
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
      {/*    + <Underlined>{t('LOCATION_CROPS.ADD_NEW')}</Underlined>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/*TODO: deprecate*/}
      {isAdmin && (
        <NewFieldCropModal
          location_id={match.params.location_id}
          fieldArea={100}
          handler={() => {}}
        />
      )}
      <div ref={containerRef}>
        {activeCrops.length > 0 && (
          <>
            <PageBreak style={{ paddingBottom: '22px' }} label={t('LOCATION_CROPS.ACTIVE_CROPS')}>
              <Square color={'active'}>{activeCrops.length}</Square>
            </PageBreak>
            <PureCropTileContainer gap={gap} padding={padding}>
              {activeCrops.map((fc) => (
                <PureFieldCropTile
                  history={history}
                  key={fc.field_crop_id}
                  fieldCrop={fc}
                  status={'Active'}
                  style={{ width: `${cardWidth}px` }}
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
                <PureFieldCropTile
                  history={history}
                  key={fc.field_crop_id}
                  fieldCrop={fc}
                  status={'Planned'}
                  style={{ width: `${cardWidth}px` }}
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
                <PureFieldCropTile
                  history={history}
                  key={fc.field_crop_id}
                  fieldCrop={fc}
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
