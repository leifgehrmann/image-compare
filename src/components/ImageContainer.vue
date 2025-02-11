<template>
  <div
    ref="container"
    class="h-full w-full relative"
  >
    <picture
      v-for="queuedPicture in queuedPictures"
      :key="queuedPicture.src"
    >
      <source
        v-for="source in queuedPicture.sources"
        :key="source.srcset"
        :media="source.media"
        :type="source.type"
        :srcset="source.srcset"
      />
      <img
        :src="queuedPicture.src"
        :alt="picture.src === queuedPicture.src ? picture.alt : ''"
        :title="picture.src === queuedPicture.src ? picture.title : ''"
        :aria-hidden="picture.src !== queuedPicture.src"
        :data-original-src="queuedPicture.src"
        style="width: 0;height: 0"
        class="queued-image rounded-sm shadow-md absolute"
        :class="{
          invisible: picture.src !== queuedPicture.src,
        }"
        @load="onImageLoadCallback"
      >
    </picture>
    <div
      v-if="!(isPictureLoaded[picture.src] ?? false)"
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
// eslint-disable-next-line import/extensions,import/no-unresolved
import { Source } from '../configSchema';

export interface Picture {
  title: string;
  alt: string;
  src: string;
  sources: Source[];
}

export default defineComponent({
  name: 'ImageContainer',
  props: {
    picture: {
      type: Object as () => Picture,
      required: true,
    },
  },
  data: () => ({
    isPictureLoaded: {} as Record<string, boolean>,
    queuedPictures: [] as Picture[],
  }),
  watch: {
    picture(newPicture) {
      if (!this.queuedPictures.some((obj) => obj.src === newPicture.src)) {
        this.queuedPictures.push(newPicture);
      }
    },
  },
  mounted() {
    const containerElement = this.$refs.container as HTMLDivElement | null;
    if (containerElement !== null) {
      new ResizeObserver(this.onContainerResizeCallback).observe(containerElement);
    }

    this.queuedPictures.push(this.picture);
  },
  methods: {
    onContainerResizeCallback(entries: ResizeObserverEntry[]) {
      entries.forEach((entry) => {
        const queuedImages = entry.target.querySelectorAll('.queued-image') as NodeListOf<HTMLImageElement>;
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
      // event.currentTarget will always be an <img> element.
      const imageElement = event.currentTarget as HTMLImageElement;
      this.resizeImageToFitRect(containerElement.getBoundingClientRect(), imageElement);
      this.isPictureLoaded[imageElement.dataset.originalSrc ?? ''] = true;
    },
    resizeImageToFitRect(rect: DOMRectReadOnly, imageElement: HTMLImageElement) {
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
