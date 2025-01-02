<template>
  <div
    ref="container"
    class="h-full w-full relative"
  >
    <img
      v-for="queuedUrl in queuedUrls"
      :key="queuedUrl"
      :src="queuedUrl"
      :alt="url === queuedUrl ? title : ''"
      :title="url === queuedUrl ? title : ''"
      :aria-hidden="url !== queuedUrl"
      style="width: 0;height: 0"
      class="queued-image rounded shadow-md absolute"
      :class="{
        invisible: url !== queuedUrl,
      }"
      @load="onImageLoadCallback"
    >
    <div
      v-if="!(isImageLoaded[url] ?? false)"
      ref="spinner"
      class="absolute"
      style="left: calc(50% - 1.25rem / 2); top: calc(50% - 1.25rem / 2)"
    >
      <svg class="animate-spin h-5 w-5 text-black dark:text-white" viewBox="0 0 24 24" fill="none">
        <path stroke="currentColor" stroke-width="4" d="M4 12a8 8 0 018-8" stroke-linecap="round" />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-param-reassign */
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ImageContainer',
  props: {
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    isImageLoaded: {} as Record<string, boolean>,
    queuedUrls: [] as string[],
  }),
  watch: {
    url(newUrl) {
      if (!this.queuedUrls.includes(newUrl)) {
        this.queuedUrls.push(newUrl);
      }
    },
  },
  mounted() {
    const containerElement = this.$refs.container as HTMLDivElement | null;
    if (containerElement !== null) {
      new ResizeObserver(this.onContainerResizeCallback).observe(containerElement);
    }

    this.queuedUrls.push(this.url);
  },
  methods: {
    onContainerResizeCallback(entries: ResizeObserverEntry[]) {
      const containerElement = this.$refs.container as HTMLDivElement | null;
      if (containerElement === null) {
        throw new Error('Invalid State: Tried to get container but it does not exist');
      }
      const queuedImages = containerElement.querySelectorAll('.queued-image') as HTMLImageElement[];
      entries.forEach((entry) => {
        this.repositionSpinner(entry.contentRect);
        queuedImages.forEach((imageElement) => {
          this.resizeImageToFitRect(entry.contentRect, imageElement);
        });
      });
    },
    onImageLoadCallback(event: Event) {
      const containerElement = this.$refs.container as HTMLDivElement | null;
      if (containerElement === null) {
        throw new Error('Invalid State: Tried to get container but it does not exist');
      }
      const imageElement = event.currentTarget as HTMLImageElement;
      this.resizeImageToFitRect(containerElement.getBoundingClientRect(), imageElement);
      this.isImageLoaded[imageElement.src ?? ''] = true;
    },
    repositionSpinner(rect: DOMRectReadOnly) {
      const spinnerElement = this.$refs.spinner as HTMLDivElement | null | undefined;
      if (spinnerElement === null || spinnerElement === undefined) {
        return;
      }
      spinnerElement.style.left = `${(rect.width - spinnerElement.offsetWidth) / 2}px`;
      spinnerElement.style.top = `${(rect.height - spinnerElement.offsetHeight) / 2}px`;
    },
    resizeImageToFitRect(rect: DOMRectReadOnly, imageElement: HTMLImageElement | null) {
      if (imageElement === null) {
        return;
      }

      const imageRatio = imageElement.naturalWidth / imageElement.naturalHeight;
      const containerRatio = rect.width / rect.height;

      // If the ratio is NaN, that usually means the image hasn't loaded. It could
      // also be that the container no longer exists on the page, but that's less
      // likely.
      if (Number.isNaN(imageRatio) || Number.isNaN(containerRatio)) {
        return;
      }

      if (containerRatio > imageRatio) {
        // This means the container is wider than the image in ratio, which means
        // the image should fit to the height.
        const width = rect.height * imageRatio;
        imageElement.style.height = '100%';
        imageElement.style.width = `${width}px`;
        imageElement.style.left = `${(rect.width - width) / 2}px`;
        imageElement.style.top = '0px';
      } else {
        // This means the image is wider than the container in ratio, which means
        // the image should fit to the width.
        const height = rect.width / imageRatio;
        imageElement.style.width = '100%';
        imageElement.style.height = `${height}px`;
        imageElement.style.left = '0px';
        imageElement.style.top = `${(rect.height - height) / 2}px`;
      }
    },
  },
});
</script>
