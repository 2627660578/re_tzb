<template>
  <div class="actions-panel">
    <h3 class="panel-title">操作</h3>
    <div class="actions-list">
      <!-- Download Dropdown -->
      <div class="dropdown-container">
        <button class="btn-primary  full-width">
          <span>下载</span>
          <svg 
            class="dropdown-icon" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              clip-rule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              fill-rule="evenodd"
            ></path>
          </svg>
        </button>
        
        <div class="dropdown-menu">
          <a 
            v-for="downloadOption in downloadOptions"
            :key="downloadOption.format"
            @click="handleDownload(downloadOption.format)"
            class="dropdown-item"
          >
            <svg class="dropdown-item-icon" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M216,152v56a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V152a8,8,0,0,1,16,0v48H200V152a8,8,0,0,1,16,0Zm-91.31,1.31a8,8,0,0,0,10.62,0l48-48a8,8,0,0,0-11.31-11.31L136,128.69V40a8,8,0,0,0-16,0v88.69L84.69,94a8,8,0,0,0-11.31,11.31Z"></path>
            </svg>
            {{ downloadOption.label }}
          </a>
        </div>
      </div>

      <!-- Back to Editing Button -->
      <button @click="$emit('backToEditing')" class="btn-secondary full-width">
        <svg class="button-icon" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64,168,43.31,212.68,88Z"></path>
        </svg>
        重新填写信息
      </button>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  downloadOptions: {
    type: Array,
    required: true
  }
})

// Events
const emit = defineEmits(['download', 'backToEditing'])

// Methods
const handleDownload = (format) => {
  emit('download', format)
}
</script>

<style scoped>
/* Actions Panel */
.actions-panel {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Dropdown */
.dropdown-container {
  position: relative;
  padding-bottom: 0.5rem; /* 为菜单腾出空间 */
  margin-bottom: -0.5rem; /* 抵消padding-bottom对布局的影响 */
}

.download-btn {
  justify-content: space-between !important;
}

.dropdown-icon {
  height: 1.25rem;
  width: 1.25rem;
  transition: transform 0.15s ease-in-out;
}

.dropdown-container:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  width: 100%;
  top: calc(100% - 0.5rem);
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  z-index: 10;
  display: none;
}

.dropdown-container:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-item-icon {
  margin-right: 0.5rem;
  height: 1.25rem;
  width: 1.25rem;
}

/* 按钮样式 */
.btn-primary {
  display: flex;
  min-width: 84px;
  max-width: 480px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 9999px;
  height: 2.5rem;
  padding: 0 1.25rem;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: normal;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: all 0.15s ease-in-out;
  background-color: #0b80ee;
  border: none;
  text-decoration: none;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  display: flex;
  min-width: 84px;
  max-width: 480px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 9999px;
  height: 2.5rem;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: normal;
  transition: all 0.15s ease-in-out;
  background-color: #e7edf4;
  color: #111827;
  border: none;
  text-decoration: none;
}

.btn-secondary:hover {
  opacity: 0.8;
}

.full-width {
  width: 100%;
  max-width: none;
}

.button-icon {
  margin-right: 0.5rem;
  height: 1.25rem;
  width: 1.25rem;
}
</style>