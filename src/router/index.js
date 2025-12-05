import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import BusinessRegister from '../pages/BusinessRegister.vue'
import BusinessDetail from '../pages/BusinessDetail.vue'
import BusinessEdit from '../pages/BusinessEdit.vue'
import BusinessList from '../pages/BusinessList.vue'
import Statistics from '../pages/Statistics.vue'
import DataQuery from '../pages/DataQuery.vue'
import Management from '../pages/Management.vue'
import MainLayout from '../layouts/MainLayout.vue'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    layout: MainLayout
  },
  {
    path: '/business/list',
    name: 'BusinessList',
    component: BusinessList,
    meta: { requiresAuth: true },
    layout: MainLayout
  },
  {
    path: '/business/register',
    name: 'BusinessRegister',
    component: BusinessRegister,
    meta: { requiresAuth: true },
    layout: MainLayout
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: { requiresAuth: true },
    layout: MainLayout
  },
  {
    path: '/data/query',
    name: 'DataQuery',
    component: DataQuery,
    meta: { requiresAuth: true },
    layout: MainLayout
  },
  {
    path: '/management',
    name: 'Management',
    component: Management,
    meta: { requiresAuth: true, requiresAdmin: true },
    layout: MainLayout
  },
  {
    path: '/business/detail/:id',
    name: 'BusinessDetail',
    component: BusinessDetail,
    meta: { requiresAuth: true },
    layout: MainLayout
  },
  {
    path: '/business/edit/:id',
    name: 'BusinessEdit',
    component: BusinessEdit,
    meta: { requiresAuth: true },
    layout: MainLayout
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') !== null
  const userRole = localStorage.getItem('role')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.meta.requiresAdmin && userRole !== 'admin') {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router