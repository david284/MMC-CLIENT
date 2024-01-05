<template>
  <div class="text-h6">
    <div class="row">
      <div class="col">Node number : {{ store.state.selected_node }}</div>
      <div class="col">{{ store.state.layout.nodeDetails[store.state.selected_node].name }}</div>
      <div class="col">Type : {{ store.state.nodes[store.state.selected_node].moduleName }}</div>
    </div>
  </div>
 
</template>

<script>
import {inject} from "vue";

export default {
  name: "NodeDetails",
  setup() {
    const store = inject('store')
    return {store}
  },
}
</script>

<style scoped>

</style>
