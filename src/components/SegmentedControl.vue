<template>
  <div>
    <div class="bg-gray-200 dark:bg-gray-800 p-1 rounded-xl relative text-sm overflow-hidden">
      <div
        class="relative"
      >
        <div
          ref="hockeyPuck"
          class="
            transition-position ease-out duration-300
            transform absolute
            bg-white dark:bg-gray-700
            rounded-lg
            shadow-lg
            p-2
          "
          :class="{'scale-95': pressActive && mountedSelectedIndex === pressActiveIndex}"
          :style="{
            width: optionWidth,
            left: selectedOptionPositionLeft,
            'transform-origin': `${selectedOptionTransformationOrigin} center`
          }"
        />
      </div>
      <div
        ref="buttons"
        class="w-full relative flex"
      >
        <template
          v-for="(item, index) in options"
          :key="index"
        >
          <div
            v-if="index > 0"
            class="select-none py-2"
            :style="{width: gapWidth}"
          >
            <span
              class="
                mx-auto block
                w-0.5 h-full
                bg-black dark:bg-white
                rounded-lg
                transition-opacity ease-out duration-300
              "
              :class="{
                'opacity-10 dark:opacity-20': !(
                  (index - 1 === mountedSelectedIndex) || (index === mountedSelectedIndex)
                ),
                'opacity-0': (
                  (index - 1 === mountedSelectedIndex) || (index === mountedSelectedIndex)
                )
              }"
            />
          </div>
          <button
            v-if="item !== null"
            class="
              p-2 rounded-lg
              overflow-hidden overflow-ellipsis
              transform transition ease-out duration-300
            "
            :class="{
              'scale-95': (
                index === pressActiveIndex && pressActive && index === mountedSelectedIndex
              ),
            }"
            :style="{width: optionWidth}"
            @click="selectButton(index)"
            @mousedown="pressActive = true; pressActiveIndex = index"
            @mouseleave="pressActive = false"
            @mouseup="pressActive = false"
            @mouseout="pressActive = false"
            @focus="pressActive = true; pressActiveIndex = index"
            @focusout="pressActive = false"
            @keydown.left="selectButtonToTheLeft"
            @keydown.right="selectButtonToTheRight"
          >
            <span
              class="transition transform block ease-out duration-300"
              :class="{
                'opacity-100 scale-95': index === mountedSelectedIndex,
                'opacity-70': (
                  index !== mountedSelectedIndex && (!pressActive || index !== pressActiveIndex)
                ),
                'opacity-50': (
                  index === pressActiveIndex && index !== mountedSelectedIndex && pressActive
                ),
              }"
              :style="{
                'transform-origin': `${selectedOptionTransformationOrigin} center`,
              }"
            >
              {{ item }}
            </span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SegmentedControl',
  props: {
    options: {
      type: Array as () => string[],
      required: true,
    },
    selectedIndex: {
      type: Number,
      required: true,
    },
  },
  emits: [
    'update:selectedIndex',
  ],
  data: () => ({
    mountedSelectedIndex: 0,
    pressActive: false,
    pressActiveIndex: 0,
    resizeObserver: null as null|ResizeObserver,
  }),
  computed: {
    optionWidth() {
      const numberOfOptions = this.options.length;
      return `calc((100% - (${numberOfOptions} - 1) * ${this.gapWidth}) / ${numberOfOptions})`;
    },
    gapWidth() {
      return '4px';
    },
    selectedOptionPositionLeft() {
      const selectedOption = this.mountedSelectedIndex;
      const numberOfOptions = this.options.length;
      const buttonWidthsToSubtract = `(${this.optionWidth} * (${numberOfOptions} - ${selectedOption}))`;
      const gapsToSubtract = `(${this.gapWidth} * (${numberOfOptions} - ${selectedOption} - 1))`;
      return `calc(100% - ${buttonWidthsToSubtract} - ${gapsToSubtract})`;
    },
    selectedOptionTransformationOrigin() {
      const selectedOption = this.mountedSelectedIndex;
      const numberOfOptions = this.options.length;
      return `calc(100% * (${selectedOption + 1} / ${numberOfOptions + 1}))`;
    },
  },
  watch: {
    selectedIndex(): void {
      this.mountedSelectedIndex = this.selectedIndex;
    },
  },
  mounted() {
    this.mountedSelectedIndex = this.selectedIndex;
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const hockeyPuck = this.$refs.hockeyPuck as HTMLDivElement | null;
        if (hockeyPuck === null) {
          return;
        }
        hockeyPuck.style.height = `${entry.contentRect.height}px`;
      });
    });

    this.resizeObserver.observe(this.$refs.buttons);
  },
  methods: {
    selectButton(index: number) {
      this.mountedSelectedIndex = index;
    },
    selectButtonToTheLeft() {
      this.mountedSelectedIndex = Math.max(0, this.mountedSelectedIndex - 1);
    },
    selectButtonToTheRight() {
      this.mountedSelectedIndex = Math.min(this.options.length - 1, this.mountedSelectedIndex + 1);
    },
  },
});
</script>

<style>

</style>
