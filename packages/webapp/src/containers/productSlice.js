import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';
import { createSelector } from 'reselect';
import { isLibraryProduct } from '../util/product';

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
    'removed',
  ]);
};

const addManyProducts = (state, { payload: tasks }) => {
  state.loading = false;
  state.error = null;
  state.loaded = true;
  productAdapter.setAll(
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

// Select farm products including removed ones
export const productsSelector = createSelector(
  [productSelectors.selectAll, loginSelector],
  (products, { farm_id }) => {
    return products.filter((product) => product.farm_id === farm_id);
  },
);

// Select farm products for a given type including removed ones
export const productsForTaskTypeSelector = createSelector(
  [productsSelector, (_state, taskType) => taskType],
  (products, taskType) => {
    if (taskType === undefined) {
      return undefined;
    }
    return products.filter(({ type }) => type === taskType.task_translation_key.toLowerCase());
  },
);

export const productInventorySelector = createSelector([productsSelector], (products) => {
  return products.filter((product) => !product.removed);
});

export const hasAvailableProductsSelector = createSelector(
  [productsSelector, (_state, type) => type],
  (products, type) => {
    return products.some((product) => !product.removed && (!type || product.type === type));
  },
);

export const productEntitiesSelector = productSelectors.selectEntities;

export const productSelector = (product_id) => (state) =>
  productSelectors.selectById(state, product_id);
