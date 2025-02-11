<template>
  <div>
    <div
      class="
        p-1
        relative
        bg-black/5 dark:bg-white/15
        rounded-xl
        text-sm leading-5
        overflow-hidden
      "
    >
      <div
        class="relative"
      >
        <div
          class="
            transform
            transition-transform ease-out duration-300
            translate-x-(--selected-option-position-left)
          "
          :style="{
            '--selected-option-position-left': selectedOptionPositionLeft,
          }"
        >
          <div
            ref="hockeyPuck"
            class="
              p-2
              absolute
              bg-white
              dark:bg-white/20
              rounded-lg
              shadow-lg
              transform
              transition-transform ease-out duration-300
            "
            :class="{ 'scale-95': pressActive && mountedSelectedIndex === pressActiveIndex }"
            :style="{
              width: optionWidth,
              'transform-origin': `${selectedOptionTransformationOrigin} center`,
            }"
          />
        </div>
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
            :style="{ width: gapWidth }"
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
                ),
              }"
            />
          </div>
          <button
            v-if="item !== null"
            type="button"
            class="
              py-2 rounded-lg
              overflow-hidden
              text-ellipsis
              cursor-pointer
              transform transition ease-out duration-300
            "
            :class="{
              'scale-95': (
                index === pressActiveIndex && pressActive && index === mountedSelectedIndex
              ),
            }"
            :style="{ width: optionWidth }"
            @click="selectButtonCallback"
            @keydown.left="selectButtonToTheLeft"
            @keydown.right="selectButtonToTheRight"
          >
            <span
              class="transition transform block ease-out duration-300 pointer-events-none"
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

// vue-tsc requires that we define the tailwind CSS property that we use in this component
// to be in the CSSProperties interface. This module declaration accomplishes it quite neatly.
// See https://github.com/johnsoncodehk/vue-tsc/issues/19
declare module '@vue/runtime-dom' {
  export interface CSSProperties {
    '--tw-translate-x'?: string
  }
}

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
    pressActiveIndex: null as number | null,
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
    mountedSelectedIndex(): void {
      this.$emit('update:selectedIndex', this.mountedSelectedIndex);
    },
  },
  mounted() {
    this.mountedSelectedIndex = this.selectedIndex;
    const buttonsContainer = this.getButtonsContainer();
    this.resizeObserver = new ResizeObserver(this.buttonsResizeCallback);
    this.resizeObserver.observe(buttonsContainer);

    // Handle mouse-movements. We attach listeners to the document to allow
    // tracking changes outside of the button section.
    buttonsContainer.addEventListener('mousedown', this.mouseDownCallback);
    document.addEventListener('mousemove', this.mouseMoveCallback);
    document.addEventListener('mouseup', this.mouseUpCallback);

    // Handle touch-movements.
    buttonsContainer.addEventListener('touchstart', this.touchStartCallback);
    buttonsContainer.addEventListener('touchmove', this.touchMoveCallback);
    buttonsContainer.addEventListener('touchend', this.mouseUpCallback);
  },
  methods: {
    buttonsResizeCallback(entries: ResizeObserverEntry[]) {
      entries.forEach((entry) => {
        const hockeyPuck = this.$refs.hockeyPuck as HTMLDivElement | null;
        if (hockeyPuck === null) {
          throw new Error('Invalid state: hockeyPuck does not exist');
        }
        hockeyPuck.style.height = `${entry.contentRect.height}px`;
      });
    },
    selectButtonCallback(event: Event) {
      const button = event.target as HTMLButtonElement;
      const buttonIndex = this.getIndexOfButton(button);
      this.selectButton(buttonIndex);
    },
    mouseDownCallback(event: MouseEvent | TouchEvent) {
      const point = this.getPointFromEvent(event);
      const buttonIndex = this.getIndexOfButtonAtPoint(point);
      if (buttonIndex === null) {
        return;
      }
      this.pressActive = true;
      this.pressActiveIndex = buttonIndex;
    },
    mouseMoveCallback(event: MouseEvent | TouchEvent) {
      if (!this.pressActive) {
        return;
      }
      const point = this.getPointFromEvent(event);
      const buttonIndex = this.getIndexOfButtonAtPoint(point);
      if (buttonIndex === null) {
        return;
      }
      if (this.pressActiveIndex === this.mountedSelectedIndex) {
        this.selectButton(buttonIndex);
      } else if (this.mountedSelectedIndex !== buttonIndex && buttonIndex != null) {
        this.pressActiveIndex = buttonIndex;
      } else {
        this.pressActiveIndex = null;
      }
    },
    mouseUpCallback(event: MouseEvent | TouchEvent) {
      if (!this.pressActive) {
        return;
      }
      const point = this.getPointFromEvent(event);
      const buttonIndex = this.getIndexOfButtonAtPoint(point);
      if (buttonIndex === null) {
        this.pressActive = false;
        return;
      }
      this.selectButton(buttonIndex);
      this.pressActive = false;
    },
    touchStartCallback(event: TouchEvent) {
      event.preventDefault();
      this.mouseDownCallback(event);
    },
    touchMoveCallback(event: TouchEvent) {
      event.preventDefault();
      this.mouseMoveCallback(event);
    },
    selectButton(index: number) {
      this.mountedSelectedIndex = index;
      this.pressActiveIndex = index;
    },
    selectButtonToTheLeft() {
      this.selectButton(Math.max(0, this.mountedSelectedIndex - 1));
      this.getButtons()[this.mountedSelectedIndex].focus();
    },
    selectButtonToTheRight() {
      this.selectButton(Math.min(this.options.length - 1, this.mountedSelectedIndex + 1));
      this.getButtons()[this.mountedSelectedIndex].focus();
    },
    getPointFromEvent(event: TouchEvent | MouseEvent): Touch | MouseEvent {
      if ('changedTouches' in event) {
        return event.changedTouches[0];
      }
      return event;
    },
    getIndexOfButtonAtPoint(point: Touch | MouseEvent): number | null {
      const buttonIndex = this.getButtons()
        .findIndex((button) => {
          const rect = button.getBoundingClientRect();
          return (
            (point.clientX >= rect.x)
            && (point.clientX <= rect.x + rect.width)
          );
        });
      if (buttonIndex === -1) {
        return null;
      }
      return buttonIndex;
    },
    getIndexOfButton(button: HTMLButtonElement) {
      return this.getButtons().indexOf(button);
    },
    getButtonsContainer() {
      const buttons = this.$refs.buttons as HTMLDivElement | null;
      if (buttons === null) {
        throw new Error('Invalid state: Button container does not exist');
      }
      return buttons;
    },
    getButtons() {
      return Array.from(this.getButtonsContainer().querySelectorAll('button'));
    },
  },
});
</script>

<style scoped>
button {
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}
button {
  font-size: 11px;
}
@media (min-width: 19em) {
  button {
    font-size: 14px;
  }
}
@media (min-width: 38em) {
  html {
    font-size: 20px;
  }
}
</style>
