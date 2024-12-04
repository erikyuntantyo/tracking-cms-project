export default {
  path: 'vehicle-tracking',
  component: () => import('./Index'),
  meta: {
    title: 'Vehicle Tracking',
    requiresAuth: true
  }
}
