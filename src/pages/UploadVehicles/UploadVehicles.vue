<template>
  <q-page class="q-pa-lg">
    <div style="max-width: 1280px; margin: 0 auto;">
      <div class="row">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6">
                Create multiple new Vehicles
              </div>
            </q-card-section>
            <q-card-section>
              <div class="row">
                <div class="col-md-4 text-center">
                  <span
                    class="text-subtitle1 q-mb-sm"
                    style="display: inline-block;"
                  >Step 1: Export template</span><br>
                  <q-btn
                    padding="sm lg"
                    unelevated
                    color="red-10"
                    text-color="red-1"
                    label="New Vehicles Template"
                    @click="dialog = true"
                    :disable="!$can('create', 'Upload Vehicles')"
                  />
                </div>
                <div class="col-md-4">
                  <span
                    class="text-subtitle1 q-mb-sm"
                    style="display: inline-block;"
                  >Step 2: Fill up the template</span><br>
                  <p class="text-subtitle2">
                    Please use the company name listed in the template only
                  </p>
                </div>
                <div class="col-md-4 text-center">
                  <span
                    class="text-subtitle1 q-mb-sm"
                    style="display: inline-block;"
                  >Step 3: Upload template</span><br>
                  <q-btn
                    padding="sm lg"
                    unelevated
                    color="red-10"
                    text-color="red-1"
                    label="Upload"
                    @click="uploadDialog = true"
                    :disable="!$can('create', 'Upload Vehicles')"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <q-dialog v-model="dialog">
        <q-card style="min-width: 350px;">
          <q-card-section>
            <div class="text-h6">
              Select a group to generate template
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-banner
              inline-actions
              class="text-white bg-orange q-mb-md"
            >
              Please disable pop-ups block to download multiple template
            </q-banner>

            <q-select
              label="Select a group"
              :options="groups"
              v-model="selectedGroups"
              multiple
              @input="onSelect"
              use-input
              @filter="onFilterGroup"
              clearable
              use-chips
              class="q-mb-md"
              color="red-9"
            >
              <template #option="scope">
                <q-item
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents"
                >
                  <q-item-section avatar>
                    <q-checkbox
                      dense
                      v-model="scope.opt.selected"
                      @input="onGroupCheck(scope.opt)"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-checkbox
              dense
              v-model="selectAll"
              label="Select All"
              color="red-9"
              @input="onSelectAll"
            />
          </q-card-section>

          <q-card-actions
            align="right"
            class="text-primary"
          >
            <q-btn
              flat
              padding="sm lg"
              color="red-9"
              label="Cancel"
              v-close-popup
            />
            <q-btn
              padding="sm lg"
              unelevated
              color="red-9"
              text-color="red-1"
              label="OK"
              @click="onSubmit"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="uploadDialog">
        <q-card style="min-width: 350px;">
          <q-card-section>
            <div class="text-h6">
              Upload Template
            </div>
          </q-card-section>

          <q-form
            @submit="onUpload"
            enctype="multipart/form-data"
            ref="uploadForm"
          >
            <q-card-section class="q-pt-none">
              <q-uploader
                ref="upload"
                @added="onAdded"
                @removed="onRemoved"
                multiple
                batch
                :filter="checkFile"
                class="q-mb-md"
                color="red-9"
              >
                <template #header="scope">
                  <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                    <q-btn
                      v-if="scope.queuedFiles.length > 0"
                      icon="clear_all"
                      @click="scope.removeQueuedFiles"
                      round
                      dense
                      flat
                    >
                      <q-tooltip>Clear All</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="scope.uploadedFiles.length > 0"
                      icon="done_all"
                      @click="scope.removeUploadedFiles"
                      round
                      dense
                      flat
                    >
                      <q-tooltip>Remove Uploaded Files</q-tooltip>
                    </q-btn>
                    <q-spinner
                      v-if="scope.isUploading"
                      class="q-uploader__spinner"
                    />
                    <div class="col">
                      <div class="q-uploader__title">
                        Upload your files (for &lt;20MB size and .xls .xlsx file)
                      </div>
                    </div>
                    <q-btn
                      v-if="scope.canAddFiles"
                      type="a"
                      icon="add_box"
                      round
                      dense
                      flat
                    >
                      <q-uploader-add-trigger />
                      <q-tooltip>Pick Files</q-tooltip>
                    </q-btn>
                  </div>
                </template>
              </q-uploader>
              <div
                class="q-field__messages text-negative"
                v-if="fileError"
              >
                File(s) did not pass validation constraints
              </div>
            </q-card-section>

            <q-card-actions
              align="right"
              class="text-primary"
            >
              <q-btn
                flat
                label="Cancel"
                color="red-9"
                v-close-popup
              />
              <q-btn
                padding="sm lg"
                unelevated
                color="red-9"
                text-color="red-1"
                type="submit"
                label="Upload"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import mixin from '../../mixins/mixin'
import JsFileDownloader from 'js-file-downloader'

