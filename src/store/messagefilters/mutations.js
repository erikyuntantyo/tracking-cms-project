export function setFilters (state, data) {
  state.filters = data
}

export function resetData (state, data) {
  state.filters = {
    filter: '',
    vehicles: [],
    filterGroup: [],
    company: ''
  }
}
