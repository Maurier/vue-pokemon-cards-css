<template>
  <div
    class="card"
    :class="{ active, interacting, loading }"
    ref="card"
    :style="styles"
    :data-number="number"
    :data-subtypes="subtypes"
    :data-supertype="supertype"
    :data-rarity="rarity"
    :data-gallery="gallery"
  >
    <div class="card__translater">
      <button
        class="card__rotator"
        ref="rotator"
        @pointermove="interact"
        @mouseout="interactEnd"
        aria-label="Expand the Pokemon Card; {name}."
      >
        <img
          class="card__back"
          :src="back_img"
          alt="The back of a Pokemon Card, a Pokeball in the center with Pokemon logo above and below"
        />
        <div class="card__front">
          <img
            :src="front_img"
            v-on:load="imageLoader"
            :alt="`Front design of the ${name} Pokemon Card, with the stats and info around the edge`"
          />
          <card-shine :subtypes="subtypes" :supertype="supertype" />
          <card-glare :subtypes="subtypes" :rarity="rarity" />
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Ref, Watch } from "vue-property-decorator";
import { useSpring } from "@vueuse/motion";
import { clamp, round } from "@/helpers/Math";
import CardShine from "@/components/card-shine.vue";
import CardGlare from "@/components/card-glare.vue";

const galaxyPosition = Math.floor(Math.random() * 1500);
const back_img =
  "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg";

@Component({
  name: "card",
  components: { CardShine, CardGlare },
})
export default class Card extends Vue {
  @Prop() img!: string;
  @Prop() name!: string;
  @Prop() number!: number;
  @Prop() supertype!: string;
  @Prop() subtypes!: string[];
  @Prop() rarity!: string;
  @Prop() gallery!: boolean;
  @Prop() active!: boolean;
  @Ref("card") thisCard;
  @Ref("rotator") rotator;

  private springR = { stiffness: 666, damping: 25 };
  private springD = { stiffness: 333, damping: 45 };

  private springRotate = useSpring({ x: 0, y: 0 }, this.springR);
  private springGlare = useSpring({ x: 50, y: 50, o: 0 }, this.springR);
  private springBackground = useSpring({ x: 50, y: 50 }, this.springR);

  private springRotateDelta = useSpring({ x: 0, y: 0 }, this.springD);
  private springTranslate = useSpring({ x: 0, y: 0 }, this.springD);
  private springScale = useSpring({ s: 1 }, this.springD);

  private firstPop = true;
  interacting = false;
  loading = true;
  back_img;
  debounce;
  back_loading;
  front_loading;
  front_img = "";

  get styles() {
    return `
		--mx: ${this.springGlare.values.x}%;
		--my: ${this.springGlare.values.y}%;
		--tx: ${this.springTranslate.values.x}px;
		--ty: ${this.springTranslate.values.y}px;
		--s: ${this.springScale.values.s};
		--o: ${this.springGlare.values.o};
		--rx: ${this.springRotate.values.x + this.springRotateDelta.values.x}deg;
		--ry: ${this.springRotate.values.y + this.springRotateDelta.values.y}deg;
		--pos: ${this.springBackground.values.x}% ${this.springBackground.values.y}%;
		--posx: ${this.springBackground.values.x}%;
		--posy: ${this.springBackground.values.y}%;
		--hyp: ${clamp(
      Math.sqrt(
        (this.springGlare.values.y - 50) * (this.springGlare.values.y - 50) +
          (this.springGlare.values.x - 50) * (this.springGlare.values.x - 50)
      ) / 50,
      0,
      1
    )};
    --galaxybg: center ${galaxyPosition}px;
	  `;
  }

  created() {
    const img_base = this.img.startsWith("http")
      ? ""
      : "https://images.pokemontcg.io/";
    this.front_img = img_base + this.img;
    this.back_img = back_img;
  }
  mounted() {
    window.addEventListener("scroll", this.reposition, true);
  }

