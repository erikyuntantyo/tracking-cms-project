<template>
  <q-page>
    <div class="row absolute-full">
      <sidebar
        :vehicles="vehicles"
        :vehicle-groups="vehicleGroups"
        :selected-vehicles="selectedVehicles"
        @vehicle-click="onVehicleClick"
        @broadcast-click="onBroadcastClick"
        @filter-groups="onFilterGroup"
        @clear-group-click="onClearGroupClick"
        :filter.sync="filter"
        :filter-group.sync="filterGroup"
        :selected-group.sync="selectedGroup"
        :selected-company.sync="selectedCompany"
        :groups.sync="groups"
        class="sidebar"
        :is-group="isGroup"
        :sort-by.sync="sortBy"
        :sorts="sorts"
        :visible="visible"
      />

      <div class="col q-py-md q-px-sm full-height bg-conversation">
        <div class="full-height column">
          <div class="col row">
            <conversation
              v-for="(item, index) in threads"
              :key="item.vehicle"
              :threads-index="index"
              :has-new-message="vehicleHasNewMessage(item.vehicle)"
              :conversation-id="item.conversationId"
              :psa-conversation-id="item.psaConversationId"
              :broadcast-conversation-id="item.broadcastConversationId"
              :content.sync="item.content"
              :messages.sync="item.messages"
              :vehicle-no="item.vehicleNo"
              :vehicle="item.vehicle"
              :speed="item.speed"
              :address="item.address"
              :driver="item.driver"
              :minimize.sync="item.minimize"
              :show-minimize="false"
              @close="onThreadClose"
              @load="onLoad"
              @submit="onSubmit"
              @readMessage="onMessageRead(item.vehicle)"
              class="less-conversation"
            />
          </div>
        </div>
      </div>
    </div>
    <q-dialog
      v-model="dialogGroupMsg"
      persistent
    >
      <q-card style="min-width: 700px;">
        <q-card-section align="center">
          <div class="text-h6">
            Send Group Message
          </div>
        </q-card-section>
        <q-form @submit="sendBroadcast">
          <q-card-section
            class="q-pt-none"
            align="center"
          >
            <div class="q-gutter-sm">
              <q-radio
                v-model="typeMessage"
                color="red-10"
                val="vehicles"
                label="Select Vehicles"
              />
              <q-radio
                v-model="typeMessage"
                color="red-10"
                val="groups"
                label="Select Vehicle Groups"
              />
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-checkbox
              v-if="typeMessage === 'vehicles'"
              size="xs"
              v-model="checkall"
              color="red-10"
              @input="checkAllVehicles"
              val="xs"
              label="Select All"
            />

            <q-select
              v-if="typeMessage === 'vehicles'"
              v-model="broadcastVehicles"
              label="Vehicles"
              clearable
              use-input
              use-chips
              multiple
              :options="options.vehicles"
              @filter="onFilterVehicles"
              color="red-9"
              @virtual-scroll="onScroll"
              @blur="onOut"
              :rules="[
                val => val && val.length > 0 || 'Please type something'
              ]"
            >
              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <div
              v-if="typeMessage === 'groups'"
              class="row col-12"
            >
              <div class="col-6 q-pa-md">
                <q-checkbox
                  v-if="typeMessage === 'groups'"
                  size="xs"
                  v-model="checkallgroup"
                  color="red-10"
                  @input="checkAllGroups"
                  val="xs"
                  label="Select All"
                />

                <q-select
                  v-model="broadcastGroups"
                  label="Vehicle Groups"
                  clearable
                  use-input
                  use-chips
                  multiple
                  @add="value => { onAddGroupsChange(value) }"
                  @remove="value => { onRemoveGroupsChange(value) }"
                  @clear="value => { onClearGroups(value) }"
                  :options="options.groups"
                  @filter="onFilterGroups"
                  color="red-9"
                  :rules="[
                    val => val && val.length > 0 || 'Please type something'
                  ]"
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
              <div class="col-6 q-pa-md">
                <ul>
                  <li
                    v-for="vehicle in vehiclesForGroups"
                    :key="vehicle._id"
                  >
                    {{ vehicle.vehicleNo }}
                    <span
                      class="close"
                      @click="deleteVehicles(vehicle._id)"
                    >&times;</span>
                  </li>
                </ul>
              </div>
            </div>
            <q-input
              v-model="broadcastMessage"
              filled
              type="textarea"
              label="Enter messages here ..."
              color="red-9"
              :rules="[
                val => val && val.length > 0 || 'Please type something'
              ]"
            />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn
              flat
              no-caps
              label="Back"
              v-close-popup
            />
            <q-btn
              type="submit"
              label="Send"
              flat
              no-caps
              color="red-9"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapMutations, mapActions, mapGetters } from 'vuex'
import { filter, orderBy, findIndex, clone } from 'lodash'
import Sidebar from './components/Sidebar'
import Conversation from './components/Conversation'

