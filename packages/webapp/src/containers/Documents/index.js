import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import { AddLink, Text } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import PureDocumentTile from '../../components/DocumentTile';
import PureDocumentTileContainer from '../../components/DocumentTile/DocumentTileContainer';

export default function Documents({ history }) {
  const { t } = useTranslation();

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const isFilterCurrentlyActive = false;

  const validDocuments = [''];

  const archivedDocuments = [''];

  const onFilterClose = () => {
    setIsFilterOpen(false);
  };
  const onFilterOpen = () => {
    setIsFilterOpen(true);
  };

  const onGoBack = () => {
    history.push('/home');
  }

  const tileClick = () => {
    console.log("Go to document detail");
  }

  return (
    <Layout classes={{ container: { backgroundColor: 'white' } }}>
      <PageTitle
        title={t('DOCUMENTS.DOCUMENTS')}
        style={{ paddingBottom: '20px' }}
        onGoBack={onGoBack}
      />
      <PureSearchbarAndFilter
        onFilterOpen={onFilterOpen}
        value={filterString}
        onChange={filterStringOnChange}
        isFilterActive={isFilterCurrentlyActive}
      />

      {!isFilterCurrentlyActive && (
        <>
          <AddLink style={{ marginBottom: '26px' }} onClick={() => history.push('/')}>
            {t('DOCUMENTS.ADD_DOCUMENT')}
          </AddLink>
          {!!validDocuments.length && (
            <>
              <PageBreak
                style={{ paddingBottom: '16px' }}
                label={t('DOCUMENTS.VALID')}
                square={{ count: validDocuments.length, type: 'valid' }}
              />
              <PureDocumentTileContainer>
                {<PureDocumentTile
                  title={'Document Name I have a very long name, hahaha'}
                  type={'Crop Compliance'}
                  date={"May 2, 21'"}
                  preview={'crop-images/default.jpg'}
                  onClick={tileClick}
                />}
              </PureDocumentTileContainer>
            </>
          )}
          {!!archivedDocuments.length && (
            <>
              <PageBreak
                style={{ paddingTop: '35px', paddingBottom: '16px' }}
                label={t('DOCUMENTS.ARCHIVED')}
                square={{ count: archivedDocuments.length, type: 'archived' }}
              />
              <PureDocumentTileContainer>
                {<PureDocumentTile
                  title={'Document Name I have a very long name, hahaha'}
                  type={'Crop Compliance'}
                  date={"May 2, 21'"}
                  preview={'crop-images/default.jpg'}
                  onClick={tileClick}
                />}
              </PureDocumentTileContainer>
            </>
          )}
        </>
      )}
    </Layout>
  )
}