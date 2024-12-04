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
              label="Name"
              :value="name"
              color="red-9"
              class="col-lg-2 col-sm-3 col-xs-12"
              @input="$emit('update:name', $event)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script>
export default {
  name: 'FilterInput',
  props: {
    name: {
      type: String,
      default: ''
    }
  }
}
</script>
