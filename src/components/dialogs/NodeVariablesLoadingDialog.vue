<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Node Variables are still loading</div>
          <div class="text-h6">Please wait</div>
        </q-card-section>
        <q-card-section class="text-h6" align="center">
          Variable count: {{ variableCount }}
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
const variableCount = ref(0)

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
  if (model.value == true){await checkNodeVariables(props.nodeNumber)}
})


const checkNodeVariables = async (nodeNumber) => {
  var maxNodeVariableIndex = store.state.nodes[nodeNumber].parameters[6]
  //console.log(name + ": checkNodeParameters: start: maxNodeVariableIndex value  " + store.state.nodes[nodeNumber].nodeVariables[maxNodeVariableIndex])
  if(store.state.nodes[nodeNumber].nodeVariables[maxNodeVariableIndex] != undefined){
    //console.log(name + ": checkNodeParameters: already read")
  } else {
    store.methods.request_all_node_variables(
      nodeNumber,
      store.state.nodes[nodeNumber].parameters[6],
      100,
      1
    )
    // set a count down based on number of node variables
    // but add minimum offset
    var countDown = (maxNodeVariableIndex * 20) + 20
    try {
      while (store.state.nodes[nodeNumber].nodeVariables[maxNodeVariableIndex] == undefined){
        variableCount.value = Object.keys(store.state.nodes[nodeNumber].nodeVariables).length
        await sleep(1)
        countDown--
        // 
        if (countDown <0 ) {throw "********** failed to read Node Variables"}
      }
      model.value = false
    } catch (err){
      console.log(name + ": checkNodeParameters: " + err)
      model.value = false
    }
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
