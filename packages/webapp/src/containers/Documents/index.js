import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import { useDispatch, useSelector } from 'react-redux';
import PureDocumentTile from './DocumentTile';
import PureDocumentTileContainer from './DocumentTile/DocumentTileContainer';
import useDocumentTileGap from './DocumentTile/useDocumentTileGap';
import { getDocuments } from '../saga';
import { expiredDocumentSelector, validDocumentSelector } from '../documentSlice';
import { getLanguageFromLocalStorage } from '../../util';
import { useFilterDocuments, useSortByName, useStringFilteredDocuments } from './util';
import moment from 'moment';
import DocumentsSpotlight from './DocumentsSpotlight';
import { DocumentUploader } from './DocumentUploader';
import MuiFullPagePopup from '../../components/MuiFullPagePopup/v2';
import DocumentsFilterPage from '../Filter/Documents';
import { documentsFilterSelector, isFilterCurrentlyActiveSelector } from '../filterSlice';
import ActiveFilterBox from '../../components/ActiveFilterBox';

export default function Documents({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const lang = getLanguageFromLocalStorage();

  const getDisplayedDate = (date) => {
    return date && moment(date).locale(lang).format('MMM D, YY') + "'";
  };

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const documentsFilter = useSelector(documentsFilterSelector);
  const isFilterCurrentlyActive = useSelector(isFilterCurrentlyActiveSelector('documents'));

  const onFilterClose = () => {
    setIsFilterOpen(false);
  };
  const onFilterOpen = () => {
    setIsFilterOpen(true);
  };

  useEffect(() => {
    dispatch(getDocuments());
  }, []);

  const validDocuments = useStringFilteredDocuments(
    useSortByName(useFilterDocuments(useSelector(validDocumentSelector))),
    filterString,
  );
  const archivedDocuments = useStringFilteredDocuments(
    useSortByName(useFilterDocuments(useSelector(expiredDocumentSelector))),
    filterString,
  );

  const { ref: containerRef, gap, padding } = useDocumentTileGap([
    validDocuments.length,
    archivedDocuments.length,
  ]);

  const tileClick = (document_id) => {
    history.push(`/documents/${document_id}`);
  };

  return (
    <Layout classes={{ container: { backgroundColor: 'white' } }}>
      <PageTitle title={t('DOCUMENTS.DOCUMENTS')} style={{ paddingBottom: '20px' }} />
      <PureSearchbarAndFilter
        onFilterOpen={onFilterOpen}
        value={filterString}
        onChange={filterStringOnChange}
        isFilterActive={isFilterCurrentlyActive}
      />
      <DocumentsSpotlight />

      <MuiFullPagePopup open={isFilterOpen} onClose={onFilterClose}>
        <DocumentsFilterPage onGoBack={onFilterClose} />
      </MuiFullPagePopup>

      {isFilterCurrentlyActive && (
        <ActiveFilterBox
          pageFilter={documentsFilter}
          pageFilterKey={'documents'}
          style={{ marginBottom: '32px' }}
        />
      )}

      <div ref={containerRef}>
        <>
          <DocumentUploader
            style={{ marginBottom: '26px' }}
            linkText={t('DOCUMENTS.ADD_DOCUMENT')}
            onUpload={() => history.push('/documents/add_document')}
          />
          {!!validDocuments.length && (
            <>
              <PageBreak
                style={{ paddingBottom: '16px' }}
                label={t('DOCUMENTS.VALID')}
                square={{ count: validDocuments.length, type: 'valid' }}
              />
              <PureDocumentTileContainer gap={gap} padding={padding}>
                {validDocuments.map((document) => {
                  return (
                    <PureDocumentTile
                      title={document.name}
                      type={t(`DOCUMENTS.TYPE.${document.type}`)}
                      date={getDisplayedDate(document.valid_until)}
                      preview={document.thumbnail_url}
                      onClick={() => tileClick(document.document_id)}
                      key={document.document_id}
                    />
                  );
                })}
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
              <PureDocumentTileContainer gap={gap} padding={padding}>
                {archivedDocuments.map((document) => {
                  return (
                    <PureDocumentTile
                      title={document.name}
                      type={document.type}
                      date={getDisplayedDate(document.valid_until)}
                      preview={document.thumbnail_url}
                      onClick={() => tileClick(document.document_id)}
                      key={document.document_id}
                    />
                  );
                })}
              </PureDocumentTileContainer>
            </>
          )}
        </>
      </div>
    </Layout>
  );
}
