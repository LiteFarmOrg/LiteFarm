import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';

const getDocument = (obj) => {
  return pick(obj, [
    'document_id',
    'name',
    'valid_until',
    'type',
    'thumbnail_url',
    'notes',
    'farm_id',
    'created_at',
    'updated_at',
  ]);
};


const addOneDocument = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  documentAdapter.upsertOne(state, getDocument(payload));
};

const updateOneDocument = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  documentAdapter.updateOne(state, getDocument(payload));
};

const addManyDocument = (state, { payload: documents }) => {
  state.loading = false;
  state.error = null;
  documentAdapter.upsertMany(
    state,
    documents.map((document) => getDocument(document)),
  );
};

const documentAdapter = createEntityAdapter({
  selectId: (document) => document.document_id,
});

const documentSlice = createSlice({
  name: 'documentReducer',
  initialState: documentAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingDocumentStart: onLoadingStart,
    onLoadingDocumentFail: onLoadingFail,
    getDocumentsSuccess: addManyDocument,
    getAllDocumentsSuccess: (state, { payload: documents }) => {
      addManyDocument(state, { payload: documents });
      state.loaded = true;
    },
    postDocumentSuccess: addOneDocument,
    putDocumentSuccess(state, { payload: document }) {
      documentAdapter.updateOne(state, {
        changes: document,
        id: document.document_id,
      });
    },
    selectDocumentSuccess(state, { payload: document_id }) {
      state.document_id = document_id;
    },
    archiveDocumentSuccess: documentAdapter.removeOne
  },
});

export const {
  getDocumentsSuccess,
  postDocumentSuccess,
  putDocumentSuccess,
  onLoadingDocumentStart,
  onLoadingDocumentFail,
  archiveDocumentSuccess,
  getAllDocumentsSuccess,
} = documentSlice.actions;
export default documentSlice.reducer;

export const documentReducerSelector = (state) => state.entitiesReducer[documentSlice.name];

const documentSelectors = documentAdapter.getSelectors(
  (state) => state.entitiesReducer[documentSlice.name],
);

export const documentEntitiesSelector = documentSelectors.selectEntities;

export const documentsSelector = createSelector(
  [documentSelectors.selectAll, loginSelector],
  (documents, { farm_id }) => {
    const documentsOfCurrentFarm = documents.filter(
      (document) => document.farm_id === farm_id,
    );
    return documentsOfCurrentFarm;
  }
);

export const documentSelector = (document_id) => (state) => 
  documentSelectors.selectById(state, document_id);

export const documentStatusSelector = createSelector(
  [documentReducerSelector],
  ({ loading, error }) => {
    return { loading, error };
  }
);