export default {
  name: 'IndexMessage',

  components: {
    Conversation,
    Sidebar
  },
  data () {
    return {
      title: 'Messaging',
      vehicles: [],
      vehiclesSend: [],
      vehicleGroups: [],
      groups: [],
      selectedGroup: [],
      vehicleGroupSelected: [],
      threads: [],
      selectedVehicles: [],
      sortBy: 'latest message',
      sorts: ['latest message', 'unread message', 'ascending', 'descending'],
      filter: '',
      filterGroup: '',
      isGroup: false,
      dialogGroupMsg: false,
      typeMessage: 'vehicles',
      broadcastVehicles: [],
      broadcastGroups: [],
      broadcastMessage: '',
      options: {
        vehicles: [],
        groups: []
      },
      company: null,
      checkall: false,
      checkallgroup: false,
      vehiclesForGroups: [],
      vehiclesForGroupsReal: [],
      groupId: null,
      titlePage: this.$store.state.message.titlePage,
      vehicleNewMessage: 0,
      selectedCompany: this.$store.getters['auth/user'].company ? this.$store.getters['auth/user'].company._id || this.$store.getters['auth/user'].company : localStorage.getItem('selected-company'),
      unmessageArray: [],
      proccessNewMessage: [],
      tempNewMessage: [],
      visible: false,
      conversation: null,
      forCdas: false,
      setCurrentLocation: null,
      vehiclesClone: [],
      skip: 0,
      search: '',
      total: true,
      filterVehicle: []
    }
  },
  meta () {
    const newMessages = filter(this.vehiclesSend, 'hasNewMessage')
    return {
      title: 'CTR',
      titleTemplate: title => `${title} ${newMessages.length > 0 ? ' (New Message)' : ' - ' + this.$router.currentRoute.meta.title}`
    }
  },
  async created () {
    const getFilters = clone(this.$store.state.messagefilters.filters)
    await this.getterVehicles()
    await this.getVehicles()
    await this.getVehicleGroups()
    await this.setUserInfo()

    if (getFilters) {
      const hasVehicleSelected = localStorage.getItem('vehicles')
      this.selectedGroup = getFilters.filterGroup
      if (getFilters.filter.length > 0) this.filter = getFilters.filter
      if (getFilters.filterGroup.length > 0) await this.getGroups()
      if (hasVehicleSelected.length > 0) {
        localStorage.setItem('vehicles', JSON.stringify(hasVehicleSelected))
      }
    }

    await this.setSelectedVehicles()
  },

  watch: {
    filter: 'getVehicles',
    async selectedCompany (v) {
      await this.getterVehicles()
      await this.getVehicles()
      this.resetThreads()
      await this.getVehicleGroups()

      if (v) localStorage.setItem('selected-company', v)
      else {
        localStorage.removeItem('selected-company')
        this.selectedGroup = []
        this.vehicleGroupSelected = []
      }
    },
    selectedGroup (v) {
      this.onGroupClick(v)
    },
    filterGroup: 'getVehicleGroups',
    threads (v) {
      if (this.threads.length <= 2) {
        this.threads.map(val2 => {
          val2.minimize = false
          return val2
        })
      }

      if (v.length > 5) {
        v.pop()
      }

      this.selectedVehicles = v.map(val3 => val3.vehicle)
      localStorage.setItem('vehicles', JSON.stringify(this.selectedVehicles))
      this.setFilterStore()
    },
    async sortBy (v) {
      switch (v) {
        case 'latest message':
          this.sortVehicleByMessages()
          break

        case 'unread message':
          this.sortVehicleByUnread()
          break

        case 'ascending':
          this.vehicles.sort((a, b) => {
            if (a.vehicleNo.toUpperCase() > b.vehicleNo.toUpperCase()) return 1
            if (a.vehicleNo.toUpperCase() < b.vehicleNo.toUpperCase()) return -1

            return 0
          })
          break

        case 'descending':
          this.vehicles.sort((a, b) => {
            if (a.vehicleNo.toUpperCase() > b.vehicleNo.toUpperCase()) return -1
            if (a.vehicleNo.toUpperCase() < b.vehicleNo.toUpperCase()) return 1

            return 0
          })
          break
      }
    },
    '$store.state.message.titlePage': {
      handler (title) {
        this.titlePage = title
      }
    },
    vehicleGroupSelected: 'resetThreads'
  },

  sockets: {
    async reconnect () {
      location.reload()
    },
    async 'messages created' (data) {
      this.tempNewMessage.push(data)
      if (data.content) this.pushMessage()
    },
    async 'messages submitted' (data) {
      this.tempNewMessage.push(data)
      if (data.content) this.pushMessage()
    },
    async 'messages patched' (data) {
      let messages = []
      const recipientStatus = data.recipientStatus
      const objIndex = findIndex(recipientStatus, { readBy: 'driver' })
      const threadIndex = this.threads.findIndex(
        v => v.vehicle === data.conversations.vehicle
      )

      if (this.threads[threadIndex] !== undefined) {
        messages = this.threads[threadIndex].messages

        messages.map(async v => {
          if (!v._id || !data._id) {
            return v
          }
          const vConversationId = v._id.toString()
          const dataConversationId = data._id.toString()
          if (!v.isRead) {
            if (vConversationId === dataConversationId) {
              this.showReadStatus(objIndex, v, data)
              return v
            } else {
              return v
            }
          }
        })
      }
    }
  },

  methods: {
    ...mapMutations({
      updateTitlePage: 'message/updateTitlePage',
      setFilters: 'messagefilters/setFilters'
    }),
    ...mapGetters({
      getAuthUser: 'auth/user'
    }),
    ...mapActions('roles-acl', {
      getRole: 'get'
    }),
    onScroll ({ index }) {
      if (index === this.options.vehicles.length - 1 && this.total) {
        this.onRequest()
      }
    },
    onOut () {
      this.options.vehicles = this.vehiclesClone
    },
    async pushMessage (data) {
      this.proccessNewMessage = this.proccessNewMessage.length === 0 ? clone(this.tempNewMessage) : this.proccessNewMessage

      const userID = this.getAuthUser()._id

      // Set new message status to vehicle box
      if (this.proccessNewMessage.length > 0) {
        this.tempNewMessage = []

        await Promise.all(this.proccessNewMessage.map(async (data, index) => {
          if (!data.sender || (data.sender._id !== userID) || (data.flagFrom === 'broadcast')) {
            if (!['broadcast', 'admin-broadcast'].includes(data.conversations.type)) {
              if (data.conversations.vehicle) {
                const selectedVehicleIndex = this.vehiclesSend.findIndex(v => v._id === data.conversations.vehicle)
                if (this.vehiclesSend[selectedVehicleIndex]) {
                  this.vehiclesSend[selectedVehicleIndex].hasNewMessage = true
                  this.vehiclesSend[selectedVehicleIndex].messagesTotal += 1
                  this.vehiclesSend[selectedVehicleIndex].latestMessageDate = this.$moment().toISOString()
                  if (['latest message', 'unread message'].indexOf(this.sortBy) !== -1) {
                    this.vehiclesSend.splice(0, 0, this.vehiclesSend.splice(selectedVehicleIndex, 1)[0])
                  }
                }
                const selectedVehiclesIndex = this.vehicles.findIndex(v => v._id === data.conversations.vehicle)
                if (this.vehicles[selectedVehiclesIndex]) {
                  this.vehicles[selectedVehiclesIndex].hasNewMessage = true
                  this.vehicles[selectedVehiclesIndex].messagesTotal += 1
                  this.vehicles[selectedVehiclesIndex].latestMessageDate = this.$moment().toISOString()
                  if (['latest message', 'unread message'].indexOf(this.sortBy) !== -1) {
                    this.vehicles.splice(0, 0, this.vehicles.splice(selectedVehiclesIndex, 1)[0])
                  }
                }
              }
            }
          }
          // Inserting common message
          if (data.conversations && this.threads.some(v => v.vehicle === data.conversations.vehicle)) {
            const message = await this.formatMessage(data)
            const threadIndex = this.threads.findIndex(
              v => v.vehicle === data.conversations.vehicle
            )
            // update read recipt
            const convSend = {}
            convSend.conversationId = data.conversationId
            this.startEndDateBuilder(1, [data])
            this.updateMessageRecipientStatus(data.conversations.vehicle, convSend)
            if (!this.threads[threadIndex].driver) {
              const { content, sender } = data
              if (content.includes('logged in')) {
                const lastDriver = this.threads.findIndex(
                  v => v.driver === sender.fullname
                )

                if (lastDriver !== -1 && this.threads[lastDriver].vehicleNo !== this.threads[threadIndex].vehicleNo) {
                  this.threads[lastDriver].driver = ''
                  this.threads[threadIndex].driver = sender.fullname
                } else {
                  this.threads[threadIndex].driver = sender.fullname
                }

                this.getterVehicles()
              }
            }
            this.threads[threadIndex].messages = [
              ...this.threads[threadIndex].messages,
              message
            ]
            this.threads[threadIndex].counter += 1
          }
          // reset data proccess
          if (index === this.proccessNewMessage.length - 1) {
            this.proccessNewMessage = []
            this.loopFunction()
          }
        }))
      }
    },

    loopFunction () {
      this.pushMessage()
    },

    resetThreads () {
      this.threads = []
      this.selectedVehicles = []
      localStorage.removeItem('vehicles')
    },
    async setSelectedVehicles () {
      if (localStorage.getItem('vehicles')) {
        let selectedVehicles = JSON.parse(localStorage.getItem('vehicles'))
        if (typeof selectedVehicles === 'string') selectedVehicles = JSON.parse(selectedVehicles)
        if (selectedVehicles && selectedVehicles.length) {
          this.visible = true
          let vehicles = this.vehicles.filter(v => {
            return selectedVehicles.includes(v._id)
          })
          if (vehicles.length > 0) vehicles = await Promise.all(vehicles.map(v => v._id))
          vehicles = [...selectedVehicles, ...vehicles]
          vehicles = vehicles.map(e => e).map((e, i, final) => final.indexOf(e) === i && i).filter((e) => vehicles[e]).map(e => vehicles[e])

          const lengthThreads = selectedVehicles.length -= 1

          for (let i = 0; i < vehicles.length; i++) {
            await this.onVehicleClick(vehicles[i])
            if (i === lengthThreads) {
              this.visible = false
            }
          }
        }

        setTimeout(() => { this.visible = false }, 3)
      }
    },
    async updateMessageRecipientStatus (
      vehicleId, { conversationId, psaConversationId, broadcastConversationId, adminBroadcastConversationId }
    ) {
      const userId = this.getAuthUser()._id
      const allConversationIds = []

      if (conversationId) {
        allConversationIds.push(conversationId)
      }

      if (psaConversationId) {
        allConversationIds.push(psaConversationId)
      }

      if (broadcastConversationId) {
        allConversationIds.push(broadcastConversationId)
      }

      if (adminBroadcastConversationId) {
        allConversationIds.push(adminBroadcastConversationId)
      }

      const query = {
        conversationId: { $in: allConversationIds },
        _id: { $in: this.unmessageArray }
      }

      if (this.unmessageArray.length > 0) {
        this.$store.dispatch('messages/patch', [null, {
          $push: {
            recipientStatus: {
              user: userId,
              vehicle: vehicleId,
              status: 'read',
              readBy: 'controller',
              updatedAt: Date.now()
            }
          }
        }, {
          query
        }])
      }
      this.unmessageArray = []
    },
    vehicleHasNewMessage (vehicle) {
      const vehicles = this.vehiclesSend.filter(v => v._id === vehicle)
      return vehicles.length && vehicles[0].hasNewMessage
    },
    sortVehicleByMessages () {
      this.vehicles.sort((a, b) => {
        const date1 = this.$moment(a.latestMessageDate || '1990-01-01')
        const date2 = this.$moment(b.latestMessageDate || '1990-01-01')

        return -date1.diff(date2)
      })
    },
    sortVehicleByUnread () {
      this.vehicles.sort((a, b) => {
        const date1 = this.$moment(a.latestMessageDate || '1990-01-01')
        const date2 = this.$moment(b.latestMessageDate || '1990-01-01')
        return b.hasNewMessage - a.hasNewMessage || -date1.diff(date2)
      })
    },

    async getConversationData (id) {
      const getConversationData = await this.$store
        .dispatch('conversations/find', {
          query: {
            $or: [
              { type: 'group', vehicle: id },
              { type: 'psa-message', vehicle: id }
            ]
          }
        })
        .then(res => {
          if (res.total) {
            const groupConversation = res.data.filter(v => v.type === 'group')
            const psaConversation = res.data.filter(v => v.type === 'psa-message')
            const broadcastConversation = res.data.filter(v => v.type === 'broadcast')
            const adminBroadcastConversation = res.data.filter(v => v.type === 'admin-broadcast')
            let members = []

            if (groupConversation.length) members = members.concat(groupConversation.members)
            if (psaConversation.length) members = members.concat(groupConversation.members)

            members = [...new Set(members)]

            return {
              conversationId: (groupConversation.length && groupConversation[0]._id) || null,
              psaConversationId: (psaConversation.length && psaConversation[0]._id) || null,
              broadcastConversationId: (broadcastConversation.length && broadcastConversation[0]._id) || null,
              adminBroadcastConversationId: (adminBroadcastConversation.length && adminBroadcastConversation[0]._id) || null,
              members
            }
          }

          return {
            conversationId: null,
            psaConversationId: null,
            broadcastConversationId: null,
            adminBroadcastConversationId: null,
            members: []
          }
        })
        .catch(() => ({
          conversationId: null,
          psaConversationId: null,
          broadcastConversationId: null,
          adminBroadcastConversationId: null,
          members: []
        }))
      return getConversationData
    },
    async getMessagesData (vehicleNo) {
      const threadIndex = this.threads.findIndex(v => v.vehicleNo === vehicleNo)
      const thread = this.threads[threadIndex]

      if (!thread) return []

      const cacheMessages = [...thread.messages]

      const messages = await this.$feathersClient.service('messages/vehicle').get(thread.vehicle, {
        query: {
          $limit: 10,
          $skip: thread.messages ? thread.messages.length : 0
        }
      })

      thread.counter += 10

      await this.startEndDateBuilder(thread.counter, messages)

      await Promise.all(messages.map(v => {
        v.date = this.$moment(v.createdAt).format('DD/MM/YYYY')
        v.time = this.$moment(v.createdAt).format('HH:mm:ss')
        v.content = v.content.replace(/(\r\n|\r|\n)/g, '<br/>')

        const objIndex = v.recipientStatus.findIndex(obj => obj.readBy === 'driver')

        this.showReadStatus(objIndex, v)

        return v
      }))

      const updatedMessages = cacheMessages.concat(messages)
      updatedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

      const vehicle = this.vehicles.filter(v => v.vehicleNo === vehicleNo)[0]

      await this.updateMessageRecipientStatus(vehicle._id, this.conversation, 'getMessagesData')

      return updatedMessages
    },
    getUserOrganization () {
      const user = this.getAuthUser()
      let organization = null

      if (user.group) {
        organization = { group: user.group._id || user.group, company: null }

        if (user.company) organization.company = user.company._id || user.company
      }

      return organization
    },
    async getVehicleGroups () {
      if (!this.selectedCompany) {
        return
      }

      const user = this.getAuthUser()
      const roleAcl = user.roleAcl._id ? user.roleAcl : await this.getRole(user.roleAcl)
      const userRoles = process.env.USER_ROLES[process.env.NODE_ENV]
      const query = { $limit: 9999999 }

      if (roleAcl._id === userRoles.transporterController) {
        const organization = this.getUserOrganization()

        if (organization) {
          query.group = organization.group

          organization.company
            ? (query.company = organization.company)
            : (query.$or = [{ company: null }, { company: { $exists: false } }])

          organization.company ? this.company = organization.company : this.company = null
        }
      }

      if (this.filterGroup) {
        query.vehicleGroupName = {
          $regex: `${this.filterGroup.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
          $options: 'i'
        }
      }

      if (!query.company) query.company = this.selectedCompany || { $exists: false }

      try {
        const groups = await this.$store.dispatch('vehicle-groups/find', { query })
          .then(({ data }) => data)

        this.vehicleGroups = await Promise.all(
          groups.map(async ({ _id, vehicleGroupName, vehicles }) => {
            return {
              _id,
              vehicleGroupName,
              vehicles
            }
          })
        )
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch vehicle groups',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async getterVehicles () {
      if (this.selectedCompany) {
        this.vehiclesSend = this.vehicles = this.filterVehicle = await this.$feathersClient.service('threads').find({
          query: {
            company: this.selectedCompany,
            status: true
          }
        })
      }
    },
    async getVehicles () {
      if (!this.selectedCompany) {
        this.vehicles = []
        this.vehiclesSend = []

        return
      }

      const query = {}

      if (this.filter && this.filter.length < 3) {
        return
      }

      if (this.vehicleGroupSelected <= 0) {
        const organization = this.getUserOrganization()

        if (organization) {
          query.group = organization.group

          organization.company
            ? (query.company = organization.company)
            : (query.$or = [{ company: null }, { company: { $exists: false } }])

          organization.company ? this.company = organization.company : this.company = null
        }
      } else {
        query._id = {
          $in: this.vehicleGroupSelected
        }
      }
      this.vehicles = this.vehiclesSend

      if (this.vehicleGroupSelected.length) {
        this.vehicles = this.filterVehicle = this.vehicles.filter(v => {
          if (this.vehicleGroupSelected.includes(v._id)) return v
        })
      }
      if (this.filter) {
        const regex = new RegExp(`${this.filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
        this.vehicles = filter(this.vehicles, obj => regex.test(obj.vehicleNo))
      }

      this.sortVehicleByMessages()
      await this.checkNewMessage()
      this.setFilterStore()
    },
    async onGroupClick (param) {
      await this.getVehicleGroupsSelected(param)
      await this.getVehicles()
      this.sortBy = 'latest message'
    },
    async setFilterStore () {
      let vehicleFilters = []
      if (!this.selectedGroup) this.selectedGroup = []

      if (this.selectedGroup.length > 0 || this.selectedCompany) {
        vehicleFilters = this.filterVehicle
      }

      const data = {
        filter: this.filter,
        vehicles: (vehicleFilters.length > 0) ? vehicleFilters : [],
        filterGroup: this.selectedGroup,
        company: this.selectedCompany
      }

      localStorage.setItem('filters', JSON.stringify(data))
      this.setFilters(data)
    },
    async onFilterGroup (param) {
      await this.onFilterGroupSide(param.val, param.update)
    },
    async onClearGroupClick () {
      this.selectedGroup = []
      this.vehicleGroupSelected = []
      this.setFilterStore()
      await this.getVehicles()
    },
    async onVehicleClick (id) {
      const vehicleIndex = findIndex(this.vehicles, { _id: id })
      const checkIndex = findIndex(this.threads, { vehicle: id })
      this.vehicles[vehicleIndex].loadProccess = true
      this.onMessageRead(id)
      await this.checkNewMessage()

      if (checkIndex !== -1) {
        this.threads.splice(checkIndex, 1)
        setTimeout(() => { delete this.vehicles[vehicleIndex].loadProccess }, 500)
      } else {
        this.selectedVehicles.push(id)
        this.openMessage(id)
      }
    },
    async openMessage (id) {
      const vehicle = this.vehicles.filter(v => v._id === id)[0]

      if (vehicle) {
        const members = vehicle.driver ? [vehicle.driver._id] : []
        const lconversation = await this.getConversationData(vehicle._id)
        this.conversation = lconversation
        this.conversation.members = this.conversation.members.concat(members)

        let driver = ''

        if (vehicle.driver) {
          driver = vehicle.driver.fullname || vehicle.driver.username
        }

        this.vehicles
          .filter(v => v._id === id)
          .map(v => (v.hasNewMessage = false))

        const data = {
          vehicle: vehicle._id,
          vehicleNo: vehicle.vehicleNo,
          address: 'Unknown Location',
          speed: 0,
          content: '',
          driver,
          counter: 0,
          minimize: false,
          ...lconversation,
          messages: [],
          openedAt: new Date().toISOString()
        }

        this.threads.unshift(data)
        delete vehicle.loadProccess

        clearTimeout(this.setCurrentLocation)
        this.setCurrentLocation = setTimeout(() => { this.getCurrentLocation() }, 5000)
      }
    },
    getCurrentLocation () {
      const notDetectedLocation = this.threads.filter(v => v.address === 'Unknown Location')

      if (notDetectedLocation.length < 5) {
        this.threads.filter(v => v.address === 'Unknown Location').forEach((val, index) => {
          this.$axiosTracking
            .get(`/vehicle-tracking/current-locations/${val.vehicle}`)
            .then(({ data }) => {
              const selectedGps = data.mqtt || data.app

              this.threads[index].address = (selectedGps && selectedGps.geocodeInfo && selectedGps.geocodeInfo.ROAD) || ''

              this.threads[index].speed = (selectedGps && Math.ceil(selectedGps.speed)) || 0
            })
            .catch(null)
        })
      } else {
        this.threads.forEach((val, index) => {
          this.$axiosTracking
            .get(`/vehicle-tracking/current-locations/${val.vehicle}`)
            .then(({ data }) => {
              const selectedGps = data.mqtt || data.app

              this.threads[index].address = (selectedGps && selectedGps.geocodeInfo && selectedGps.geocodeInfo.ROAD) || ''

              this.threads[index].speed = (selectedGps && Math.ceil(selectedGps.speed)) || 0
            })
            .catch(null)
        })
      }
    },
    onMessageRead (id) {
      this.vehiclesSend.filter(v => v._id === id).map(v => (v.hasNewMessage = false))
    },
    onThreadClose (id) {
      this.threads = this.threads.filter(v => v.vehicleNo !== id)
    },
    async onLoad (data, done) {
      let messages = []
      const findThread = (this.threads && this.threads.length > 0) ? this.threads.filter(v => v.vehicleNo === data.vehicleNo) : []

      if (findThread[0].messages.length === findThread[0].counter) {
        messages = await this.getMessagesData(data.vehicleNo)
      }

      if (messages.length > 0 && findThread.length > 0) {
        findThread[0].messages = messages

        if (findThread[0].messages.length < findThread[0].counter) done(true)
      }

      done()
    },
    async onSubmit (vehicleNo) {
      const threadIndex = this.threads.findIndex(v => v.vehicleNo === vehicleNo)
      const thread = this.threads[threadIndex]

      if (thread.content) {
        try {
          const vehicle = this.vehiclesSend.filter(v => v._id === thread.vehicle)[0] || null

          thread.content = thread.content.replace(/(\r\n|\r|\n)/g, '<br/>')

          const data = {
            type: 'group',
            vehicle: thread.vehicle,
            company: vehicle.company,
            messages: {
              type: 'text',
              sender: this.getAuthUser()._id,
              content: thread.content
            }
          }

          if (thread.conversationId) {
            data.conversationId = thread.conversationId
          } else {
            await this.$store
              .dispatch('conversations/find', {
                paginate: false,
                query: {
                  type: 'group',
                  vehicle: thread.vehicle
                }
              })
              .then(res => {
                if (res.data.length) data.conversationId = res.data[0]._id
              })
          }

          await this.$store.dispatch('messages/create', data).then(res => {
            this.threads[threadIndex].conversationId = res.conversationId
          })

          this.vehicles
            .filter(v => v._id === thread.vehicle)
            .map(v => {
              v.messagesTotal += 1

              return v
            })
          this.threads[threadIndex].content = ''
        } catch (err) {
          this.$q.notify({
            color: 'negative',
            message: err.message || 'Failed to send message',
            icon: 'error',
            position: 'top'
          })
        }
      }
    },

    formatMessages (data) {
      return Promise.all(data.map(v => this.formatMessage(v)))
    },
    async formatMessage (item) {
      let sender = ''
      let isOwnMessage = false

      if (item.sender) {
        sender = item.sender.fullname
        isOwnMessage = this.getAuthUser()._id === item.sender._id
      }

      if (['psa-message', 'broadcast'].includes(item.conversations.type)) {
        sender = 'Portnet'
      } else if (item.conversations.type === 'admin-broadcast') {
        sender = 'CDAS'
      } else if (item.flagFrom === 'ctr-message') {
        sender = 'CTR'
      }

      if (item.isDriver && sender !== 'Portnet' && sender !== 'CTR') {
        sender = this.selectedVehicles
      }

      if (['admin-broadcast', 'broadcast'].includes(item.conversations.type)) sender += ' (Broadcast)'

      let isRead = false
      if (isOwnMessage) {
        const objIndex = item.recipientStatus.findIndex(obj => obj.readBy === 'driver')
        if (objIndex !== -1) isRead = true
      }

      return {
        _id: item._id,
        sender,
        content: item.content,
        isSent: isOwnMessage,
        isDriver: item.isDriver,
        isRead: isRead,
        date: this.$moment(item.createdAt).format('DD/MM/YYYY'),
        time: this.$moment(item.createdAt).format('HH:mm:ss'),
        createdAt: item.createdAt,
        type: item.conversations.type,
        recipientStatus: item.recipientStatus,
        conversationId: item.conversations.conversationId
      }
    },
    async onBroadcastClick () {
      this.dialogGroupMsg = true
    },
    async onRequest () {
      try {
        if (this.search) return
        else this.skip = this.skip + 50
        const query = {
          $limit: 50,
          $skip: this.skip,
          vehicleNo: { $regex: `${this.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          company: this.company ? this.company : { $exists: false },
          $select: ['_id', 'vehicleNo'],
          status: true
        }

        if (this.forCdas) delete query.company

        const { data, total } = await this.$store.dispatch('vehicles/find', { query })

        data.map(({ _id, vehicleNo }) => {
          this.options.vehicles.push({ label: vehicleNo, value: _id })
        })

        if (this.options.vehicles.length > data.length) {
          this.vehiclesClone = this.options.vehicles
        }

        if (total === this.options.vehicles.length) this.total = false
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch vehicles',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async onFilterVehicles (val, update) {
      try {
        if (val && val.length < 3) return
        if (this.search && !val) this.onOut()
        this.search = val
        const query = {
          $limit: 50,
          vehicleNo: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          company: this.company ? this.company : { $exists: false },
          $select: ['_id', 'vehicleNo'],
          status: true
        }

        if (this.forCdas) delete query.company

        const { data, total } = await this.$store.dispatch('vehicles/find', { query })

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
        })
        if (!val && total === this.options.vehicles.length) this.total = false
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch vehicles',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async onFilterGroups (val, update) {
      try {
        const query = {
          vehicleGroupName: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          company: this.company ? this.company : { $exists: false },
          $select: ['_id', 'vehicleGroupName']
        }

        if (this.forCdas) delete query.company

        const { data } = await this.$store.dispatch('vehicle-groups/find', { query })

        update(() => {
          this.options.groups = data.map(({ _id, vehicleGroupName }) => {
            return { label: vehicleGroupName, value: _id }
          })
        })
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch vehicle groups',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async onFilterGroupSide (val, update) {
      try {
        const query = {
          vehicleGroupName: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          company: this.selectedCompany ? this.selectedCompany : { $exists: false }
        }

        const { data } = await this.$store.dispatch('vehicle-groups/find', { query })

        update(() => {
          this.groups = data.map(({ _id, vehicleGroupName }) => {
            return { label: vehicleGroupName, value: _id }
          })
        })
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch vehicle groups',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async sendBroadcast () {
      try {
        let vehiclesSend = []

        if (this.typeMessage === 'vehicles') {
          vehiclesSend = this.broadcastVehicles ? this.broadcastVehicles.map(v => v.value) : []
        } else {
          vehiclesSend = this.vehiclesForGroups ? this.vehiclesForGroups.map(v => v._id) : []
        }
        const brBroadcastMsg = this.broadcastMessage.replace(/(\r\n|\r|\n)/g, '<br/>')
        const data = {
          company: this.company,
          messages: {
            type: 'text',
            sender: this.getAuthUser()._id,
            content: brBroadcastMsg
          },
          vehicles: vehiclesSend
        }

        await this.$store.dispatch('message/broadcast', data).then(res => {})

        this.broadcastMessage = ''
        this.broadcastVehicles = []

        this.broadcastGroups = []
        this.vehiclesForGroups = []
        this.vehiclesForGroupsReal = []

        this.checkall = false
        this.checkallgroup = false

        this.$q.notify({
          color: 'positive',
          message: 'Success to send broadcast message',
          icon: 'done',
          position: 'top'
        })
        this.dialogGroupMsg = false
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to send message',
          icon: 'error',
          position: 'top'
        })
      }
    },
    async checkAllVehicles (v) {
      if (v) {
        const organization = this.getUserOrganization()
        const query = { $limit: 9999999, $select: ['_id', 'vehicleNo'], status: true }

        if (organization) {
          query.group = organization.group

          organization.company
            ? (query.company = organization.company)
            : (query.$or = [{ company: null }, { company: { $exists: false } }])

          organization.company ? this.company = organization.company : this.company = null
        }

        const vehicles = await this.$store.dispatch('vehicles/find', { query })
          .then(({ data }) => data)

        this.broadcastVehicles = vehicles.map(({ _id, vehicleNo }) => {
          return { label: vehicleNo, value: _id }
        })
      } else {
        this.broadcastVehicles = []
      }
    },
    async checkAllGroups (v) {
      if (v) {
        const organization = this.getUserOrganization()
        const query = { $limit: 9999999 }

        if (organization) {
          query.group = organization.group

          organization.company
            ? (query.company = organization.company)
            : (query.$or = [{ company: null }, { company: { $exists: false } }])

          organization.company ? this.company = organization.company : this.company = null
        }

        const groups = await this.$store.dispatch('vehicle-groups/find', { query })
          .then(({ data }) => data)

        this.broadcastGroups = groups.map(({ _id, vehicleGroupName }) => {
          return { label: vehicleGroupName, value: _id }
        })

        for (let i = 0; i < this.broadcastGroups.length; i++) {
          await this.onAddGroupsChange(this.broadcastGroups[i])
        }
      } else {
        for (let j = 0; j < this.broadcastGroups.length; j++) {
          await this.onRemoveGroupsChange(this.broadcastGroups[j])
        }

        this.broadcastGroups = []
      }
    },
    async deleteVehicles (id, groupId = null) {
      if (groupId) {
        this.vehiclesForGroupsReal = this.vehiclesForGroupsReal.filter(function (obj) {
          return obj.groupId !== groupId
        })
      } else {
        this.vehiclesForGroupsReal = this.vehiclesForGroupsReal.filter(function (obj) {
          return obj._id !== id
        })
      }
      this.vehiclesForGroups = this.vehiclesForGroupsReal.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t._id === thing._id && t.vehicleNo === thing.vehicleNo
        ))
      )
    },
    async onAddGroupsChange (val) {
      /** get list vehicles **/
      const self = this
      this.groupId = (val.value.value) ? val.value.value : val.value
      let vehicleGroups = []

      await this.$store.dispatch('vehicle-groups/get', this.groupId).then(res => {
        vehicleGroups = res.vehicles
      })

      const query = { $limit: 9999999, status: true }

      query._id = {
        $in: vehicleGroups
      }

      const vehicles = await this.$store.dispatch('vehicles/find', { query })
        .then(({ data }) => data)

      const vehiclesForGroup = await Promise.all(vehicles.map(({ _id, vehicleNo }) => {
        return {
          _id,
          vehicleNo,
          groupId: self.groupId
        }
      }))

      this.vehiclesForGroupsReal = vehiclesForGroup.concat(this.vehiclesForGroupsReal)
      this.vehiclesForGroups = this.vehiclesForGroupsReal.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t._id === thing._id && t.vehicleNo === thing.vehicleNo
        ))
      )
    },
    async onRemoveGroupsChange (val) {
      /** get list vehicles **/
      const groupId = (val.value.value) ? val.value.value : val.value
      let vehicleGroups = []

      await this.$store.dispatch('vehicle-groups/get', groupId).then(res => {
        vehicleGroups = res.vehicles
      })

      const query = { $limit: 9999999, status: true }

      query._id = {
        $in: vehicleGroups
      }

      const vehicles = await this.$store.dispatch('vehicles/find', { query })
        .then(({ data }) => data)

      for (let i = 0; i < vehicles.length; i++) {
        const vehicleId = vehicles[i]._id
        await this.deleteVehicles(vehicleId, groupId)
      }
    },
    async onClearGroups (val) {
      for (let i = 0; i < val.length; i++) {
        await this.onRemoveGroupsChange(val[i])
      }
    },
    async getVehicleGroupsSelected (val) {
      this.vehicleGroupSelected = []

      if (!val || val.length === 0) {
        return val
      }
      /** get list vehicles **/
      const query = {
        $limit: 999999999,
        company: this.selectedCompany ? this.selectedCompany : { $exists: false },
        _id: { $in: val }
      }

      const { data } = await this.$store.dispatch('vehicle-groups/find', { query })

      data.map(({ vehicles }) => {
        vehicles.map(v => {
          this.vehicleGroupSelected.push(v)
        })
      })
    },
    async checkNewMessage () {
      this.vehicleNewMessage = 0
      this.vehiclesSend.map(v => {
        if (v.hasNewMessage) this.vehicleNewMessage++
      })

      if (this.vehicleNewMessage > 0) {
        this.updateTitlePage('New Message')
      } else {
        this.updateTitlePage('CTR')
      }
    },
    async startEndDateBuilder (thread, data) {
      if (data.length === 0) return false

      const userId = this.getAuthUser()._id
      const endSkip = thread
      const startSkip = (endSkip) ? endSkip - 10 : 0
      let dataDate = data.slice(startSkip, endSkip)

      dataDate = orderBy(dataDate, ['createdAt'], ['asc'])

      dataDate.map(data => {
        if (data.recipientStatus.length > 0) {
          const unread = filter(data.recipientStatus, { user: userId })
          if (unread.length === 0) this.unmessageArray.push([data._id])
        } else {
          this.unmessageArray.push(data._id)
        }
      })
    },
    showReadStatus (ObjIndex, data, patchData = undefined) {
      data.content = data.content.replace(/(\r\n|\r|\n)/g, '<br/>')

      let isRead = false

      if (data.sender === 'CTR' || data.isDriver) {
        return
      }

      if (patchData) {
        data.content = patchData.content
      }

      if (ObjIndex !== -1) {
        isRead = true
      }

      data.content += `&nbsp;<i aria-hidden="true" role="presentation" class="material-icons q-icon notranslate">${isRead ? 'done_all' : 'done'}</i>`
      data.isRead = isRead
    },
    async setUserInfo () {
      const user = this.getAuthUser()
      const roleAcl = user.roleAcl._id ? user.roleAcl : await this.getRole(user.roleAcl)

      this.forCdas = roleAcl.forCdas
    },
    async getGroups () {
      try {
        const query = {
          company: this.selectedCompany ? this.selectedCompany : { $exists: false }
        }

        const { data } = await this.$store.dispatch('vehicle-groups/find', { query })

        this.groups = data.map(({ _id, vehicleGroupName }) => {
          return { label: vehicleGroupName, value: _id }
        })
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch vehicle groups',
          icon: 'error',
          position: 'top'
        })
      }
    }
  }
}
</script>

<style scoped>
.more-threads {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5000;
  height: 0;
  flex-wrap: nowrap;
}

.less-conversation {
  height: 100%;
  flex: 1;
  border-radius: unset;
}

.more-conversation {
  height: 700px;
  width: 400px;
  border-radius: unset;
}

.bg-conversation {
  background-color: #fffefa;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  columns: 2;
}

ul li {
  border: 1px solid #ddd;
  border-radius: 25px;
  background-color: #f6f6f6;
  padding: 12px;
  text-decoration: none;
  color: black;
  display: block;
  position: relative;
  margin-bottom: 5px;
  width: 130px;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
}

ul li:hover {
  background-color: #eee;
}

.close {
  cursor: pointer;
  position: absolute;
  top: 50%;
  right: 0%;
  padding: 12px 16px;
  transform: translate(0%, -50%);
}

/* .close:hover {background: #bbb;} */

@media (min-width: 1023px) {
  .sidebar {
    max-width: 15rem;
  }
}
</style>
