import MainLayout from 'src/layouts/routes'

const routes = [
  MainLayout,
  { path: '/login', component: () => import('pages/Login.vue'), meta: { title: 'Login' } },
  { path: '/forgot-password', component: () => import('pages/Forgot-Password.vue'), meta: { title: 'Forgot Password' } },
  { path: '/reset-password', component: () => import('pages/Reset-Password.vue'), meta: { title: 'Reset Password' } },
  { path: '/login-otp', component: () => import('pages/LoginOtp.vue'), meta: { title: 'Login Otp' } }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
