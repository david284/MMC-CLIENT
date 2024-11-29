<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Node parameters are still loading</div>
          <div class="text-h6">Please wait</div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Close" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref, onUpdated} from "vue";
import {sleep} from "components/functions/utils.js"

const store = inject('store')
const name = "NodeParametersLoadingDialog"
let lastBusTrafficTime = Date.now()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'NodeParametersLoadingDialog'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, async () => {
//  console.log(name + `: WATCH model ` + model.value)
  if (model.value == true){await checkNodeParameters(props.nodeNumber)}
})


const checkNodeParameters = async (nodeNumber) => {
  // param9 - cpu type to check if parameters have been fully retrieved
  if(store.state.nodes[nodeNumber].parameters[9]){
    // parameters exist, so close dialog
    model.value = false
  } else {
    store.methods.request_all_node_parameters(nodeNumber, 20, 100)
    let startTime = Date.now()
    try {
      while (store.state.nodes[nodeNumber].parameters[9] == undefined){
        await sleep(100)  // give other processes plemty of time
        // if 20 seconds elapsed, then exit by thowing error
        if (Date.now() > startTime + 20000) {throw "********** failed to read Node Parameters: Max time elapsed"}
        // if no bus traffic for 2 seconds, then exit by thowing error
        if (Date.now() > lastBusTrafficTime + 2000) {throw "********** failed to read Node Parameters: lastBusTraffic timeout "}
      }
      model.value = false
    } catch (err){
      console.log(name + ": checkNodeParameters: " + err)
      model.value = false
    }
//    console.log(name + ": checkNodeParameters: count " + count)
  }
  // signal it's complete
  emit('NodeParametersLoadingDialog', 'finished normally')
}


store.eventBus.on('BUS_TRAFFIC_EVENT', (data) => {
  lastBusTrafficTime = Date.now()
})



onBeforeMount(() => {
})

onMounted(() => {
})

onUpdated(() =>{
//  console.log(name + ': onUpdated:')
})

</script>

<style scoped>

</style>
