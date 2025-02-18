<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Event Variables are still loading</div>
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
const name = "SingleEventVariablesLoadingDialog"

//
//
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {
    type: Number,
    default: 0
  },
  eventIdentifier: {type: String, required: true }
})

//
//
const emit = defineEmits(['update:modelValue', 'EventVariablesLoadingDialog'])

//
//
const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

//
// model changes when Dialog opened & closed
watch(model, async () => {
  //console.log(name + `: WATCH model ` + model.value)
  if (model.value == true){
    //console.log(name + `: WATCH model ` + model.value)
    await ReadAllEventVariables()
  }
})

//
// This assumes the event indexes have already been refreshed
//
const ReadAllEventVariables = async () => {
  //console.log(name + `: ReadAllEventVariables: nodeNumber ${props.nodeNumber}`)

  try{
    store.methods.request_event_variables_by_identifier(props.nodeNumber, props.eventIdentifier)
    await sleep(100)
  } catch (err) {
    console.log(name + ": ReadAllEventVariables: " + err)
  }

  store.state.cbusTrafficTimeStamp = Date.now()
  while ((Date.now() - store.state.cbusTrafficTimeStamp) < 1000) {
    await sleep(100)
  }

  // signal it's complete
  emit('EventVariablesLoadingDialog', 'finished normally')
  //console.log(name + ": ReadAllEventVariables: finished")
  model.value = false
}

</script>

<style scoped>

</style>
