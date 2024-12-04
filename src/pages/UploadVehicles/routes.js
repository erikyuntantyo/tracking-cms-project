export default {
  path: 'upload-vehicles',
  component: () => import('./UploadVehicles'),
  meta: {
    title: 'Upload Multiple Vehicles',
    requiresAuth: true
  }
}
