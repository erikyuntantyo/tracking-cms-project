<template>
  <div>
    <filter-input
      :title.sync="filter.title"
      class="q-mb-sm"
    />

    <q-table
      :columns="columns"
      :data="data"
      row-key="_id"
      :loading="loading"
      @request="onRequest"
      :filter="filter"
      :pagination.sync="pagination"
      :rows-per-page-options="[10, 25, 50, 75, 100, 150, 200, 250]"
      class="my-sticky-header-table table-height"
    >
      <template #body-cell-action="{ row: { _id } }">
        <td class="text-center">
          <q-btn
            flat
            round
            icon="visibility"
            @click="onView(_id)"
          >
            <q-tooltip>View</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="edit"
            class="q-ml-sm"
            @click="$router.push(`/articles/edit/${_id}`)"
            v-if="$can('update', 'Articles')"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="delete"
            class="q-ml-sm"
            @click="onDelete(_id)"
            v-if="$can('delete', 'Articles')"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </td>
      </template>

      <template #top>
        <q-btn
          padding="sm lg"
          unelevated
          color="red-10"
          text-color="red-1"
          label="Add"
          @click="$router.push('/articles/add')"
          v-if="$can('create', 'Articles')"
        />
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 700px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ article.title }}
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>

        <div class="q-pa-md">
          <q-card
            flat
            bordered
          >
            <q-card-section>{{ article.content }}</q-card-section>
          </q-card>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import FilterInput from './FilterInput'

export default {
  name: 'ArticlesList',
  components: {
    FilterInput
  },
  data () {
    return {
      filter: {
        title: ''
      },
      columns: [
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          headerStyle: 'width: 50px'
        },
        { name: 'createdAt', field: this.createdAtField, label: 'Date', align: 'center', sortable: true },
        { name: 'title', field: 'title', label: 'Title', align: 'left', sortable: true },
        { name: 'updatedBy', field: this.updatedByField, label: 'Updated By', align: 'left' }
      ],
      data: [],
      article: {
        title: '',
        content: ''
      },
      pagination: {
        page: 1,
        sortBy: 'createdAt',
        descending: false,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      loading: false,
      dialog: false,
      gettersData: {
        createdBy: [],
        updatedBy: []
      }
    }
  },
  watch: {
    dialog: 'resetArticle',
    filter: 'onRequest'
  },
  mounted () {
    this.onRequest({
      pagination: this.pagination
    })
  },
  methods: {
    ...mapActions('articles', {
      findArticles: 'find',
      removeArticles: 'remove'
    }),

    async onRequest ({ pagination }) {
      this.loading = true
      const { sortBy, descending, page, rowsPerPage } = pagination
      const filterParams = await this.getFilterValue()

      this.findArticles({
        query: {
          $limit: rowsPerPage,
          $skip: (page - 1) * rowsPerPage,
          $sort: {
            [sortBy]: descending ? -1 : 1
          },
          ...filterParams
        }
      })
        .then(async res => {
          this.loading = false

          await this.setGettersData(res.data)
          await this.setGettersValue()

          this.data = res.data
          this.pagination = pagination
          this.pagination.rowsNumber = res.total
        })
        .catch(err => {
          this.$q.notify({
            color: 'negative',
            message: err.message || 'Failed to fetch data',
            icon: 'error',
            position: 'top'
          })
        })
    },

    onDelete (id) {
      this.$q.dialog({
        title: 'Delete Data',
        message: 'Are you sure want to delete this data?',
        cancel: { color: 'red-9', flat: true, padding: 'sm lg' },
        ok: { color: 'red-9', unelevated: true, padding: 'sm lg' }
      }).onOk(() => {
        this.removeArticles(id)
          .then(res => {
            this.$q.notify({
              color: 'positive',
              message: 'Data deleted successfully',
              icon: 'done',
              position: 'top'
            })

            this.onRequest({
              pagination: this.pagination
            })
          })
          .catch(err => {
            this.$q.notify({
              color: 'negative',
              message: err.message || 'Failed to delete data',
              icon: 'error',
              position: 'top'
            })
          })
      })
    },

    createdAtField (row) {
      return this.$moment(row.createdAt).format('DD/MM/YYYY')
    },
    updatedByField (row) {
      const user = this.$store.getters['users/get'](row.updatedBy || row.createdBy) || null

      return (user && (user.fullname || user.username)) || ''
    },

    async setGettersData (data) {
      await Promise.all(Object.keys(this.gettersData).map(async key => {
        this.gettersData[key] = await [...new Set(data.map(v => v[key]))].filter(v => !!v)
      }))
    },
    async setGettersValue () {
      await this.$store.dispatch('users/find', {
        query: {
          $or: [
            { _id: this.gettersData.createdBy.length ? { $in: this.gettersData.createdBy } : { $exists: false } },
            { _id: this.gettersData.updatedBy.length ? { $in: this.gettersData.updatedBy } : { $exists: false } }
          ],
          $limit: 999999
        }
      })
    },

    async onView (id) {
      this.dialog = true

      const article = await this.$store.getters['articles/get'](id)

      this.article.title = article.title
      this.article.content = article.content
    },
    resetArticle () {
      this.article = { title: '', content: '' }
    },
    async getFilterValue () {
      const string = ['title']
      const filter = {}

      await string.map(v => {
        if (this.filter[v]) filter[v] = { $regex: `${this.filter[v]}`, $options: 'i' }
      })

      return filter
    }
  }
}
</script>