export default {
  mixins: [mixin],
  meta () {
    return {
      title: 'CTR',
      titleTemplate: title => `${title} - ${this.$router.currentRoute.meta.title}`
    }
  },
  data () {
    return {
      name: 'Upload Vehicles',
      dialog: false,
      groups: [],
      selectedGroups: [],
      selectAll: false,
      uploadDialog: false,
      fileError: false,
      files: null
    }
  },
  mounted () {
    this.getGroups()
  },
  methods: {
    async getGroups () {
      try {
        const { group } = await this.$store.getters['auth/user']
        const query = {
          level: 1,
          _id: group
        }

        const res = await this.$store.dispatch('groups/find', { paginate: false, query })

        this.groups = res.data.map(val => {
          val = { label: val.name, value: val._id, selected: false }

          return val
        })
      } catch (err) {
        console.log(err, 'Error getting groups')
      }
    },
    onGroupCheck (val) {
      val.selected ? this.selectedGroups.push({ label: val.label, value: val.value }) : this.selectedGroups = this.selectedGroups.filter(value => value.value !== val.value)
      this.selectedGroups.length !== this.groups.length ? this.selectAll = false : this.selectAll = true
    },
    async onSelect (val) {
      this.groups.forEach(value => {
        if (this.selectedGroups && this.selectedGroups.map(val => val.value).includes(value.value)) {
          value.selected = true
        } else {
          value.selected = false
        }
      })

      if (this.selectedGroups) {
        this.selectedGroups = await val.map(value => {
          value.selected = true

          return value
        })

        if (this.groups.length !== this.totalGroup) {
          this.selectAll = false
        } else {
          this.selectedGroups.length !== this.groups.length ? this.selectAll = false : this.selectAll = true
        }
      } else {
        this.selectAll = false
      }
    },
    async onSelectAll (val) {
      if (val) {
        try {
          const { group } = await this.$store.getters['auth/user']
          const query = {
            level: 1,
            _id: group,
            $select: ['_id', 'name']
          }

          const res = await this.$store.dispatch('groups/find', { paginate: false, query })

          this.groups = res.data.map(val => {
            val = { label: val.name, value: val._id, selected: true }

            return val
          })

          this.selectedGroups = res.data.map(val => {
            val = { label: val.name, value: val._id, selected: true }

            return val
          })
        } catch (err) {
          console.log(err)
        }
      } else {
        this.groups = this.groups.map(val => {
          val.selected = false

          return val
        })

        this.selectedGroups = []
      }
    },
    async onSubmit () {
      try {
        const res = await this.$axios.get('/import-multiple-vehicles/getTemplate', {
          params: {
            group: this.selectedGroups.map(val => val.value)
          }
        })

        console.log('upload-on-submit:res', res)

        let pathFile = ''
        res.data.forEach(async filename => {
          pathFile = encodeURIComponent(`template/${filename}`)
          const url = `${this.$axios.defaults.baseURL}/get-files?path=${pathFile}`

          new JsFileDownloader({
            url: url,
            filename,
            headers: [
              { name: 'Authorization', value: this.$q.localStorage.getItem('feathers-jwt') }
            ],
            nameCallback: (name) => {
              return filename
            }
          }).then(() => {
            this.showNotify('success', 'download success')
          })
        })
      } catch (e) {
        console.log(e)
      }
    },
    async onUpload () {
      const data = new FormData()
      if (!this.files) {
        this.showNotify('fail', 'Please choose a file')

        return
      }

      try {
        for (var i = 0; i < this.files.length; i++) {
          data.append('files', this.files[i])
        }

        const res = await this.$axios.post('/import-multiple-vehicles', data)

        if (res.data.status === 'success') this.showNotify('success', res.data.message)

        this.prompt = false

        this.files = null
        this.$refs.upload.reset()
        this.uploadDialog = false
      } catch (err) {
        this.otp = ''
        this.showNotify('fail', err.response.data.message)

        if (err.response.data.code === 403) {
          this.prompt = true
        }
      }
    },
    onAdded (files) {
      this.files = files
    },
    onRemoved (files) {
      this.files = null
    },
    checkFile (files) {
      return files.filter(file => {
        const arr = file.name.split('.')
        const ext = arr[arr.length - 1]

        this.fileError = !((ext === 'xlsx' || ext === 'xls') && file.size < 5242880)

        return (ext === 'xlsx' || ext === 'xls') && file.size < 5242880
      })
    },
    async onFilterGroup (val, update) {
      try {
        const { group } = await this.$store.getters['auth/user']
        const groupSelected = this.groups.filter(v => v.selected === true).map(v => v.label)

        const query = {
          level: 1,
          name: { $regex: `${val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' },
          _id: group,
          $select: ['_id', 'name']
        }

        const res = await this.$store.dispatch('groups/find', { paginate: false, query })

        update(() => {
          this.groups = res.data.map(val => {
            if (groupSelected.includes(val.name)) {
              val = { label: val.name, value: val._id, selected: true }
            } else {
              val = { label: val.name, value: val._id, selected: false }
            }

            return val
          })
        })
      } catch (err) {
        this.$q.notify({
          color: 'negative',
          message: err.message || 'Failed to fetch groups',
          icon: 'error',
          position: 'top'
        })
      }
    }
  }
}
</script>
