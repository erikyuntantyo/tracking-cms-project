<template>
  <div
    id="mapid"
    class="relative-position"
  >
    <div class="actions-container row q-col-gutter-md">
      <div>
        <q-btn
          size="md"
          label="Refresh"
          color="white"
          text-color="black"
          class="map-button"
          @click="updateMarkers"
        />
      </div>

      <div style="width: 250px;">
        <q-select
          dense
          label="Source"
          v-model="filter.source"
          :options="options.sources"
          color="red-9"
          use-input
          standout="bg-red-9 text-white"
          class="q-mb-sm"
          emit-value
          map-options
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          dense
          label="Company"
          v-model="filter.company"
          :options="options.companies"
          clearable
          color="red-9"
          use-input
          standout="bg-red-9 text-white"
          class="q-mb-sm"
          emit-value
          map-options
          @filter="onFilterCompanies"
          v-if="$store.getters['auth/user'] && !$store.getters['auth/user'].company"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          standout="bg-red-9 text-white"
          dense
          use-input
          v-model="filter.vehicleGroup"
          :options="options.vehicleGroups"
          label="Vehicle Groups"
          clearable
          class="q-mb-sm"
          color="red-9"
          emit-value
          map-options
          @filter="onFilterVehicleGroups"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          dense
          label="Vehicle Number"
          v-model="filter.vehicleNo"
          :options="options.vehicles"
          clearable
          color="red-9"
          use-input
          standout="bg-red-9 text-white"
          class="q-mb-sm"
          map-options
          @virtual-scroll="onScroll"
          @blur="onOut"
          @input="onOut"
          @filter="onFilterVehicles"
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from '../../../mixins/filter'
import Vue from 'vue'
import L from 'leaflet'

