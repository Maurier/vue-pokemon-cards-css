<template>
  <div class="showcase" @click="(active = null)">
    <card v-for="card of cards" @click.native.stop="(active = active === card ? null : card)" :key="card.id"
      :name="card.name" :img="card.images.large" :number="card.number" :supertype="card.supertype"
      :subtypes="card.subtypes" :rarity="card.rarity" :gallery="card.gallery" :active="(active === card)" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Card from '@/components/card.vue';

const cards = require('@/assets/data.json');

const transformedCards = cards.map((card) => {
  return {
    ...card,
    rarity: card.rarity.toLowerCase(),
    supertype: card.supertype.toLowerCase(),
    subtypes: Array.isArray(card.subtypes)
      ? card.subtypes.join(" ").toLowerCase()
      : card.subtypes.toLowerCase(),
    gallery: card.number.startsWith("TG")
  }
})

@Component({
  name: "app",
  components: {
    Card
  },
})
export default class App extends Vue {
  cards = transformedCards
  active = null
}
</script>

<style lang="scss" scoped>
.showcase {
  padding: 4rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 4rem;
}
</style>
