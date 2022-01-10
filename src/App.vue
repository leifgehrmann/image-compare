<template>
  <div
    v-if="optionsHaveLoaded"
    class="p-2 grid gap-2 grid-cols-1 grid-rows-2"
    style="grid-template-rows: 1fr min-content;"
    :style="{height: styleHeight}"
  >
    <div>
      <image-container
        :url="selectedUrl"
        :title="selectedLabel"
      />
    </div>
    <div>
      <segmented-control
        :options="labels"
        :selected-index="selectedIndex"
        @update:selected-index="selectedIndex = $event;"
      />
    </div>
  </div>
  <div
    v-else-if="!isLoadingConfiguration"
    class="p-2 text-center"
  >
    <h1 class="p-2 text-5xl">
      <span
        role="img"
        aria-label="Damaged"
      >🤕</span>
    </h1>
    <p class="p-2 text-xl">
      Failed to load configuration
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SegmentedControl from './components/SegmentedControl.vue';
import ImageContainer from './components/ImageContainer.vue';

export interface Option {
  label: string;
  url: string;
}

export default defineComponent({
  name: 'App',
  components: {
    ImageContainer,
    SegmentedControl,
  },
  data: () => ({
    options: [] as Option[],
    selectedIndex: 0,
    isLoadingConfiguration: true,
  }),
  computed: {
    optionsHaveLoaded(): boolean {
      return this.options.length > 0;
    },
    labels(): string[] {
      return this.options.map((option) => option.label);
    },
    selectedLabel(): string {
      return this.options[this.selectedIndex].label;
    },
    selectedUrl(): string {
      return this.options[this.selectedIndex].url;
    },
    styleHeight(): string {
      // Detects if the window is an iframe.
      const isIframe = (window !== window.parent);
      if (isIframe) {
        return 'calc(var(--vh))';
      }
      return 'calc('
        + 'var(--vh) '
        + '- env(safe-area-inset-bottom) '
        + '- env(safe-area-inset-top)'
        + ')';
    },
  },
  mounted() {
    this.setupViewportResizer();
    this.loadConfig();
  },
  methods: {
    async loadConfig(): Promise<void> {
      const configUrlEncoded = window.location.hash.substring(1);
      const configUrl = decodeURIComponent(configUrlEncoded);
      try {
        const config = await fetch(configUrl).then((response) => response.json());
        this.options = config.options;
      } catch (e) {
        /* Do nothing, a error message will display if no options were loaded. */
      }
      this.isLoadingConfiguration = false;
    },
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
