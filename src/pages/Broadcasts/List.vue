<template>
  <div>
    <filter-input
      :draft.sync="filter.draft"
      :content.sync="filter.content"
      :created-by.sync="filter.createdBy"
      :created-at.sync="filter.createdAt"
      :sender.sync="filter.sender"
      :sent-at.sync="filter.sentAt"
      class="q-mb-sm"
    />

    <q-table
      :columns="columns"
      :data="data"
      row-key="_id"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
      :pagination.sync="pagination"
      :rows-per-page-options="[10, 25, 50, 75, 100, 150, 200, 250]"
      class="my-sticky-header-table table-height"
    >
      <template #body-cell-action="{ row }">
        <td class="text-center">
          <q-btn
            flat
            round
            icon="visibility"
            @click="onView(row._id)"
          >
            <q-tooltip>View</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="edit"
            class="q-ml-sm"
            @click="$router.push(`/broadcasts/edit/${row._id}`)"
            v-if="row.draft && $can('update', 'Message Broadcasts')"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
        </td>
      </template>

      <template #body-cell-content="{ row }">
        <td v-html="row.content" />
      </template>

      <template #top>
        <q-btn
          padding="sm lg"
          unelevated
          color="red-10"
          text-color="red-1"
          label="Create Broadcast"
          @click="$router.push('/broadcasts/add')"
          v-if="$can('create', 'Message Broadcasts')"
        />
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 700px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            Message Details
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

        <div
          class="q-pa-md"
          v-html="viewedMessage"
        />
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import FilterInput from './FilterInput'
import { date } from 'quasar'

