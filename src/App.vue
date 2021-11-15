<template>
  <div>
    <div class="w-full p-2">
      <segmented-control
        :options="options"
        :selected-index="selectedIndex"
        @update:selected-index="selectedIndex = $event;"
      />
    </div>
    <div class="w-full p-2">
      Hello World
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SegmentedControl from './components/SegmentedControl.vue';

export default defineComponent({
  name: 'App',
  components: {
    SegmentedControl,
  },
  data: () => ({
    options: [
      'Threshold Filter', 'Floyd-Steinberg', 'Custom',
    ],
    selectedIndex: 0,
  }),
});
</script>
