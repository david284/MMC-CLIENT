<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Event Variables are still loading</div>
          <div class="text-h6">Please wait</div>
        </q-card-section>
        <q-card-section class="text-h6" align="center">
          <div>elapsed time: {{ timeSpan }}</div>
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
import {secondsNow} from "components/functions/utils.js"

const store = inject('store')
const name = "EventVariablesLoadingDialog"
const variableCount = ref(0)
const timeSpan = ref(0)
const cbusTrafficTime = ref(0)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'EventVariablesLoadingDialog'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, async () => {
  //console.log(name + `: WATCH model ` + model.value)
  if (model.value == true){
    //console.log(name + `: WATCH model ` + model.value)
    timeSpan.value = 0
    await ReadAllEventVariables(props.nodeNumber)
  }
})



const ReadAllEventVariables = async (nodeNumber) => {
  console.log(name + ": ReadAllEventVariables: " + nodeNumber)
  var count = 0
  try{
    // do stored events for this node first.....
    var storedEventsNI = Object.values(store.state.nodes[props.nodeNumber].storedEventsNI)
    storedEventsNI.forEach(event => {
      let eventIdentifier = event.eventIdentifier
      console.log(name + ": ReadAllEventVariables: event " + eventIdentifier)
      store.methods.request_event_variables_by_identifier(nodeNumber, eventIdentifier)
    }) 
  } catch (err) {
    console.log(name + ": ReadAllEventVariables: " + err)
  }

  let startTime = Date.now()

  await sleep(1000)

  while ((Date.now() - store.state.cbusTrafficTimeStamp) < 2000) {
    timeSpan.value = ((Date.now() - startTime) / 1000).toFixed(1) 
    await sleep(100)
  }

  // signal it's complete
  emit('EventVariablesLoadingDialog', 'finished normally')
  console.log(name + ": ReadAllEventVariables: finished")

}


onBeforeMount(() => {
})

onMounted(() => {
})

</script>

<style scoped>

</style>
