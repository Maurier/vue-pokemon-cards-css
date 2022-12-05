<template>
  <div class="card__shine" :class="classes"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  name: "card-shine",
  components: {
  },
})
export default class CardShine extends Vue {
  @Prop() subtypes!: string[]
  @Prop() supertype!: string

  get classes() {
    return `${ this.supertype } ${ this.subtypes }`
  }
}
</script>

<style lang="scss" scoped>
.card__shine {
  display: grid;
  overflow: hidden;
  z-index: 3;
  transform: translateZ(1px);
  background: transparent;
  mix-blend-mode: color-dodge;
  filter: brightness(.85) contrast(2.75) saturate(.65);
  background-size: cover;
  background-position: center;
  opacity: var(--o);

  &:before {
    grid-area: 1/1;
    transform: translateZ(1px);
  }

  &:after {
    grid-area: 1/1;
    transform: translateZ(1.2px);
    border-radius: var(--radius);
  }
}
</style>
