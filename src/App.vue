<template>
  <div>
    <div class="w-full p-2">
      <segmented-control
        :options="labels"
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

export interface Option {
  label: string;
}

export default defineComponent({
  name: 'App',
  components: {
    SegmentedControl,
  },
  data: () => ({
    options: [
      {
        label: 'Threshold Filter',
      },
      {
        label: 'Floyd-Steinberg',
      },
      {
        label: 'Custom Kernel Filter',
      },
      {
        label: 'LEGO',
      },
    ] as Option[],
    selectedIndex: 0,
  }),
  computed: {
    labels(): string[] {
      return this.options.map((option) => option.label);
    },
  },
});
</script>
