<template>
  <q-list>
    <q-item-label
      header
      v-if="$can('read', 'Messaging') || $can('read', 'Vehicle Tracking') || $can('read', 'Jobs')"
    >
      Functions
    </q-item-label>

    <q-item
      to="/messaging"
      active-class="text-red-10"
      v-if="$can('read', 'Messaging')"
    >
      <q-item-section avatar>
        <q-icon name="question_answer" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Messaging</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/vehicle-tracking"
      active-class="text-red-10"
      v-if="$can('read', 'Vehicle Tracking')"
    >
      <q-item-section avatar>
        <q-icon name="location_on" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Vehicle Tracking</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/jobs"
      active-class="text-red-10"
      v-if="$can('read', 'Jobs')"
    >
      <q-item-section avatar>
        <q-icon name="event_note" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Job</q-item-label>
      </q-item-section>
    </q-item>

    <q-item-label
      header
      v-if="$can('read', 'Message Broadcasts')"
    >
      Broadcasts
    </q-item-label>

    <q-item
      to="/broadcasts"
      active-class="text-red-10"
      v-if="$can('read', 'Message Broadcasts')"
    >
      <q-item-section avatar>
        <q-icon name="campaign" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Message Broadcasts</q-item-label>
      </q-item-section>
    </q-item>

    <q-item-label
      header
      v-if="$can('read', 'License Types') || $can('read', 'Company Subscriptions') || $can('read', 'Vehicle Subscriptions')"
    >
      Licensing
    </q-item-label>

    <q-item
      to="/license-types"
      active-class="text-red-10"
      v-if="$can('read', 'License Types')"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>

      <q-item-section>
        <q-item-label>License Types</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/company-subscription"
      active-class="text-red-10"
      v-if="$can('read', 'Company Subscriptions')"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Company Subscriptions</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/vehicle-subscription"
      active-class="text-red-10"
      v-if="$can('read', 'Vehicle Subscriptions')"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Vehicle Subcriptions</q-item-label>
      </q-item-section>
    </q-item>

    <q-item-label
      header
      v-if="$can('read', 'Vehicle Management') || $can('read', 'Vehicle Groups') || $can('read', 'Upload Vehicles')"
    >
      Vehicles
    </q-item-label>

    <q-item
      to="/vehicles"
      active-class="text-red-10"
      v-if="$can('read', 'Vehicle Management')"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Vehicle Management</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/vehicle-groups"
      active-class="text-red-10"
      v-if="$can('read', 'Vehicle Groups')"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Vehicle Groups</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/upload-vehicles"
      active-class="text-red-10"
      v-if="$can('read', 'Upload Vehicles')"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Upload Multiple Vehicles</q-item-label>
      </q-item-section>
    </q-item>

    <q-item-label
      header
      v-if="$can('read', 'Trailer Management')"
    >
      Trailer System
    </q-item-label>

    <q-item
      clickable
      @click="openTrailerManagement()"
      active-class="text-red-10"
      v-if="$can('read', 'Trailer Management')"
    >
      <q-item-section avatar>
        <q-icon name="engineering" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Trailer Management</q-item-label>
      </q-item-section>
    </q-item>

    <q-item-label
      header
      v-if="$can('read', 'User Activities')"
    >
      History
    </q-item-label>

    <!-- <q-item to="" active-class="text-red-10" v-if="$can('read', 'Messaging Journey')">
      <q-item-section avatar>
        <q-icon name="search" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Messaging Journey</q-item-label>
      </q-item-section>
    </q-item>

    <q-item to="" active-class="text-red-10" v-if="$can('read', 'Vehicle Journey')">
      <q-item-section avatar>
        <q-icon name="search" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Vehicle Journey</q-item-label>
      </q-item-section>
    </q-item> -->

    <q-item
      to="/user-activities"
      active-class="text-red-10"
      v-if="$can('read', 'User Activities')"
    >
      <q-item-section avatar>
        <q-icon name="assignment" />
      </q-item-section>

      <q-item-section>
        <q-item-label>User Activities</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/message-history"
      active-class="text-red-10"
      v-if="$can('read', 'Message History')"
    >
      <q-item-section avatar>
        <q-icon name="assignment" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Message History</q-item-label>
      </q-item-section>
    </q-item>

    <q-item-label
      header
      v-if="$can('read', 'Groups') || $can('read', 'Companies') || $can('read', 'CDAS Users') || $can('read', 'Organization Users') || $can('read', 'Role Modules') || $can('read', 'Organization Types') || $can('read', 'Articles')"
    >
      Administration
    </q-item-label>

    <q-item
      to="/api-keys"
      active-class="text-red-10"
      v-if="$can('read', 'API Keys')"
    >
      <q-item-section avatar>
        <q-icon name="people" />
      </q-item-section>

      <q-item-section>
        <q-item-label>API Keys</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/groups"
      active-class="text-red-10"
      v-if="$can('read', 'Groups')"
    >
      <q-item-section avatar>
        <q-icon name="people" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Groups</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/companies"
      active-class="text-red-10"
      v-if="$can('read', 'Companies')"
    >
      <q-item-section avatar>
        <q-icon name="people" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Companies</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/cdas-users"
      active-class="text-red-10"
      v-if="$can('read', 'CDAS Users')"
    >
      <q-item-section avatar>
        <q-icon name="people" />
      </q-item-section>

      <q-item-section>
        <q-item-label>CDAS Users</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/organization-users"
      active-class="text-red-10"
      v-if="$can('read', 'Organization Users')"
    >
      <q-item-section avatar>
        <q-icon name="people" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Organization Users</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/multiple-users"
      active-class="text-red-10"
      v-if="$can('read', 'Multiple Users')"
    >
      <q-item-section avatar>
        <q-icon name="people" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Upload Multiple Users</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/reset-user-password"
      active-class="text-red-10"
      v-if="$can('read', 'Reset User Password')"
    >
      <q-item-section avatar>
        <q-icon name="people" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Reset User Password</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/role-modules"
      active-class="text-red-10"
      v-if="$can('read', 'Role Modules')"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Role Modules</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/organization-types"
      active-class="text-red-10"
      v-if="$can('read', 'Organization Types')"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Organization Types</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/system-settings"
      active-class="text-red-10"
      v-if="$can('read', 'System Settings')"
    >
      <q-item-section avatar>
        <q-icon name="settings" />
      </q-item-section>

      <q-item-section>
        <q-item-label>System Settings</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      to="/articles"
      active-class="text-red-10"
      v-if="$can('read', 'Articles')"
    >
      <q-item-section avatar>
        <q-icon name="article" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Articles</q-item-label>
      </q-item-section>
    </q-item>

    <q-item-label
      header
      v-if="$can('read', 'Ping')"
    >
      Functions
    </q-item-label>

    <q-item
      to="/ping"
      active-class="text-red-10"
      v-if="$can('read', 'Ping')"
    >
      <q-item-section avatar>
        <q-icon name="sensors" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Ping</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
export default {
  name: 'MainMenu',
  methods: {
    async openTrailerManagement () {
      const res = await this.$axiosTms.get('system-tms/link-trailer-management')

      if (res.data.redirect_url) {
        setTimeout(() => {
          window.open(res.data.redirect_url)
          this.$q.notify({
            color: 'positive',
            message: 'User has link to TMS',
            icon: 'done',
            position: 'top'
          })
        }, 100)
      }
    }
  }
}
</script>
