import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
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
    'soil_amendment_product',
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
export const { onLoadingProductFail, onLoadingProductStart, getProductsSuccess } =
  productSlice.actions;
export default productSlice.reducer;

export const productReducerSelector = (state) => state.entitiesReducer[productSlice.name];

const productSelectors = productAdapter.getSelectors(
  (state) => state.entitiesReducer[productSlice.name],
);

export const productsSelector = createSelector(
  [productSelectors.selectAll, loginSelector],
  (products, { farm_id }) => {
    return products.filter((product) => product.farm_id === farm_id);
  },
);

export const productsForTaskTypeSelector = (taskType) => {
  return createSelector([productSelectors.selectAll, loginSelector], (products, { farm_id }) => {
    if (taskType === undefined) {
      return undefined;
    }
    return products.filter(
      (product) =>
        product.farm_id === farm_id && product.type === taskType.task_translation_key.toLowerCase(),
    );
  });
};

export const productEntitiesSelector = productSelectors.selectEntities;

export const productSelector = (product_id) => (state) =>
  productSelectors.selectById(state, product_id);
