<script setup lang="ts">
import Header from './components/Header.vue';

</script> 

<template>
  <Header class="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]"></Header>
  <router-view />
</template>

<style scoped>
/* 路由过渡动画 */
.router-fade-enter-active,
.router-fade-leave-active {
  transition: opacity 0.3s ease;
}

.router-fade-enter-from,
.router-fade-leave-to {
  opacity: 0;
}
</style>
