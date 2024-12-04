export default {
  path: 'reset-user-password',
  component: () => import('./ResetUserPassword'),
  meta: {
    title: 'Reset User Password',
    requiresAuth: true
  }
}
