import { LocalStorage } from 'quasar'

export function filters (state) {
  if (LocalStorage.getItem('filters')) {
    const dataFilters = JSON.parse(LocalStorage.getItem('filters'))

    if (!state.filters) {
      state.filters = dataFilters
    }
  }

  return state.filters
}
