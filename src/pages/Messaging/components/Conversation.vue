<template>
  <q-card
    flat
    bordered
    :class="`thread column relative-position ${hasNewMessage ? 'border-msg' : ''}`"
    v-if="vehicleNo"
    :style="minimize ? 'height: auto' : ''"
    @click="$emit('readMessage')"
  >
    <q-card-section
      class="q-pa-none"
      style="cursor: pointer;"
    >
      <div class="q-pa-xs q-px-sm bg-grey-3 row">
        <div class="q-pa-sm q-px-sm col-11 text-center header-text">
          {{ vehicleNo }}
        </div>
        <div class="col-1 text-right">
          <q-btn
            unelevated
            size="xs"
            round
            dense
            color="red-9"
            icon="clear"
            @click="$emit('close', vehicleNo)"
          />
        </div>
      </div>

      <div class="q-py-sm q-px-md bg-header">
        <div class="text-subtitle1">
          {{ driver ? driver : 'Driver Not Found' }}
        </div>
        <div
          class="text-subtitle2"
          v-if="!minimize"
        >
          {{ speed }}kmh
          <span class="q-ml-xs text-capitalize">
            <q-icon
              name="location_on"
              class="text-red-10"
            /> {{ address }}
          </span>
        </div>
      </div>
    </q-card-section>

    <q-separator
      inset
      v-if="!minimize"
    />

    <q-card-section
      class="bg-chat col scroll q-pa-md"
      :ref="`scrollContainer${vehicle}`"
      v-if="!minimize"
    >
      <q-infinite-scroll
        @load="onLoad"
        class="col"
        :offset="400"
        reverse
        ref="infiniteScroll"
      >
        <div
          v-for="(item, index) in messages"
          :key="index"
        >
          <div class="text-center q-mb-sm">
            <q-chip
              color="grey-7"
              text-color="grey-1"
              v-if="index === 0 || messages[index - 1].date !== item.date"
            >
              {{ showDate(item.date) }}
            </q-chip>
          </div>

          <q-chat-message
            :name="`<span class='text-${!item.isSent ? getTextColor(item) : 'controller'}'> ${item.time} ${ (item.isDriver && item.sender !== 'Portnet' && item.sender !== 'CTR') ? getVehicle(item) : item.sender} </span>`"
            name-html
            :sent="item.isSent"
            :class="!item.isSent ? getChatColor(item) : 'grey-chat'"
            text-html
            :text="[item.content]"
            :text-color="!item.isSent ? getTextColor(item) : 'controller'"
          />
        </div>

        <template #loading>
          <div class="row justify-center q-my-md">
            <q-spinner-dots
              color="red-9"
              size="40px"
            />
          </div>
        </template>
      </q-infinite-scroll>
    </q-card-section>

    <q-card-section
      class="q-pa-none"
      v-if="$can('create', 'Messaging') && !minimize"
    >
      <div class="warp-message q-py-sm q-px-md">
        <q-form
          @submit.prevent="onSubmit"
          class="row"
        >
          <q-input
            dense
            filled
            autogrow
            class="col custom-scroll"
            color="red-9"
            bg-color="white"
            autocomplete="off"
            ref="messageInput"
            placeholder="Type your message here..."
            @input="$emit('update:content', $event)"
            @keydown="toNewline"
            :value="content"
            input-class="height-input style-scroll-bar"
          />

          <div>
            <q-btn
              type="submit"
              color="red-10"
              icon="send"
              size="xs"
              class="q-ma-sm"
              unelevated
              round
            />
          </div>
        </q-form>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { scroll } from 'quasar'

const { getScrollTarget, setScrollPosition, getScrollHeight } = scroll