export default {
  name: 'AppMap',

  mixins: [mixin],

  data () {
    return {
      map: null,
      filter: {
        source: 'mqtt',
        vehicleGroup: null,
        company: this.$store.getters['auth/user'].company || null,
        vehicleNo: null
      },
      options: {
        sources: [
          {
            label: 'GPS',
            value: 'mqtt'
          },
          {
            label: 'App',
            value: 'app'
          }
        ],
        vehicleGroups: [],
        companies: [],
        vehicles: []
      },
      refreshQueue: null,
      refreshInterval: 15000,
      vehicles: [],
      locations: [],
      vehiclesClone: [],
      skip: 0,
      search: '',
      total: true,
      alertDialog: false
    }
  },

  watch: {
    'filter.source' (val, prev) {
      this.alertDialog = false
      if (val !== prev) this.updateMarkers()
    },
    'filter.company' (val, prev) {
      this.filter.vehicleNo = null
      this.filter.vehicleGroup = null
      this.resetVehiclesOption()
      this.alertDialog = false
      if (val !== prev) this.initializeMarkers()
    },
    'filter.vehicleGroup' (val, prev) {
      this.filter.vehicleNo = null
      this.resetVehiclesOption()
      this.alertDialog = false
      if (val !== prev) this.updateMarkers()
      if (!val) this.initializeMarkers()
    },
    'filter.vehicleNo' (val, prev) {
      this.alertDialog = false
      if (val !== prev) this.updateMarkers()
      if (!val) this.initializeMarkers()
    }
  },

  async mounted () {
    this.initializeMap()

    const { data } = await this.$store.dispatch('system-settings/find')
    if (data[0]) this.refreshInterval = data[0].mapAutoRefreshInterval * 1000

    this.refreshQueue = setInterval(() => {
      this.updateMarkers()
    }, this.refreshInterval)
    if (this.refreshQueue !== this.$q.localStorage.getItem('refresh')) {
      clearInterval(this.$q.localStorage.getItem('refresh'))
      this.$q.localStorage.set('refresh', this.refreshQueue)
    }
  },

  methods: {
    onScroll ({ index }) {
      if (index === this.options.vehicles.length - 1 && this.total) {
        this.onRequest()
      }
    },
    onOut () {
      this.options.vehicles = this.vehiclesClone
    },
    resetVehiclesOption () {
      this.options.vehicles = []
      this.vehiclesClone = []
      this.skip = 0
      this.total = true
    },
    async initializeMap () {
      const userType = /^\+62/.test(this.$store.getters['auth/user'].mobile)
        ? 'id'
        : 'sg'
      const mapOptions = {
        id: {
          center1: [-7.78692281151881, 112.91954163009042],
          center2: [-8.141127639765628, 112.308752014614172],
          baseLayer: 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
        },
        sg: {
          center1: [1.56073, 104.11475],
          center2: [1.16, 103.502],
          baseLayer: 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png'
        }
      }

      // Get default view of map
      const center = L
        .bounds(mapOptions[userType].center1, mapOptions[userType].center2)
        .getCenter()
      const defaultCoordinate = [center.x, center.y]

      // Initialize map
      Vue.prototype.$map = L.map('mapid').setView(defaultCoordinate, 12)

      // Set tile layer
      const baseLayer = L.tileLayer(
        mapOptions[userType].baseLayer,
        {
          detectRetina: true,
          maxZoom: 19,
          minZoom: 12,
          reuseTiles: true,
          attribution: 'OneMap | Map data &copy; contributors, <a href="http://SLA.gov.sg">Singapore Land Authority</a>'
        }
      )
      baseLayer.addTo(this.$map)

      this.initializeMarkers()

      this.$map.on('resize', e => {
        setTimeout(() => this.$map.invalidateSize(), 500)
      })
    },

    async initializeMarkers () {
      this.vehicles = await this.getVehicles()

      // Loop through the vehicles array using a for loop
      for (let i = this.vehicles.length - 1; i >= 0; i--) {
        const v = this.vehicles[i]

        // Set the marker for the vehicle
        const marker = this.setMarker(v._id)

        if (marker) {
          this.$map.addLayer(marker)
        }
      }

      // Remove markers for vehicles that are not in the current dataset
      const vehicleIds = this.vehicles.map(v => v._id)

      this.$map.eachLayer(layer => {
        if (layer.options.vehicle && !vehicleIds.includes(layer.options.vehicle)) {
          this.$map.removeLayer(layer)
        }
      })
    },

    async updateMarkers () {
      this.vehicles = await this.getVehicles()
      const registeredVehicles = []

      this.$map.eachLayer(layer => {
        try {
          if (layer.options.vehicle || this.filter.vehicleNo || this.filter.vehicleGroup) {
            registeredVehicles.push(layer.options.vehicle)

            const newLocation = this.gettersLocation(layer.options.vehicle)
            const selectedVehicle = this.$store.getters['vehicles/get'](newLocation.vehicle)
            const driver = selectedVehicle.driver || null
            const isMqtt = newLocation.source === 'mqtt'
            const time = this.$moment().diff(newLocation.createdAt, 'minutes')
            const isVehicleOnline = ((time < 30 && (isMqtt || (driver && driver.lastOnline === null))) ? 1 : 0)
            const opacity = isVehicleOnline ? 1.0 : 0.6
            const icon = this.getMarkerIcon(newLocation)
            const popupContent = this.getPopupContent(newLocation)

            layer.setPopupContent(popupContent.default).update()

            if (!newLocation) {
              return this.$map.removeLayer(layer)
            }

            const isVehicleAvailable = this.vehicles.map(v => v._id).includes(layer.options.vehicle)
            const currentLocation = layer.getLatLng()
            const isLocationChange = newLocation.locations.join(',') !== `${currentLocation.lat},${currentLocation.lng}`

            if (!isVehicleAvailable) {
              // Delete marker
              this.$map.removeLayer(layer)
            } else if (isLocationChange) {
              // Move marker and update marker content
              layer.setLatLng(newLocation.locations).update()
            }

            layer
              .setIcon(icon)
              .setOpacity(opacity)
              .update()
          }
        } catch (e) {}
      })

      if (registeredVehicles.length > 0) {
        this.vehicles.map(v => {
          if (registeredVehicles.includes(v._id)) return v

          const newMarker = this.setMarker(v._id)

          if (newMarker && !registeredVehicles.includes(newMarker.options.vehicle)) {
            this.$map.addLayer(newMarker)
          }
        })
      }

      return this.refreshQueue
    },

    setMarker (vehicle) {
      const position = this.gettersLocation(vehicle)

      if (!position) return null

      const selectedVehicle = this.$store.getters['vehicles/get'](position.vehicle)

      if (!selectedVehicle) return null

      const driver = selectedVehicle.driver || null
      const isMqtt = position.source === 'mqtt'
      const time = this.$moment(this.$moment().toISOString()).diff(position.createdAt, 'minutes')
      const isVehicleOnline = ((time < 30 && (isMqtt || (driver && driver.lastOnline === null))) ? 1 : 0)
      // Marker option
      const opacity = isVehicleOnline ? 1.0 : 0.6
      const icon = this.getMarkerIcon(position)
      const marker = L.marker(position.locations, {
        icon,
        opacity,
        vehicle,
        riseOnHover: true
      })

      // Popup option
      const popupContent = this.getPopupContent(position)
      const popup = L.popup({
        vehicle,
        closeButton: false,
        closeOnClick: false,
        offset: [0, -45],
        autoPan: false,
        autoClose: false,
        closeOnEscapeKey: false
      })
        .setLatLng(position.locations)
        .setContent(popupContent.default)

      marker
        .bindPopup(popup)
        .openPopup()
        .on('dblclick', () => false)
        .on('click', async () => {
          const newLocation = this.gettersLocation(selectedVehicle._id)

          if (newLocation) {
            const updatedPopupContent = this.getPopupContent(newLocation)
            const markerPopup = marker.getPopup()

            marker.setPopupContent(
              markerPopup.getContent() !== updatedPopupContent.default
                ? updatedPopupContent.default
                : updatedPopupContent.extended
            )
          }

          marker.openPopup()
        })
        .on('add', () => marker.openPopup())
        .on('mouseover', () => {
          marker.closePopup()
          marker.openPopup()
        })

      return marker
    },
    getMarkerIcon (position) {
      const selectedVehicle = this.$store.getters['vehicles/get'](position.vehicle)
      const driver = selectedVehicle.driver || null
      const isMqtt = position.source === 'mqtt'
      const isVehicleOnline = isMqtt || (driver && driver.lastOnline === null)
      const isVehicleMove = isVehicleOnline && position.speed && position.heading

      return L.divIcon({
        className: '',
        html: `<div class="app-marker ${isMqtt ? 'marker-purple' : 'marker-red'}">
            <i
              class="material-icons marker-icon"
              style="font-size: 2em;${isVehicleMove ? ' transform: rotate(' + position.heading + 'deg)' : ''}"
            >
              ${isVehicleMove ? 'north' : 'stop_circle'}
            </i>
          <div/>`,
        iconSize: [36, 51],
        iconAnchor: [18, 51]
      })
    },
    getPopupContent (position) {
      const selectedVehicle = this.$store.getters['vehicles/get'](position.vehicle)
      const driver = selectedVehicle.driver || null
      const deviceType = (position.source === 'mqtt' ? 'gps' : position.source).toUpperCase()

      return {
        default: `<b>${selectedVehicle.vehicleNo}</b>`,
        extended: `<div>
          <div class="row">
            <div class="col-md-6"><b>${selectedVehicle.vehicleNo}</b></div>
            <div class="col-md-6">
              <div class="text-right">
                <b class="text-h8">${deviceType}</b>
              </div>
            </div>
          ${driver ? driver.fullname : 'No Driver'}
          <div class="text-grey-7 q-pt-sm">
            <b>Last-updated</b>: ${(position.createdAt && this.$moment(position.createdAt).format('DD/MM/YYYY HH:mm')) || ''}</br>
            <b>Location</b>: ${(position.geocodeInfo && position.geocodeInfo.ROAD) || ''}
          </div>
        </div>`
      }
    },

    async getVehicles () {
      if (!this.filter.company && !this.filter.vehicleGroup && !this.filter.vehicleNo) return []

      const companyParams = await this.filterByOrganizationQuery()
      const filterParams = {}

      if (this.filter.vehicleGroup) {
        const vehicles = await this.$store.getters['vehicle-groups/get'](this.filter.vehicleGroup).vehicles

        filterParams._id = { $in: vehicles }
      }

      if (this.filter.vehicleNo) filterParams._id = this.filter.vehicleNo.value
      if (this.filter.company) filterParams.company = this.filter.company

      const vehicle = await this.$store
        .dispatch('vehicles/find', {
          query: { ...companyParams, ...filterParams, $populate: 'driver', status: true, $limit: -1 }
        })
        .then(data => {
          return data.map(({ _id, vehicleNo }) => ({ _id, vehicleNo }))
        })
        .catch([])

      const query = { ...companyParams, ...filterParams, status: true }
      await this.getCurrentAllLocation(query)

      if (!this.alertDialog && this.filter.vehicleNo && this.locations.map(v => v.vehicle).indexOf(this.filter.vehicleNo.value) === -1) {
        this.alertDialog = true
        this.$q.notify({
          color: 'negative',
          message: vehicle[0].vehicleNo + ' location not found',
          icon: 'error',
          position: 'top'
        })
      }

      return vehicle
    },
    getCurrentAllLocation (params) {
      return this.$axiosTracking
        .get('/vehicle-tracking/current-all-locations/params', { params })
        .then(async ({ data }) => {
          data.locations.forEach(datax => {
            let selectedData = datax[this.filter.source]

            if (!selectedData) {
              const source = this.options.sources
                .find(v => v.value !== this.filter.source)
                .value
              selectedData = datax[source]
            }

            if (!selectedData) return null

            if (selectedData && selectedData.locations) {
              selectedData.locations = selectedData.locations.reverse()
            }

            if (this.locations.some(v => v.vehicle === selectedData.vehicle)) {
              this.locations.find(v => v.vehicle === selectedData.vehicle).geocodeInfo = selectedData.geocodeInfo
              this.locations.find(v => v.vehicle === selectedData.vehicle).locations = selectedData.locations
              this.locations.find(v => v.vehicle === selectedData.vehicle).createdAt = selectedData.createdAt
              this.locations.find(v => v.vehicle === selectedData.vehicle).heading = selectedData.heading
              this.locations.find(v => v.vehicle === selectedData.vehicle).speed = selectedData.speed
              this.locations.find(v => v.vehicle === selectedData.vehicle).source = selectedData.source
            } else {
              this.locations.push(selectedData)
            }
          })
        })
        .catch(null)
    },
    gettersLocation (id) {
      return this.locations.some(v => v.vehicle === id) ? this.locations.filter(v => v.vehicle === id)[0] : null
    },
    async onFilterVehicleGroups (val, update) {
      let filterParams = await this.filterByOrganizationQuery()
      if (this.filter.company) filterParams = { company: this.filter.company }

      const query = {
        vehicleGroupName: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        ...filterParams,
        $select: ['_id', 'vehicleGroupName', 'vehicles']
      }

      await this.$store.dispatch('vehicle-groups/find', { query })
        .then(({ data }) => {
          update(() => {
            this.options.vehicleGroups = data.map(({ _id, vehicleGroupName }) => {
              return { label: vehicleGroupName, value: _id }
            })
          })
        })
    },
    async onFilterCompanies (val, update) {
      const query = {
        name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        level: 2,
        $select: ['_id', 'name']
      }

      await this.$store.dispatch('groups/find', { query })
        .then(({ data }) => {
          update(() => {
            this.options.companies = data.map(({ _id, name }) => {
              return { label: name, value: _id }
            })
          })
        })
    },
    async onRequest () {
      if (this.search) return
      else this.skip = this.skip + 50
      let filterParams = await this.filterByOrganizationQuery()
      if (this.filter.company) filterParams = { company: this.filter.company }
      if (this.filter.vehicleGroup) {
        const vehicles = this.$store.getters['vehicle-groups/get'](this.filter.vehicleGroup).vehicles
        if (vehicles.length) filterParams._id = { $in: vehicles }
      }

      const query = {
        vehicleNo: { $regex: `${this.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        ...filterParams,
        $skip: this.skip,
        $limit: 50,
        $select: ['_id', 'vehicleNo'],
        status: true
      }

      await this.$store.dispatch('vehicles/find', { query })
        .then(({ data, total }) => {
          data.map(({ _id, vehicleNo }) => {
            this.options.vehicles.push({ label: vehicleNo, value: _id })
          })

          if (this.options.vehicles.length > data.length) {
            this.vehiclesClone = this.options.vehicles
          }

          if (total === this.options.vehicles.length) this.total = false
        })
    },
    async onFilterVehicles (val, update) {
      if (val && val.length < 3) return
      if (this.search && !val) this.onOut()
      this.search = val
      let filterParams = await this.filterByOrganizationQuery()
      if (this.filter.company) filterParams = { company: this.filter.company }
      if (this.filter.vehicleGroup) {
        const vehicles = this.$store.getters['vehicle-groups/get'](this.filter.vehicleGroup).vehicles
        if (vehicles.length) filterParams._id = { $in: vehicles }
      }

      const query = {
        vehicleNo: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
        ...filterParams,
        $limit: 50,
        $select: ['_id', 'vehicleNo'],
        status: true
      }

      await this.$store.dispatch('vehicles/find', { query })
        .then(({ data, total }) => {
          update(() => {
            if (this.options.vehicles.length && !val) {
              this.options.vehicles.map(({ _id, vehicleNo }) => {
                return { label: vehicleNo, value: _id }
              })
            } else if (val) {
              this.options.vehicles = data.map(({ _id, vehicleNo }) => {
                return { label: vehicleNo, value: _id }
              })
            } else {
              this.options.vehicles = data.map(({ _id, vehicleNo }) => {
                return { label: vehicleNo, value: _id }
              })
            }
            if (!val && total === data.length) this.total = false
          })
        })
    }
  }
}
</script>

<style>
[class*="q-field--standout"] {
  box-shadow: 0 1px 5px #000000a6;
}

[class*="q-field__inner"] {
  background: white;
  border-radius: 4px;
}

.actions-container {
  position: absolute;
  z-index: 2000;
  border-radius: 4px;
  right: 10px;
  top: 10px;
}

.rise-to-top {
  z-index: 2000;
}

.app-marker {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  position: absolute;
  display: flex;
  justify-content: center;
  left: 5px;
}

.app-marker::after {
  content: unset;
  width: 0;
  height: 0;
  position: absolute;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-top: 15px solid;
  bottom: -10px;
}

.app-marker.marker-red {
  background-color: #c62828;
}

.app-marker.marker-red::after {
  border-top-color: #c62828;
}

.app-marker.marker-yellow {
  background-color: #f9a825;
}

.app-marker.marker-yellow::after {
  border-top-color: #f9a825;
}

.app-marker.marker-purple {
  background-color: #3f00ff;
}

.app-marker.marker-purple::after {
  border-top-color: #3f00ff;
}

.marker-icon {
  color: #fff;
  font-weight: bold;
  z-index: 1;
}

.cluster-icon {
  background-color: white;
  color: #c62828;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px #0000001a, 0 2px 4px -1px #0000001a;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: bold;
  border-radius: 100%;
  border: 4px solid #c62828;
}

.map-button {
  font-family: Montserrat, sans-serif;
  box-shadow: 0 1px 5px #000000a6;
}

.leaflet-popup-content {
  padding: 3px;
  margin: 2px;
}
</style>
