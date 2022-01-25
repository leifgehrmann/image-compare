<template>
  <div
    ref="container"
    class="h-full w-full relative"
  >
    <img
      ref="image"
      :src="url"
      :alt="title"
      :title="title"
      class="rounded shadow-md absolute"
      @load="onImageLoadCallback"
    >
  </div>
</template>

<script lang="ts">
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
  mounted() {
    const containerElement = this.$refs.container as HTMLDivElement | null;
    if (containerElement !== null) {
      new ResizeObserver(this.onContainerResizeCallback).observe(containerElement);
    }
  },
  methods: {
    onContainerResizeCallback(entries: ResizeObserverEntry[]) {
      entries.forEach((entry) => {
        this.resizeImageToFitRect(entry.contentRect);
      });
    },
    onImageLoadCallback() {
      const containerElement = this.$refs.container as HTMLDivElement | null;
      if (containerElement === null) {
        throw new Error('Invalid State: Tried to get container but it does not exist');
      }
      this.resizeImageToFitRect(containerElement.getBoundingClientRect());
    },
    resizeImageToFitRect(rect: DOMRectReadOnly) {
      const imageElement = this.$refs.image as HTMLImageElement | null;
      if (imageElement === null) {
        throw new Error('Invalid State: Tried to get image but it does not exist');
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
