<template>
  <div
    class="p-2 grid gap-2 grid-cols-1 grid-rows-2"
    style="
      grid-template-rows: 1fr min-content;
      height: var(--vh);
    "
  >
    <div>
      <img
        :src="selectedUrl"
        :alt="selectedLabel"
        :title="selectedLabel"
        class="rounded shadow-xl"
        style="image-rendering: pixelated;"
      >
    </div>
    <div>
      <segmented-control
        :options="labels"
        :selected-index="selectedIndex"
        @update:selected-index="selectedIndex = $event;"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SegmentedControl from './components/SegmentedControl.vue';

export interface Option {
  label: string;
  url: string;
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
        url: 'https://assets.leifgehrmann.com/posts/2021-12-01/land_threshold.png',
      },
      {
        label: 'Floyd-Steinberg',
        url: 'https://assets.leifgehrmann.com/posts/2021-12-01/land_dither.png',
      },
      {
        label: 'Custom Kernel Filter',
        url: 'https://assets.leifgehrmann.com/posts/2021-12-01/land_custom.png',
      },
      {
        label: 'LEGO',
        url: 'https://assets.leifgehrmann.com/posts/2021-12-01/land_lego.png',
      },
    ] as Option[],
    selectedIndex: 0,
  }),
  computed: {
    labels(): string[] {
      return this.options.map((option) => option.label);
    },
    selectedLabel(): string {
      return this.options[this.selectedIndex].label;
    },
    selectedUrl(): string {
      return this.options[this.selectedIndex].url;
    },
  },
  mounted() {
    this.setupViewportResizer();
  },
  methods: {
    setupViewportResizer() {
      const setVh = () => {
        const vh = window.innerHeight;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      window.addEventListener('load', setVh);
      window.addEventListener('resize', setVh);
    },
  },
});
</script>
