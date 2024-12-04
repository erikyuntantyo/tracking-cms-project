export default {
  path: 'system-settings',
  component: () => import('./Index'),
  meta: {
    title: 'System Settings',
    requiresAuth: true
  }
}