  destroyed() {
    document.removeEventListener("scroll", this.reposition);
  }
  reposition(e) {
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => {
      if (this.active) {
        this.setCenter();
      }
    }, 300);
  }

  setCenter() {
    const rect = this.thisCard.getBoundingClientRect(); // get element's size/position
    const view = document.documentElement; // get window/viewport size

    const delta = {
      x: round(view.clientWidth / 2 - rect.x - rect.width / 2),
      y: round(view.clientHeight / 2 - rect.y - rect.height / 2),
    };
    this.springTranslate.set({
      x: delta.x,
      y: delta.y,
    });
  }

  interact(e) {
    if (this.active) {
      this.interacting = true;
    }

    if (e.type === "touchmove") {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
    }

    const $el = e.target;
    const rect = $el.getBoundingClientRect(); // get element's current size/position
    const absolute = {
      x: e.clientX - rect.left, // get mouse position from left
      y: e.clientY - rect.top, // get mouse position from right
    };
    const percent = {
      x: round((100 / rect.width) * absolute.x),
      y: round((100 / rect.height) * absolute.y),
    };
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    };

    this.springBackground.values.stiffness = this.springR.stiffness;
    this.springBackground.values.damping = this.springR.damping;
    this.springBackground.set({
      x: round(50 + percent.x / 4 - 12.5),
      y: round(50 + percent.y / 3 - 16.67),
    });
    this.springRotate.values.stiffness = this.springR.stiffness;
    this.springRotate.values.damping = this.springR.damping;
    this.springRotate.set({
      x: round(-(center.x / 3.5)),
      y: round(center.y / 2),
    });
    this.springGlare.values.stiffness = this.springR.stiffness;
    this.springGlare.values.damping = this.springR.damping;
    this.springGlare.set({
      x: percent.x,
      y: percent.y,
      o: 1,
    });
  }

  imageLoader() {
    this.loading = false;
  }

  interactEnd(e, delay = 100) {
    setTimeout(() => {
      const snapStiff = 0.01;
      const snapDamp = 0.06;
      this.interacting = false;

      this.springRotate.values.stiffness = snapStiff;
      this.springRotate.values.damping = snapDamp;
      this.springRotate.set({ x: 0, y: 0 });

      this.springGlare.values.stiffness = snapStiff;
      this.springGlare.values.damping = snapDamp;
      this.springGlare.set({ x: 50, y: 50, o: 0 });

      this.springBackground.values.stiffness = snapStiff;
      this.springBackground.values.damping = snapDamp;
      this.springBackground.set({ x: 50, y: 50 });
    }, delay);
  }

  private _popover() {
    const rect = this.thisCard.getBoundingClientRect(); // get element's size/position
    let delay = 100;
    let scaleW = (window.innerWidth / rect.width) * 0.9;
    let scaleH = (window.innerHeight / rect.height) * 0.9;
    let scaleF = 1.75;
    this._setCenter();
    if (this.firstPop) {
      delay = 1000;
      this.springRotateDelta.set({
        x: 360,
        y: 0,
      });
      this.firstPop = false;
    }
    this.springScale.set({ s: Math.min(scaleW, scaleH, scaleF) });
    this.interactEnd(null, delay);
  }

  private _retreat() {
    this.springScale.set({ s: 1 });
    this.springTranslate.set({ x: 0, y: 0 });
    this.springRotateDelta.set({ x: 0, y: 0 });
    this.interactEnd(null, 100);
  }

  private _setCenter() {
    const rect = this.thisCard.getBoundingClientRect(); // get element's size/position
    const view = document.documentElement; // get window/viewport size
    const delta = {
      x: round(view.clientWidth / 2 - rect.x - rect.width / 2),
      y: round(view.clientHeight / 2 - rect.y - rect.height / 2),
    };
    this.springTranslate.set({
      x: delta.x,
      y: delta.y,
    });
  }

  @Watch("active")
  private _onActiveChange(isActive, wasActive) {
    if (isActive !== wasActive) {
      if (isActive) {
        this._popover();
      } else {
        this._retreat();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:root {
  --mx: 50%;
  --my: 50%;
  --s: 1;
  --o: 0;
  --tx: 0px;
  --ty: 0px;
  --rx: 0deg;
  --ry: 0deg;
  --pos: 50% 50%;
  --posx: 50%;
  --posy: 50%;
  --hyp: 0;
}

.card {
  --radius: 4.55% / 3.5%;
  --back: #004177;
  --glow: #69d1e9;
  z-index: calc(var(--s) * 100);
  transform: translate3d(0, 0, 0.1px);
  will-change: transform, visibility;
  transform-style: preserve-3d;
  width: 300px;

  &.interacting {
    z-index: calc(var(--s) * 120);
  }

  &.active {
    .card__translater,
    .card__rotator {
      touch-action: none;
    }

    .card__rotator {
      box-shadow: 0 0 10px 0px var(--glow), 0 0 10px 0px var(--glow),
        0 0 30px 0px var(--glow);
    }

    .card__rotator:focus {
      box-shadow: 0px 10px 30px 3px black;
    }
  }

  &.loading {
    .card__front {
      opacity: 0;
    }

    .card__back {
      transform: rotateY(0deg);
    }
  }
}

.card__translater,
.card__rotator {
  display: grid;
  perspective: 600px;
  transform-origin: center;
  -webkit-transform-origin: center;
  will-change: transform;
}

.card__translater {
  width: auto;
  position: relative;
  transform: translate3d(var(--tx), var(--ty), 0) scale(var(--s));
  -webkit-transform: translate3d(var(--tx), var(--ty), 0) scale(var(--s));
}

.card__rotator {
  transform: rotateY(var(--rx)) rotateX(var(--ry));
  transform-style: preserve-3d;
  box-shadow: 0px 10px 20px -5px black;
  border-radius: var(--radius);
  outline: none;
  transition: box-shadow 0.4s ease, outline 0.2s ease;
  appearance: none;
  border: none;
  background: top;
  padding: 0;

  &:focus {
    box-shadow: 0 0 10px 0px var(--glow), 0 0 10px 0px var(--glow),
      0 0 30px 0px var(--glow);
  }

  * {
    width: 100%;
    display: grid;
    grid-area: 1/1;
    border-radius: var(--radius);
    image-rendering: optimizeQuality;
    transform-style: preserve-3d;
  }

  img {
    outline: 1px solid transparent;
    aspect-ratio: 0.716;
    height: auto;
  }

  .card__back {
    background-color: var(--back);
    transform: rotateY(180deg) translateZ(1px);
    backface-visibility: visible;
  }

  .card__front {
    opacity: 1;
    transition: opacity 0.33s ease-out;
  }
}
</style>
