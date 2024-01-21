<template>
<div>
  <component v-bind:is="display_component"></component>
</div>
</template>

<script>
import {inject, onBeforeMount} from "vue";

import mergDefault2 from "components/modules/default2/default2.vue"

export default {
  name: "node",
  components:{mergDefault2},
  setup() {
    const store = inject('store')
    const display_component = store.state.nodes[store.state.selected_node].component
    return {
      store, mergDefault2, display_component
    }
  }
}
</script>

<style scoped>

</style>
