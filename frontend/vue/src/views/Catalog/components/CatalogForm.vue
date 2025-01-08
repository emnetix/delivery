<script setup lang="ts">
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import { useRouter } from 'vue-router'

import { Icon } from '@iconify/vue'

const { push } = useRouter()

interface Feature {
  icon: string
  title: string
  url: string
  external?: boolean
}

const features = ref<Feature[]>([
  { icon: 'mdi:terminal', title: 'admin', url: '/ent02/delivery/admin' },
  { icon: 'mdi:toggle-switch', title: 'test', url: '/ent02/delivery/delivery' },
  { icon: 'mdi:web', title: '에프에이리눅스', url: 'https://www.falinux.com/', external: true }
])

const navigateTo = (feature: Feature) => {
  if (feature.external) {
    window.open(feature.url, '_blank')
  } else {
    push({ path: feature.url })
  }
}
</script>

<template>
  <div class="catalog-form">
    <div class="feature-grid">
      <el-button
        v-for="feature in features"
        :key="feature.title"
        @click="navigateTo(feature)"
        type="primary"
        class="feature-button"
      >
        <Icon :icon="feature.icon" class="feature-icon" />
        <span class="feature-title">{{ feature.title }}</span>
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.catalog-form {
  padding: 10px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  max-width: 700px;
  margin: 0 auto;
  box-sizing: border-box;
}

.feature-button {
  width: 100%;
  height: auto;
  white-space: nowrap;
  padding: 15px;
  box-sizing: border-box;
}

.feature-icon {
  font-size: 24px;
  margin-right: 10px;
}

.feature-title {
  font-size: 18px;
}

@media screen and (max-width: 1024px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
