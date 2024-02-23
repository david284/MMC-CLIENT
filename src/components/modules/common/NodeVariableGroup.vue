<template>
  <div style="border:2px solid grey" class="q-pa-xs">
    <div class = "GroupTitle q-py-none"> {{ configuration.displayTitle }}</div>

    <NodeVariables
            :configuration = configuration.groupItems>
    </NodeVariables>

  </div>
</template>


<script setup>
  import {inject, onMounted, onUpdated} from "vue";
  import NodeVariables from "components/modules/common/NodeVariables"

  const props = defineProps({
    configuration: Object
  })

  const store = inject('store')
  const name = "NodeVariableGroup"

  onMounted(() => {
    console.log(name + ": onMounted")
  })

  onUpdated(() => {
    console.log(name + `: onUpdated`)
  })

</script>


<style scoped>
.GroupTitle {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}
</style>
