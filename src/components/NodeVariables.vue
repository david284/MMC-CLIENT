<template>
  <div>
    <node-details></node-details>
  </div>
</template>

<script>
import {inject, ref} from "vue";
import NodeDetails from "components/modules/common/NodeDetails"

export default {
  components: {NodeDetails},
  setup() {
    const store = inject('store')
 
    return {
      tab: ref('info'),
      store
    }
  }
}
</script>

<style scoped>

</style>
