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

// Select products filtered by library/custom, type, farm, and removed status
export const makeFilteredProductsSelector = () =>
  createSelector(
    [productSelectors.selectAll, loginSelector, (_state, args) => args],
    (
      products,
      { farm_id },
      {
        includeLibrary = true,
        includeCustom = true,
        type = '',
        filterByFarm = false,
        includeRemoved = false,
      },
    ) => {
      return products.filter((product) => {
        const matchesIsLibrary = isLibraryProduct(product) ? includeLibrary : includeCustom;
        const matchesType = !type || product.type === type;
        const matchesFarm = !filterByFarm || product.farm_id === farm_id;
        const matchesRemoved = includeRemoved || !product.removed;

        return matchesIsLibrary && matchesType && matchesFarm && matchesRemoved;
      });
    },
  );

export const productEntitiesSelector = productSelectors.selectEntities;

export const productSelector = (product_id) => (state) =>
  productSelectors.selectById(state, product_id);
