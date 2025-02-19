<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-caption">{{ callingModule }}</div>
          <div class="text-h6">{{ message }}</div>
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
const name = "WaitingOnBusTrafficDialog"

//
//
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  message: {type: String, required: true },
  callingModule: {type: String, default: "" }
})

//
//
const emit = defineEmits(['update:modelValue', 'WaitingOnBusTrafficDialog'])

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
    await waitOnBusTraffic()
  }
})

//
//
const waitOnBusTraffic = async () => {

  store.state.cbusTrafficTimeStamp = Date.now()
  while ((Date.now() - store.state.cbusTrafficTimeStamp) < 1000) {
    await sleep(100)
  }

  // signal it's complete
  emit('WaitingOnBusTrafficDialog', 'finished')
  model.value = false
}

</script>

<style scoped>

</style>
