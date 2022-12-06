<template>
  <div class="showcase" @click="active = null">
    <div v-for="(slice, index) of slices" :key="index">
      <div class="slice">
        <card
          v-for="card of slice"
          @click.native.stop="active = active === card ? null : card"
          :key="card.id"
          :name="card.name"
          :img="card.images.large"
          :number="card.number"
          :supertype="card.supertype"
          :subtypes="card.subtypes"
          :rarity="card.rarity"
          :gallery="card.gallery"
          :active="active === card"
        />
      </div>
      <hr />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Card from "@/components/card.vue";

let cards = require("@/assets/data.json");

cards = cards.map((card) => {
  return {
    ...card,
    rarity: card.rarity.toLowerCase(),
    supertype: card.supertype.toLowerCase(),
    subtypes: Array.isArray(card.subtypes)
      ? card.subtypes.join(" ").toLowerCase()
      : card.subtypes.toLowerCase(),
    gallery: card.number.startsWith("TG"),
  };
});

@Component({
  name: "app",
  components: {
    Card,
  },
})
export default class App extends Vue {
  active = null;
  slices = [
    // basics
    cards.slice(0, 6),
    // holos
    cards.slice(6, 12),
    // galaxies
    cards.slice(12, 15),
    // radiant
    cards.slice(15, 18),
    // basicGallery
    cards.slice(60, 63),
    // vee
    cards.slice(18, 21),
    // veeUltra
    cards.slice(21, 24),
    // veeAlt
    [...cards.slice(27, 30), ...cards.slice(33, 36)],
    // veeMax
    cards.slice(24, 27),
    // veeMaxAlt
    [cards[36], cards[31], cards[37]],
    // veeStar
    cards.slice(39, 42),
    // trainerHolo
    cards.slice(42, 48),
    // rainbow
    cards.slice(48, 51),
    // gold
    cards.slice(51, 60),
    // veeGallery
    cards.slice(63, 69),
  ];
}
</script>

<style lang="scss" scoped>
.showcase {
  padding: 4rem;
}

.slice {
  margin-bottom: 4rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 4rem;
}

hr {
  opacity: 0.35;
  border-bottom: 1px solid #000;
  margin-bottom: 3rem;
}
</style>
