import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';
import { createSelector } from 'reselect';

export const getProduct = (obj) => {
  return pick(obj, [
    'product_id',
    'name',
    'product_translation_key',
    'supplier',
    'on_permitted_substances_list',
    'type',
    'farm_id',
  ]);
};

const addManyProducts = (state, { payload: tasks }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  productAdapter.upsertMany(
    state,
    tasks.map((task) => getProduct(task)),
  );
};

const productAdapter = createEntityAdapter({
  selectId: (product) => product.product_id,
});

const productSlice = createSlice({
  name: 'productReducer',
  initialState: productAdapter.getInitialState({
    loading: false,
    error: undefined,
    loaded: false,
  }),
  reducers: {
    onLoadingProductStart: onLoadingStart,
    onLoadingProductFail: onLoadingFail,
    getProductsSuccess: addManyProducts,
    deleteTaskSuccess: productAdapter.removeOne,
  },
});
export const {
  onLoadingProductFail,
  onLoadingProductStart,
  getProductsSuccess,
} = productSlice.actions;
export default productSlice.reducer;

export const productReducerSelector = (state) => state.entitiesReducer[productSlice.name];

export const productEntitiesSelector = createSelector(
  productReducerSelector,
  ({ ids, entities }) => {
    return ids.map((id) => entities[id]);
  },
);

const productSelector = productAdapter.getSelectors(
  (state) => state.entitiesReducer[productSlice.name],
);

export const productSelectors = productSelector.selectEntities;

export const productById = (product_id) => (state) => productSelector.selectById(state, product_id);
