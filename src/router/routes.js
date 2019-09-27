
const routes = [
  {
    path: '/',
    component: () => import('layouts/BuyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Buy.vue') },
    ]
  },
  {
    path: '/sell',
    component: () => import('layouts/SellLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Sell.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
