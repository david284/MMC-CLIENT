<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 150px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-badge color="secondary">
        range {{ minValue }} to {{ maxValue }} {{ displayUnits }}
      </q-badge>
      <q-input
        :mask="displayMask"
        debounce="1000"
        v-model="displayValue"
        outlined
        :error-message="error_message"
        :error="error"
        @change="update_variable"
      >
      </q-input>
    </q-card-section>
  </q-card>
</template>

<script setup>
import {inject, ref, onMounted, computed, watch} from "vue";
import {setByteVariable} from "components/modules/common/commonFunctions.js"
import {getDisplayValue} from "components/modules/common/commonFunctions.js"


const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "nodeVariableIndex": {
    type: Number,
    required: true
  },
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
    type: String,
    required: false
  },
  "displayOffset": {
    type: Number,
    required: false,
    default: 0
  },
  "displayScaling": {
    type: Number,
    required: false,
    default: 1
  },
  "displayUnits": {
    type: String,
    default: ""
  },
  "max": {
    type: Number,
    default: 255
  },
  "min": {
    type: Number,
    default: 0
  },
  "startBit":{
    type: Number,
    default: 0
  },
  "endBit":{
    type: Number,
    default: 7
  }
})

const store = inject('store')
const error = ref(false)
const error_message = ref('')
const displayValue = ref()

const displayMask = computed(() => {
  let MaxValue = 255* props.displayScaling + props.displayOffset
  if(MaxValue > 100000) {
    return '######'
  } 
  if(MaxValue > 10000) {
    return '#####'
  } 
  else if (MaxValue > 1000) {
    return '####'
  }
  else {
    return '###'
  }
 })

 const minValue = computed(() => {
  return (props.min * props.displayScaling) + props.displayOffset
 })

 const maxValue = computed(() => {
  return (props.max * props.displayScaling) + props.displayOffset
 })



const variableValue = computed(() =>{
    return store.state.nodes[props.nodeNumber].nodeVariables[props.nodeVariableIndex]
})


watch(variableValue, () => {
  displayValue.value =   displayValue.value = getDisplayValue(variableValue.value, 
    props.displayScaling, 
    props.displayOffset, 
    props.startBit, 
    props.endBit)
})


const update_variable = (newValue) => {
  // get previous value, as starting point for updated byte value
  let byteValue = variableValue.value
  let processedValue = Number(newValue)            // take a copy to change

  // max & min are the max & min of the values in the byte variable value
  // so need to scale up to check the display value actually used
//  let minValue = (props.min * props.displayScaling) + props.displayOffset
//  let maxValue = (props.max * props.displayScaling) + props.displayOffset
  if (processedValue < minValue.value){
    error.value = true
    error_message.value = 'Value less than ' + minValue.value
  }
  else if (processedValue > maxValue.value) {
    error.value = true
    error_message.value = 'Value more than ' + maxValue.value
  } 
  else {
    byteValue = setByteVariable(byteValue, processedValue, props.displayScaling, props.displayOffset, props.startBit, props.endBit)
    error.value = false
    error_message.value = ''
    store.methods.update_node_variable(props.nodeNumber, props.nodeVariableIndex, byteValue)
  }
}


onMounted(() => {
  //console.log(name + `: onMounted`)
  displayValue.value = getDisplayValue(variableValue.value, 
    props.displayScaling, 
    props.displayOffset, 
    props.startBit, 
    props.endBit)
})


</script>

<style scoped>

</style>
