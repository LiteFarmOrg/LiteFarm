import { useMemo } from 'react';

export function useSortByName(documents) {
  return useMemo(() => {
    return documents.sort((doc_i, doc_j) =>
      doc_i.name > doc_j.name ? 1 : -1,
    );
  }, [documents]);
}

export function useStringFilteredDocuments(documents, filterString) {
    return useMemo(() => {
      const lowerCaseFilter = filterString?.toLowerCase() || '';
      const check = (names) => {
        for (const name of names) {
          if (name?.toLowerCase().includes(lowerCaseFilter)) return true;
        }
        return false;
      };
      return documents.filter((document) =>
        check([
          document?.name,
          document?.notes,
        ]),
      );
    }, [documents, filterString]);
}
  