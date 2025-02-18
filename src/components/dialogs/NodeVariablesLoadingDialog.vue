<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Node Variables are still loading</div>
          <div class="text-h6">Please wait</div>
        </q-card-section>
        <q-card-section class="text-h6" align="center">
          <q-spinner-orbit color="primary" size="2em"/>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Close" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import {sleep} from "components/functions/utils.js"

const store = inject('store')
const name = "NodeVariablesLoadingDialog"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'NodeVariablesLoadingDialog'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, async () => {
//  console.log(name + `: WATCH model ` + model.value)
  if (model.value == true){
    console.log(name + ": ReadNodeVariables: " + props.nodeNumber)
    await loadNodeVariables(props.nodeNumber)
  }
})


const loadNodeVariables = async (nodeNumber) => {
  var maxNodeVariableIndex = store.state.nodes[nodeNumber].parameters[6]
  store.methods.request_all_node_variables(
    nodeNumber,
    store.state.nodes[nodeNumber].parameters[6]
  )
  // set a count down based on number of node variables
  // but add minimum offset
  var countDown = (maxNodeVariableIndex * 2) + 200
  store.state.cbusTrafficTimeStamp = Date.now()   // start from now
  try {
    while ((Date.now() - store.state.cbusTrafficTimeStamp) < 500) {
      await sleep(10)
      countDown--
      // 
      if (countDown <0 ) {throw "********** failed to read Node Variables"}
    }
    model.value = false
  } catch (err){
    console.log(name + ": checkNodeParameters: " + err)
    model.value = false
  }
  // signal it's complete
  emit('NodeVariablesLoadingDialog', 'finished normally')
}


onBeforeMount(() => {
})

onMounted(() => {
})

</script>

<style scoped>

</style>
