import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TYPE, UNCATEGORIZED, VALID_ON } from '../Filter/constants';
import { documentsFilterSelector } from '../filterSlice';

export function useSortByName(documents) {
  return useMemo(() => {
    return documents.sort((doc_i, doc_j) => {
      if (doc_i.name > doc_j.name) {
        return 1;
      } else if (doc_i.name < doc_j.name) {
        return -1;
      } else {
        return doc_i.document_id > doc_j.document_id ? 1 : -1;
      }
    });
  }, [documents]);
}

export function useStringFilteredDocuments(documents, filterString) {
  return useMemo(() => {
    const lowerCaseFilter =
      filterString
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^\p{L}0-9]/gu, '')
        .replace(/_/g, '')
        .trim() || '';
    const check = (names) => {
      for (const name of names) {
        if (
          name
            ?.toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^\p{L}0-9]/gu, '')
            .replace(/_/g, '')
            .trim()
            .includes(lowerCaseFilter)
        )
          return true;
      }
      return false;
    };
    return documents.filter((document) => check([document?.name, document?.notes]));
  }, [documents, filterString]);
}

export function useFilterDocuments(documents) {
  const documentsFilter = useSelector(documentsFilterSelector);
  const documentsFilteredByType = useMemo(() => {
    const typeFilter = documentsFilter[TYPE];
    const activeFilterTypes = new Set(
      Object.keys(typeFilter).filter((type) => typeFilter[type].active),
    );
    return activeFilterTypes.size
      ? documents.filter((document) => {
          if (!document.type) return activeFilterTypes.has(UNCATEGORIZED);
          return activeFilterTypes.has(document.type);
        })
      : documents;
  }, [documentsFilter[TYPE], documents]);

  const documentsFilteredByValidUntil = useMemo(() => {
    const validOnDate = documentsFilter[VALID_ON];
    if (validOnDate) {
      const filterDate = Date.parse(validOnDate);
      return documentsFilteredByType.filter((document) => {
        const documentDate = Date.parse(document.valid_until);
        return document.no_expiration || documentDate >= filterDate;
      });
    }
    return documentsFilteredByType;
  }, [documentsFilter[VALID_ON], documentsFilteredByType]);
  return documentsFilteredByValidUntil;
}
