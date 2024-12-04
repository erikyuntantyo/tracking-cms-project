<template>
  <q-page>
    <div class="absolute-full column">
      <div class="row col">
        <div
          v-if="showSidebar"
          class="full-height scroll q-px-md"
          style="width: 300px; border-right: 1px solid #0000001f;"
        >
          <q-infinite-scroll
            @load="onLoad"
            class="q-py-md"
            id="auto-scroll"
            reverse
          >
            <div
              v-for="(item, idx) in message.data"
              :key="idx"
            >
              <p class="q-mb-xs text-weight-bold">
                [{{ item.sender }} - {{ item.createdAt }}]
              </p>
              <q-chat-message
                :text="[item.text]"
                bg-color="orange-3"
              />
            </div>
          </q-infinite-scroll>
        </div>

        <div class="map-container col">
          <app-map
            class="full-height"
            style="width: 100%;"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="row">
        <div
          v-ripple
          class="q-px-md q-py-sm flex items-center justify-between text-subtitle1 relative-position"
          style="width: 300px; border-top: 1px solid #0000001f; cursor: pointer;"
          @click="onMessageClick"
        >
          <p class="q-mb-none">
            Message Broadcasts
            <span
              v-if="showNotif"
              class="new-message-indicator q-ml-xs"
            />
          </p>
          <q-icon
            size="sm"
            :name="showSidebar ? 'keyboard_arrow_left' : 'keyboard_arrow_right'"
            class=""
          />
        </div>

        <div
          class="col q-pa-sm bg-red-1 flex items-center"
          style="border-top: 1px solid #0000001f;"
        >
          <div v-if="this.latestMessage">
            <div v-if="this.latestMessage.text.length < 150">
              <b>[{{ this.latestMessage.sender }} - {{ this.latestMessage.createdAt }}]</b>&nbsp;&nbsp;<span v-html="this.latestMessage.text" />
            </div>
            <div
              v-else
              class="row q-col-gutter-sm"
            >
              <div class="col-auto">
                <b>[{{ this.latestMessage.sender }} - {{ this.latestMessage.createdAt }}]</b>
              </div>
              <div class="col">
                <marquee><span v-html="this.latestMessage.text" /></marquee>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import AppMap from './components/AppMap'
import { scroll } from 'quasar'

const { getScrollTarget, getScrollHeight, setScrollPosition } = scroll

export default {
  name: 'VehicleTrackingIndex',

  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },

  components: {
    AppMap
  },
  created () {
    this.setBroadcastMessages()
  },

  sockets: {
    async 'messages created' (data) {
      data.conversationId = data.conversations
      if (data.conversationId.type === 'broadcast' || data.conversationId.type === 'admin-broadcast') {
        let newMessage = await this.formatMessages([data])
        newMessage = newMessage[0]

        this.message.data.push(newMessage)
        this.message.total++

        this.showNotif = true
        if (this.showSidebar) {
          setTimeout(() => { this.showNotif = false }, 5000)
          const ele = document.getElementById('auto-scroll')
          const target = getScrollTarget(ele)
          const offset = getScrollHeight(ele)
          setScrollPosition(target, offset, 1000)
        }
      }
    }
  },

  data () {
    return {
      showNotif: false,
      showSidebar: false,
      message: {
        data: [],
        limit: 40,
        total: 0
      }
    }
  },
  beforeRouteLeave (to, from, next) {
    clearInterval(this.$q.localStorage.getItem('refresh'))
    next()
  },

  computed: {
    latestMessage () {
      return (this.message.total > 0 && this.message.data[this.message.data.length - 1]) || null
    }
  },

  methods: {
    async setBroadcastMessages () {
      try {
        const conversationId = await this.$store.dispatch('conversations/find', {
          query: { type: { $in: ['admin-broadcast', 'broadcast'] } }
        })
          .then(({ total, data }) => {
            if (total) return data.map(v => v._id)

            return null
          })

        if (conversationId) {
          const newMessages = await this.$store.dispatch('messages/find', {
            query: {
              conversationId: { $in: conversationId },
              content: { $ne: '' },
              $or: [
                { draft: false },
                { draft: { $exists: false } }
              ],
              $limit: this.message.limit += 10,
              $sort: { createdAt: -1 },
              $populate: ['conversationId'],
              $select: ['conversationId', 'createdAt', 'content']
            }
          })
            .then(async ({ data, total }) => {
              if (total) {
                data = await this.formatMessages(data)
              }

              return { total, data }
            })

          this.message.total = newMessages.total
          this.message.data = newMessages.data
        }
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: 'Failed to fetch messages',
          icon: 'error',
          position: 'top'
        })
      }
    },

    onLoad (index, done) {
      setTimeout(async () => {
        if (this.message.data) {
          await this.setBroadcastMessages()

          this.message.data.length === this.message.total ? done(true) : done()
        }
      }, 1000)
    },
    onMessageClick () {
      this.showSidebar = !this.showSidebar

      if (this.showSidebar) this.showNotif = false
    },

    async formatMessages (messages = [], opt = 0) {
      const newMessages = await Promise.all(messages.map(async v => {
        let sender = ''
        if (['psa-message', 'broadcast'].includes(v.conversationId.type)) {
          sender = 'Portnet'
        } else if (v.conversationId.type === 'admin-broadcast') {
          sender = 'CDAS'
        }
        return {
          text: (opt && v.content) ? v.content.replace(/<(div|\/div)[^>]+>/gi, ' ') : v.content,
          sender: sender,
          createdAt: this.$moment(v.createdAt).format('DD/MM/YYYY HH:mm')
        }
      }))

      return newMessages.reverse()
    }
  }
}
</script>

<style scoped>
  .map-container {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .new-message-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #d93b3b;
    border-radius: 100%;
    box-shadow: 0 0 0 2px #d93b3b4d;
  }
</style>
