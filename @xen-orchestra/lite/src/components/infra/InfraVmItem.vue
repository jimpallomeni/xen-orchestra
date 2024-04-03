<template>
  <TreeItem v-if="vm !== undefined" ref="rootElement" class="infra-vm-item">
    <TreeItemLabel
      v-if="isVisible"
      :icon="faDisplay"
      :route="{ name: 'vm.console', params: { uuid: vm.uuid } }"
      no-indent
    >
      {{ vm.name_label || '(VM)' }}
      <template #icon>
        <VmIcon :state="vmPowerState!" />
      </template>
      <template #addons>
        <MenuList placement="bottom-start" shadow>
          <template #trigger="{ open, isOpen }">
            <ButtonIcon
              v-tooltip="{ content: $t('core.quick-actions'), placement: 'right' }"
              :class="{ active: isOpen }"
              :icon="faEllipsis"
              @click="open"
            />
          </template>
          <MenuItem :icon="faPowerOff">
            {{ $t('core.change-state') }}
            <template #submenu>
              <VmActionPowerStateItems :vm-refs="[vm.$ref]" />
            </template>
          </MenuItem>
          <VmActionMigrateItem :selected-refs="[vm.$ref]" is-single-action />
          <VmActionSnapshotItem :vm-refs="[vm.$ref]" />
        </MenuList>
      </template>
    </TreeItemLabel>
  </TreeItem>
</template>

<script lang="ts" setup>
import VmActionMigrateItem from '@/components/vm/VmActionItems/VmActionMigrateItem.vue'
import VmActionPowerStateItems from '@/components/vm/VmActionItems/VmActionPowerStateItems.vue'
import VmActionSnapshotItem from '@/components/vm/VmActionItems/VmActionSnapshotItem.vue'
import type { VM_POWER_STATE } from '@/libs/xen-api/xen-api.enums'
import type { XenApiVm } from '@/libs/xen-api/xen-api.types'
import { useVmCollection } from '@/stores/xen-api/vm.store'
import ButtonIcon from '@core/components/button/ButtonIcon.vue'
import VmIcon from '@core/components/icon/VmIcon.vue'
import MenuItem from '@core/components/menu/MenuItem.vue'
import MenuList from '@core/components/menu/MenuList.vue'
import TreeItem from '@core/components/tree/TreeItem.vue'
import TreeItemLabel from '@core/components/tree/TreeItemLabel.vue'
import { vTooltip } from '@core/directives/tooltip.directive'
import { faDisplay, faEllipsis, faPowerOff } from '@fortawesome/free-solid-svg-icons'
import { useIntersectionObserver } from '@vueuse/core'
import { computed, ref } from 'vue'

const props = defineProps<{
  vmOpaqueRef: XenApiVm['$ref']
}>()

const { getByOpaqueRef } = useVmCollection()
const vm = computed(() => getByOpaqueRef(props.vmOpaqueRef))
const rootElement = ref()
const isVisible = ref(false)

const { stop } = useIntersectionObserver(rootElement, ([entry]) => {
  if (entry.isIntersecting) {
    isVisible.value = true
    stop()
  }
})

const vmPowerState = computed(() => vm.value?.power_state.toLowerCase() as Lowercase<VM_POWER_STATE> | undefined)
</script>
