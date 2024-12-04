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
          <q-input
            outlined
            dense
            label="Name"
            :value="name"
            color="red-9"
            style="width: 240px;"
            @input="$emit('update:name', $event)"
          />
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
