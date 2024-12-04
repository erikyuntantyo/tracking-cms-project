<template>
  <q-list
    bordered
    class="rounded-borders"
  >
    <q-expansion-item
      icon="filter_list"
      label="Advanced Filter"
    >
      <q-card>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <q-input
              outlined
              dense
              label="Message"
              :value="message"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="updateSearch('message', $event)"
            />

            <q-input
              outlined
              dense
              label="Sender"
              :value="userSend"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="updateSearch('userSend', $event)"
            />

            <q-input
              outlined
              dense
              label="Receiver"
              :value="userRec"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="updateSearch('userRec', $event)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script>
import mixin from '../../mixins/filter'

export default {
  name: 'FilterInput',
  props: {
    message: {
      type: String,
      default: ''
    },
    userSend: {
      type: String,
      default: ''
    },
    userRec: {
      type: String,
      default: ''
    }
  },

  mixins: [mixin],

  data () {
    return {
      options: {
        actions: ['login', 'logout', 'create', 'update', 'patch', 'remove']
      }
    }
  },

  methods: {
    updateSearch (input, event) {
      this.$emit(`update:${input}`, event)
      this.$emit('onSearch')
    }
  }
}
</script>