export default {
  name: 'ConversationMessage',

  props: {
    conversationId: {
      type: String,
      default: ''
    },
    psaConversationId: {
      type: String,
      default: ''
    },
    broadcastConversationId: {
      type: String,
      default: ''
    },
    vehicleNo: {
      type: String,
      required: true
    },
    vehicle: {
      type: String,
      required: true
    },
    driver: {
      type: String,
      default: ''
    },
    messages: {
      type: Array,
      default: () => []
    },
    speed: {
      type: Number,
      default: 0
    },
    threadsIndex: {
      type: Number,
      default: 0
    },
    address: {
      type: String,
      default: 'Unkown Location'
    },
    content: {
      type: String,
      required: true
    },
    minimize: {
      type: Boolean,
      default: true
    },
    showMinimize: {
      type: Boolean,
      default: true
    },
    hasNewMessage: {
      type: Boolean,
      default: true
    }
  },

  sockets: {
    async 'messages created' (data) {
      if (data.content && this.vehicle === data.conversations.vehicle) this.scrollToElement(this.$refs[`scrollContainer${this.vehicle}`])
    }
  },

  watch: {
    vehicleNo (v) {
      if (this.$refs.infiniteScroll) {
        this.$refs.infiniteScroll.reset()
        this.$refs.infiniteScroll.resume()
      }
    }
  },

  data () {
    return {
      today: this.$moment().format('DD/MM/YYYY'),
      yesterday: this.$moment().add(-1, 'days').format('DD/MM/YYYY'),
      chatColors: {
        'psa-message': 'purple-chat',
        'admin-broadcast': 'purple-chat',
        'ctr-message': 'cyan-chat',
        'driver-message': 'driver-chat',
        broadcast: 'purple-chat',
        group: 'green-chat'
      },
      textColors: {
        'psa-message': 'black',
        'admin-broadcast': 'black',
        'ctr-message': 'black',
        'driver-message': 'driver',
        broadcast: 'black',
        group: 'controller'
      }
    }
  },

  methods: {
    toNewline (e) {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault()
        this.onSubmit()
      }
    },

    showDate (date) {
      if (this.today === date) return 'Today'
      if (this.yesterday === date) return 'Yesterday'

      return date
    },
    getChatColor (item) {
      let type = (item.sender === 'CTR') ? 'ctr-message' : item.type
      if (item.isDriver && item.sender !== 'Portnet' && item.sender !== 'CTR') type = 'driver-message'
      return this.chatColors[type]
    },
    getTextColor (item) {
      let type = (item.sender === 'CTR') ? 'ctr-message' : item.type
      if (item.isDriver && item.sender !== 'Portnet' && item.sender !== 'CTR') type = 'driver-message'
      return this.textColors[type]
    },
    getVehicle (item) {
      const vehicleSend = (item.vehicleDrivers && item.vehicleDrivers.vehicleNo) ? item.vehicleDrivers.vehicleNo : this.vehicleNo
      return vehicleSend
    },
    async onLoad (index, done) {
      if (index > 2 && !this.messages.length) done(true)

      if (index > 1) {
        setTimeout(() => {
          this.$emit('load', {
            vehicleNo: this.vehicleNo,
            conversationId: this.conversationId,
            psaConversationId: this.psaConversationId,
            broadcastConversationId: this.broadcastConversationId,
            threadIndex: this.threadsIndex
          }, done)
        }, 100)
      } else {
        setTimeout(() => {
          done()
        }, 100)
      }
    },
    onSubmit () {
      this.$emit('submit', this.vehicleNo)
      this.$refs.messageInput.blur()
      this.$refs.messageInput.focus()
    },
    scrollToElement (el) {
      const target = getScrollTarget(el.$el)
      const offset = getScrollHeight(el.$el)
      const duration = 100

      setScrollPosition(target, offset, duration)
    }
  }
}
</script>

<style>
  .warp-message {
    background-color: #faf2f2;
  }

  .thread {
    border-radius: unset;
    overflow: hidden;
  }

  .green-chat [class*="q-message-text--received"] {
    color: #fffefa;
  }

  .driver-chat [class*="q-message-text--received"] {
    color: #fffefa;
  }

  .purple-chat [class*="q-message-text--received"] {
    color: #fffefa;
  }

  .orange-chat [class*="q-message-text--received"] {
    color: #fffefa;
  }

  .cyan-chat [class*="q-message-text--received"] {
    color: #fffefa;
  }

  .grey-chat [class*="q-message-text--sent"] {
    color: #d4ffc2;
  }

  .border-msg {
    border-style: solid;
    border-color: #ff9100;
    border-width: 5px;
  }

  .bg-chat {
    background-color: #fffefa;
  }

  .bg-header {
    background-color: #fffefa;
  }

  .q-message-text-content {
    line-height: 1.4;
  }

  .text-controller {
    color: #4800ff;
  }

  .text-driver {
    color: #f00;
  }

  .q-message-text:last-child {
    min-height: unset;
    margin-bottom: -5px;
    padding-bottom: 0 5px 5px 0;
  }

  [class*="q-message-text-content--sent"] {
    margin: 3px;
  }

  .q-message-container {
    margin-bottom: 20px;
  }

  .header-text {
    font-size: 1.5rem;
    padding: unset;
    color: #666;
  }

  .height-input {
    overflow-y: scroll !important;
    height: 69px !important;
  }

  /* stylelint-disable-next-line selector-class-pattern */
  .custom-scroll .q-field__control {
    padding: 0 5px 0 12px !important;
  }

  .style-scroll-bar::-webkit-scrollbar-track
  {
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-box-shadow: inset 0 0 6px rgba(0 0 0 / 30%);
    border-radius: 5px;
    background-color: #F5F5F5;
  }

  .style-scroll-bar::-webkit-scrollbar
  {
    width: 5px;
    background-color: #F5F5F5;
  }

  .style-scroll-bar::-webkit-scrollbar-thumb
  {
    border-radius: 10px;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-box-shadow: inset 0 0 6px rgba(0 0 0 / 30%);
    background-color: #555;
  }
</style>
