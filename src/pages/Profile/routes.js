export default {
  path: 'profile',
  component: () => import('./Index'),
  meta: {
    title: 'Profile',
    requiresAuth: true
  }
}
