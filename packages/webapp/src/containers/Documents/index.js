import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PageBreak from '../../components/PageBreak';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import { AddLink } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import PureDocumentTile from '../../components/DocumentTile';
import PureDocumentTileContainer from '../../components/DocumentTile/DocumentTileContainer';
import useDocumentTileGap from '../../components/DocumentTile/useDocumentTileGap';
import { getDocuments } from '../saga';
import { documentsSelector } from '../documentSlice';
import { getLanguageFromLocalStorage } from '../../util';
import {useStringFilteredDocuments, useSortByName} from './util';
import moment from 'moment';

export default function Documents({ history }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const lang = getLanguageFromLocalStorage();

  const isValid = (date, currDate) => {
    var given_date = new Date(date);
    return (currDate < given_date);
  };

  
  const getDisplayedDate = (date) => {
    return date && moment(date).locale(lang).format('MMM D, YY') + "'";
  }

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const isFilterCurrentlyActive = false;

  const onFilterClose = () => {
    setIsFilterOpen(false);
  };
  const onFilterOpen = () => {
    setIsFilterOpen(true);
  };

  useEffect(() => {
    dispatch(getDocuments());
  }, []);

  const documents = useStringFilteredDocuments(
    useSortByName(useSelector(documentsSelector)), 
    filterString);
  const validDocuments = [];
  const archivedDocuments = [];
  
  const currDate = new Date();
  
  documents.forEach((document) => {
    if (isValid(document.valid_until, currDate)) {
      validDocuments.push(document);
    } else {
      archivedDocuments.push(document);
    }
  });

  const { ref: containerRef, gap, padding } = useDocumentTileGap([validDocuments.length, archivedDocuments.length]);

  const tileClick = () => {
    // TODO - Add path
    console.log("Go to document detail");
  }

  return (
    <Layout classes={{ container: { backgroundColor: 'white' } }}>
      <PageTitle
        title={t('DOCUMENTS.DOCUMENTS')}
        style={{ paddingBottom: '20px' }}
      />
      <PureSearchbarAndFilter
        onFilterOpen={onFilterOpen}
        value={filterString}
        onChange={filterStringOnChange}
        isFilterActive={isFilterCurrentlyActive}
      />
      <div ref={containerRef}>
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
                <PureDocumentTileContainer gap={gap} padding={padding}>
                  {validDocuments.map((document) => {
                    return (
                      <PureDocumentTile
                        title={document.name}
                        type={t(`DOCUMENTS.TYPE.${document.type}`)}
                        date={null}//getDisplayedDate(document.valid_until)}
                        preview={document.thumbnail_url}
                        onClick={tileClick}
                      />)
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
                        type={t(`DOCUMENTS.TYPE.${document.type}`)}
                        date={getDisplayedDate(document.valid_until)}
                        preview={document.thumbnail_url}
                        onClick={tileClick}
                      />
                    )
                  })}
                </PureDocumentTileContainer>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
