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
  },
  mounted() {
    this.mountedSelectedIndex = this.selectedIndex;
    const buttons = this.$refs.buttons as HTMLDivElement|null;
    if (buttons !== null) {
      this.resizeObserver = new ResizeObserver(this.buttonsResizeCallback);
      this.resizeObserver.observe(buttons);

      buttons.addEventListener('mousedown', this.mouseDownCallback);
      buttons.addEventListener('mousemove', this.mouseMoveCallback);
      buttons.addEventListener('mouseup', this.mouseUpCallback);
      buttons.addEventListener('mouseleave', this.mouseCancelCallback);
      buttons.addEventListener('touchstart', this.touchStartCallback);
      buttons.addEventListener('touchmove', this.touchMoveCallback);
      buttons.addEventListener('touchend', this.touchEndCallback);
      buttons.addEventListener('touchcancel', this.touchCancelCallback);
    }
  },
  methods: {
    buttonsResizeCallback(entries: ResizeObserverEntry[]) {
      entries.forEach((entry) => {
        const hockeyPuck = this.$refs.hockeyPuck as HTMLDivElement | null;
        if (hockeyPuck === null) {
          return;
        }
        hockeyPuck.style.height = `${entry.contentRect.height}px`;
      });
    },
    selectButtonCallback(event: Event) {
      const button = event.target as HTMLButtonElement;
      const buttonIndex = this.getIndexOfButton(button);
      this.selectButton(buttonIndex);
    },
    mouseDownCallback(event: MouseEvent) {
      const buttonIndex = this.getIndexOfButtonAtPoint(event);
      if (buttonIndex === null) {
        return;
      }
      this.pressActive = true;
      this.pressActiveIndex = buttonIndex;
    },
    mouseMoveCallback(event: MouseEvent) {
      if (!this.pressActive) {
        return;
      }
      const buttonIndex = this.getIndexOfButtonAtPoint(event);
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
    mouseUpCallback(event: MouseEvent) {
      const buttonIndex = this.getIndexOfButtonAtPoint(event);
      if (buttonIndex === null) {
        return;
      }
      this.selectButton(buttonIndex);
      this.pressActive = false;
    },
    mouseCancelCallback() {
      this.pressActive = false;
    },
    touchStartCallback(event: TouchEvent) {
      event.preventDefault();
      const buttonIndex = this.getIndexOfButtonAtPoint(event.touches[0]);
      if (buttonIndex === null) {
        return;
      }
      this.pressActive = true;
      this.pressActiveIndex = buttonIndex;
    },
    touchMoveCallback(event: TouchEvent) {
      event.preventDefault();
      const buttonIndex = this.getIndexOfButtonAtPoint(event.changedTouches[0]);
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
    touchEndCallback(event: TouchEvent) {
      const buttonIndex = this.getIndexOfButtonAtPoint(event.changedTouches[0]);
      if (buttonIndex === null) {
        this.pressActive = false;
        return;
      }
      this.selectButton(buttonIndex);
      this.pressActive = false;
    },
    touchCancelCallback() {
      this.pressActive = false;
      this.pressActiveIndex = null;
    },
    selectButton(index: number) {
      this.mountedSelectedIndex = index;
      this.pressActiveIndex = index;
    },
    selectButtonToTheLeft() {
      this.selectButton(Math.max(0, this.mountedSelectedIndex - 1));
    },
    selectButtonToTheRight() {
      this.selectButton(Math.min(this.options.length - 1, this.mountedSelectedIndex + 1));
    },
    getIndexOfButtonAtPoint(point: Touch | MouseEvent): number | null {
      const elementsFromPoint = document
        .elementsFromPoint(point.clientX, point.clientY)
        .filter((element) => element.tagName === 'BUTTON');
      if (elementsFromPoint.length === 0) {
        return null;
      }
      const button = elementsFromPoint[0] as HTMLButtonElement;
      return this.getIndexOfButton(button);
    },
    getIndexOfButton(button: HTMLButtonElement) {
      const buttons = button.parentNode;
      if (buttons === null) {
        throw new Error('Invalid state: Tried to get index of button without a parent');
      }
      return Array.from(buttons.querySelectorAll('button')).indexOf(button);
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
