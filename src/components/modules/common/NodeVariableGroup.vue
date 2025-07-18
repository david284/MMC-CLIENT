<template>
  <div class="q-pa-xs no-margin">

    <div style="border:2px solid grey" class="q-py-none no-margin">
      <div class = "GroupTitle q-py-none no-margin"> {{ configuration.displayTitle }}</div>
      <q-card-section class="q-py-none no-margin text-body1">
        <b>{{ configuration.displaySubTitle }}</b>
      </q-card-section>
      <q-card-section class="q-py-none no-margin row">
        <NodeVariables
          :nodeNumber = nodeNumber
          :configuration = configuration.groupItems />
      </q-card-section>
    </div>

  </div>
</template>


<script setup>
  import {inject, onMounted, onUpdated, ref} from "vue";
  import NodeVariables from "components/modules/common/NodeVariables"

  const props = defineProps({
    nodeNumber: { type: Number, required: true },
    configuration: Object
  })

  const store = inject('store')
  const name = "NodeVariableGroup"
  const sourceName=ref("nvGroup")

  onMounted(() => {
//    console.log(name + ": onMounted")
  })

  onUpdated(() => {
//    console.log(name + `: onUpdated`)
  })

</script>


<style scoped>
.GroupTitle {
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
}
</style>
