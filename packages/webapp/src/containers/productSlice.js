import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { onLoadingFail, onLoadingStart } from './userFarmSlice';
import { pick } from '../util/pick';

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

const taskSlice = createSlice({
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
} = taskSlice.actions;
export default taskSlice.reducer;

export const productReducerSelector = (state) => state.entitiesReducer[taskSlice.name];

const productSelector = productAdapter.getSelectors(
  (state) => state.entitiesReducer[taskSlice.name],
);
