import { useEffect, useState } from 'react';
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
import { useFilterDocuments, useSortByName, useStringFilteredDocuments } from './util';
import DocumentsSpotlight from './DocumentsSpotlight';
import { DocumentUploader } from './DocumentUploader';
import DocumentsFilterPage from '../Filter/Documents';
import { documentsFilterSelector, isFilterCurrentlyActiveSelector } from '../filterSlice';
import ActiveFilterBox from '../../components/ActiveFilterBox';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { setPersistedPaths } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { Underlined } from '../../components/Typography';
import { resetDocumentsFilter } from '../filterSlice';
import Drawer from '../../components/Drawer';
import { useNavigate } from 'react-router';

export default function Documents() {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const lang = getLanguageFromLocalStorage();

  const getDisplayedDate = (date) => {
    const options = { year: '2-digit', month: 'short', day: 'numeric' };
    return date ? new Date(date).toLocaleDateString(lang, options) : null;
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

  const {
    ref: containerRef,
    gap,
    padding,
  } = useDocumentTileGap([validDocuments.length, archivedDocuments.length]);

  const tileClick = (document_id) => {
    navigate(`/documents/${document_id}`);
  };

  const onUpload = () => {
    dispatch(setPersistedPaths(['/documents/add_document']));
    navigate('/documents/add_document');
  };
  const resetFilter = () => dispatch(resetDocumentsFilter());
  return (
    <Layout>
      <PageTitle title={t('DOCUMENTS.DOCUMENTS')} style={{ paddingBottom: '20px' }} />
      <PureSearchbarAndFilter
        onFilterOpen={onFilterOpen}
        value={filterString}
        onChange={filterStringOnChange}
        isFilterActive={isFilterCurrentlyActive}
      />
      <DocumentsSpotlight />

      <Drawer title={t('DOCUMENTS.FILTER.TITLE')} isOpen={isFilterOpen} onClose={onFilterClose}>
        <DocumentsFilterPage onGoBack={onFilterClose} />
      </Drawer>

      {isFilterCurrentlyActive && (
        <div style={{ marginBottom: '32px' }}>
          <ActiveFilterBox pageFilter={documentsFilter} pageFilterKey={'documents'} />
          <div style={{ marginTop: '12px' }}>
            <Underlined style={{ color: '#AA5F04' }} onClick={resetFilter}>
              {t('FILTER.CLEAR_ALL_FILTERS')}
            </Underlined>
          </div>
        </div>
      )}

      <div ref={containerRef}>
        <>
          <DocumentUploader
            style={{ marginBottom: '24px' }}
            linkText={t('DOCUMENTS.ADD_DOCUMENT')}
            onUpload={onUpload}
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
                      type={document.type}
                      date={getDisplayedDate(document.valid_until)}
                      noExpiration={document.no_expiration}
                      preview={document.thumbnail_url}
                      extensionName={document?.files?.[0]?.file_name.split('.').pop()}
                      onClick={() => tileClick(document.document_id)}
                      key={document.document_id}
                      fileUrls={document?.files?.map((file) => file.url)}
                    />
                  );
                })}
              </PureDocumentTileContainer>
            </>
          )}
          {!!archivedDocuments.length && (
            <>
              <PageBreak
                style={{ paddingBottom: '16px' }}
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
                      noExpiration={document.no_expiration}
                      preview={document.thumbnail_url}
                      extensionName={document?.files?.[0]?.file_name.split('.').pop()}
                      onClick={() => tileClick(document.document_id)}
                      key={document.document_id}
                      fileUrls={document?.files?.map((file) => file.url)}
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
