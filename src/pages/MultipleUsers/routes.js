export default {
  path: 'multiple-users',
  component: () => import('./MultipleUsers'),
  meta: {
    title: 'Upload Multiple Users',
    requiresAuth: true
  }
}
