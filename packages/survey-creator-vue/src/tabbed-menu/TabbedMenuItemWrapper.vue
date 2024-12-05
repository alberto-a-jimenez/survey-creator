<template>
  <span
    :id="`tab-${item.id}`"
    role="tab"
    :aria-selected="item.active"
    :aria-controls="`scrollableDiv-${item.id}`"
    class="svc-tabbed-menu-item-container"
    :class="[!item.isVisible ? 'sv-action--hidden' : '', item.css]"
  >
    <div class="sv-action__content">
      <SvComponent
        :is="item.component || 'svc-tabbed-menu-item'"
        :item="item"
      ></SvComponent>
    </div>
  </span>
</template>
<script setup lang="ts">
import { SvComponent } from "survey-vue3-ui";
import type { TabbedMenuItem } from "survey-creator-core";
import { useBase } from "survey-vue3-ui";
const props = defineProps<{ item: TabbedMenuItem }>();
useBase(() => props.item);
</script>
