import { createSelector } from 'reselect';

export function getTrackedReducerSelector<N extends string>(
  reducerName: N,
  ...additionalDependencyStatusSelectors: Array<
    (state: any) => {
      loading: boolean;
      error: any;
    }
  >
) {
  return createSelector(
    (state: any) => state,
    (state) => state.entitiesReducer[reducerName],
    {
      memoizeOptions: {
        equalityCheck: (_, currentState) =>
          additionalDependencyStatusSelectors.some(
            (statusSelector) =>
              statusSelector(currentState).loading || statusSelector(currentState).error,
          ),
      },
    },
  );
}
