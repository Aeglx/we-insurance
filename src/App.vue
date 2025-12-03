<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'

const route = useRoute()

// 根据路由是否需要认证来决定是否使用布局组件
const Layout = computed(() => {
  // 登录页面不需要布局，直接渲染组件
  if (route.name === 'Login') {
    return 'div'
  }
  return route.meta.layout || MainLayout
})
</script>

<template>
  <Layout>
    <router-view />
  </Layout>
</template>
