import Messaging from '../pages/Messaging/routes'
import Articles from '../pages/Articles/routes'
import Vehicles from '../pages/VehicleManagement/routes'
import RoleModules from '../pages/RoleModules/routes'
import VehicleGroups from '../pages/VehicleGroups/routes'
import OrganizationUsers from '../pages/OrganizationUsers/routes'
import CDASUsers from '../pages/CDASUsers/routes'
import OrganizationTypes from '../pages/OrganizationTypes/routes'
import Companies from '../pages/Companies/routes'
import Groups from '../pages/Groups/routes'
import LicenseTypes from '../pages/LicenseTypes/routes'
import VehicleTracking from '../pages/VehicleTracking/routes'
import Job from '../pages/Job/routes'
import UserActivities from '../pages/UserActivities/routes'
import MultipleUsers from '../pages/MultipleUsers/routes'
import UploadVehicles from '../pages/UploadVehicles/routes'
import Broadcasts from '../pages/Broadcasts/routes'
import Ping from '../pages/Ping/routes'
import ApiKeys from '../pages/ApiKeys/routes'
import ResetUserPassword from '../pages/ResetUserPassword/routes'
import MessageHistory from '../pages/MessageHistory/routes'
import CompanySubscription from '../pages/CompanySubscription/routes'
import VehicleSubscription from '../pages/VehicleSubscription/routes'
import Profile from '../pages/Profile/routes'
import SystemSettings from '../pages/SystemSettings/routes'

export default {
  path: '/',
  component: () => import('./MainLayout'),
  children: [
    {
      path: '',
      redirect: '/vehicle-tracking',
      meta: {
        title: 'Vehicle Tracking',
        requiresAuth: true
      }
    },
    Messaging,
    Articles,
    Vehicles,
    RoleModules,
    VehicleGroups,
    OrganizationUsers,
    CDASUsers,
    OrganizationTypes,
    Companies,
    Groups,
    LicenseTypes,
    VehicleTracking,
    Job,
    UserActivities,
    MultipleUsers,
    UploadVehicles,
    Broadcasts,
    Ping,
    ApiKeys,
    ResetUserPassword,
    MessageHistory,
    CompanySubscription,
    VehicleSubscription,
    Profile,
    SystemSettings
  ]
}
