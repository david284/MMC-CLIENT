<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Event Variables are still loading</div>
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
const name = "EventVariablesLoadingDialog"
const variableCount = ref(0)

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
    await ReadAllEventVariables(props.nodeNumber)
  }
})



const ReadAllEventVariables = async (nodeNumber) => {
  console.log(name + ": ReadAllEventVariables: " + nodeNumber)
  // signal it's complete
  await sleep(1000)
  emit('EventVariablesLoadingDialog', 'finished normally')
}


onBeforeMount(() => {
})

onMounted(() => {
})

</script>

<style scoped>

</style>
