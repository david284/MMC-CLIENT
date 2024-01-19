<template>

  <q-dialog v-model='model' persistent full-width> 
    <q-card class="q-pa-sm">
      <q-card-section>
        <div class="text-h6">Event Variables for event : {{ store.getters.event_name(props.eventIdentifier) }}</div>
      </q-card-section>


      <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>


</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";

import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";


const store = inject('store')
const eventVariables = ref()


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number, required: true },
  eventIndex: {type: Number, required: true },
  eventIdentifier: {type: String, required: true }
})


const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(props.nodeNumber, () => {
  console.log('NodeVariableDialog - watch nodeNumber')
})

const isVisible = (item) =>{
      var result = true
      if (item.visibilityLogic) {
        result = parseLogicElement(item.visibilityLogic, store)
      }
      console.log(`isVisible: ` + result + ' ' + item.type)
      return result
    }


onBeforeMount(() => {
})

onMounted(() => {
})


onUpdated(() => {
  console.log('EventVariablesDialog onUpdated')
  if (props.nodeNumber){
    console.log('NodeVariableDialog onUpdated - nodeNumber ' + props.nodeNumber)
    
    if (store.state.nodeDescriptors[props.nodeNumber] != undefined){
      eventVariables.value = store.state.nodeDescriptors[props.nodeNumber].eventVariables
    }
    store.methods.request_all_event_variables(
      props.nodeNumber,
      props.eventIndex,
      100,
      store.state.nodes[props.nodeNumber].parameters[5]
    )
  }
})



</script>

<style scoped>

</style>
