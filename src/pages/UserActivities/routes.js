export default {
  path: 'user-activities',
  component: () => import('./Index'),
  children: [
    {
      path: '',
      component: () => import('./List'),
      meta: {
        title: 'User Activities',
        requiresAuth: true
      }
    }
  ]
}