export default {
  name: 'BroadcastsList',

  components: {
    FilterInput
  },

  data () {
    return {
      columns: [
        {
          name: 'action',
          label: 'Action',
          align: 'center',
          headerStyle: 'width: 50px'
        },
        { name: 'content', field: 'content', label: 'Message', align: 'left', sortable: true },
        { name: 'createdBy.fullname', field: v => v.createdBy && v.createdBy.fullname ? v.createdBy.fullname : '-', label: 'Created By', align: 'left', sortable: true },
        {
          name: 'createdAt',
          field: v => this.sgTimestamp(v.createdAt),
          label: 'Date Created',
          align: 'center',
          sortable: true
        },
        {
          name: 'sender.fullname',
          field: v => (v.sender && v.sender.fullname) || '-',
          label: 'Sent By',
          align: 'left',
          sortable: true
        },
        {
          name: 'sentAt',
          field: v => this.sgTimestamp(v.sentAt),
          label: 'Date Sent',
          align: 'center',
          sortable: true
        }
      ],
      data: [],
      pagination: {
        page: 1,
        sortBy: 'createdAt',
        descending: true,
        rowsPerPage: 10,
        rowsNumber: 0
      },
      loading: false,
      dialog: false,
      viewedMessage: '',
      filter: {
        draft: null,
        content: '',
        createdBy: '',
        createdAt: null,
        sender: '',
        sentAt: null
      }
    }
  },

  mounted () {
    this.onRequest({
      pagination: this.pagination
    })
  },

  methods: {
    async onRequest ({ pagination }) {
      this.loading = true
      const objectIdField = ['createdBy', 'sender']
      const IOSDateField = ['createdAt', 'sentAt']
      const { descending, page, rowsPerPage } = pagination
      let { sortBy } = pagination
      const filterParams = await this.getFilterValue()

      if (sortBy === 'content') sortBy = 'contentCleared'

      const query = {
        resource: 'messages',
        aggregate: [
          {
            $match: {
              flagFrom: 'broadcast',
              ...filterParams
            }
          },
          {
            $lookup: {
              from: 'conversations',
              localField: 'conversationId',
              foreignField: '_id',
              as: 'conversation'
            }
          },
          {
            $unwind: {
              path: '$conversation',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $match: {
              'conversation.type': 'admin-broadcast'
            }
          },
          {
            $facet: {
              total: [
                {
                  $count: 'count'
                }
              ],
              data: [
                {
                  $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                  }
                },
                {
                  $unwind: {
                    path: '$createdBy',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'sender'
                  }
                },
                {
                  $unwind: {
                    path: '$sender',
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $addFields: {
                    replace: {
                      $regexFind: {
                        input: '$content',
                        regex: { pattern: '([^<>]+)(?!([^<]+)?>)', options: 'gi' }
                      }
                    }
                  }
                },
                {
                  $project: {
                    _id: 1,
                    flagFrom: 1,
                    type: 1,
                    conversationId: 1,
                    content: 1,
                    createdBy: 1,
                    draft: 1,
                    recipientStatus: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    sender: 1,
                    sentAt: 1,
                    conversation: 1,
                    contentCleared: '$replace.match'
                  }
                },
                {
                  $sort: {
                    [sortBy]: descending ? -1 : 1
                  }
                },
                {
                  $limit: rowsPerPage * page
                },
                {
                  $skip: ((page > 0 ? page : 1) - 1) * rowsPerPage
                }
              ]
            }
          },
          {
            $unwind: '$total'
          }, {
            $project: {
              data: 1,
              total: '$total.count'
            }
          }
        ],
        toObjectIdMap: [],
        toISODateMap: [],
        toRegexPattern: []
      }

      Object.keys(query.aggregate[0].$match).forEach((key, index) => {
        if (objectIdField.includes(String(key))) {
          query.toObjectIdMap.push({ index: 0, path: `$match.${key}` })
        }
      })

      Object.keys(query.aggregate[0].$match).forEach((key1, index) => {
        if (IOSDateField.includes(String(key1))) {
          if (typeof query.aggregate[0].$match[key1] === 'object') {
            Object.keys(query.aggregate[0].$match[key1]).forEach((key2, index) => {
              query.toISODateMap.push({ index: 0, path: `$match.${key1}.${key2}` })
            })
          } else {
            query.toISODateMap.push({ index: 0, path: `$match.${key1}` })
          }
        }
      })

      // to convert into regex pattern
      query.toRegexPattern.push({ index: 4, path: "$facet.data[4]['$addFields'].replace['$regexFind'].regex" })

      this.$axios.post('/aggregate', query)
        .then(res => {
          this.loading = false

          const existsData = (res.data.length > 0)

          this.data = existsData ? res.data[0].data : []
          this.pagination = pagination
          this.pagination.rowsNumber = existsData ? res.data[0].total : 0
        })
        .catch(err => {
          console.error(err.message)
          return []
        })
    },
    async onView (id) {
      this.dialog = true
      this.viewedMessage = this.data.filter(v => v._id === id)[0].content
    },

    sgTimestamp (timestamp) {
      return date.formatDate(timestamp, 'DD/MM/YYYY HH:mm')
    },
    formatDate (date) {
      const arr = date.split('/')
      return new Date(`${arr[2]}-${arr[1]}-${arr[0]}`)
    },

    async getFilterValue () {
      const fieldTypes = {
        string: ['content'],
        date: ['createdAt', 'sentAt'],
        objectId: ['createdBy', 'sender'],
        boolean: ['draft']
      }
      const filter = {}

      await fieldTypes.string.map(v => {
        if (this.filter[v]) {
          filter[v] = {
            $regex: `${this.filter[v].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
            $options: 'i'
          }
        }
      })

      await fieldTypes.date.map(v => {
        if (this.filter[v]) {
          const formattedDate = {
            from: this.formatDate(this.filter[v].from || this.filter[v]),
            to: this.formatDate(this.filter[v].to || this.filter[v])
          }

          filter[v] = {
            $gte: date.startOfDate(formattedDate.from, 'day').toISOString(),
            $lte: date.endOfDate(formattedDate.to, 'day').toISOString()
          }
        }
      })

      await fieldTypes.objectId.map(v => {
        if (this.filter[v]) filter[v] = this.filter[v]
      })

      await fieldTypes.boolean.map(v => {
        if (typeof this.filter[v] !== 'undefined' && this.filter[v] !== null) {
          if (!this.filter[v]) {
            filter.$or = [
              { [v]: this.filter[v] },
              { [v]: { $exists: false } }
            ]
          } else {
            filter[v] = this.filter[v]
          }
        }
      })

      return filter
    }
  }
}
</script>
