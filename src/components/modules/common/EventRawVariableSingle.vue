<template>
  <q-card class="q-pa-xs" flat style="width: 120px">
    <q-input
      class="bg-white"
      filled
      :label="label"
      mask="NNNN"
      debounce="100"
      v-model="displayVariable"
      outlined
      :error-message="error_message"
      :error="error"
      @change="update_variable">
    </q-input>
  </q-card>
</template>

<script setup>
import {inject, ref, onMounted, computed, watch} from "vue";
import {decToHex} from "components/functions/utils.js"
import * as EventFunctions from "components/functions/EventFunctions.js"
import {getLinkedEventVariables} from "components/modules/common/commonFunctions.js"

const name = "EventRawVariableSingle"

const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "eventIdentifier": {
    type: String,
    required: true
  },
  "eventIndex": {
    type: Number,
    required: true
  },
  "eventVariableIndex": {
    type: Number,
    required: true
  },
  "numberBase":{
    type: String,
    default: 'decimal'
  },
  configuration: {
    type: Object
  }
})

const label = "Variable " + props.eventVariableIndex
const store = inject('store')
const error = ref(false)
const error_message = ref('')
const displayVariable = ref()

//
//
const variableValue = computed(() => {
  return store.getters.event_variable_by_identifier(props.nodeNumber, props.eventIdentifier, props.eventVariableIndex)
})

//
//
watch(variableValue, () => {
  setDisplayVariable(variableValue.value)
//  console.log(name +': watch variableValue')
})

//
//
const numberBaseUpdated= computed(() =>{
    return props.numberBase
})

//
//
watch(numberBaseUpdated, () => {
//  console.log("numberBase " + props.numberBase)
  setDisplayVariable(variableValue.value)
})

//
//
const update_variable = (displayValue) => {
  try{
    let newValue = displayValue
    let processArray = displayValue.toUpperCase().split('X')
    if (processArray.length > 1){
      newValue = parseInt(processArray[1], 16)
    } else {
      newValue = parseInt(processArray[0])
    }
    if ((newValue < 0) || (newValue > 255) || (Number.isNaN(newValue))) {
      console.log(name + `: value error ${newValue}`)
      error.value = true
      error_message.value = 'Invalid Value'
    } else {
      error_message.value = ''
      error.value = false

      EventFunctions.eventTeach(
        store,
        props.nodeNumber,
        props.eventIdentifier,
        props.eventIndex,
        props.eventVariableIndex,
        newValue,
        true,
        getLinkedEventVariables(props.configuration)
        )

//      setDisplayVariable(variableValue.value)
    }
  } catch (err){
    console.log(name +': update_event : ' + err)
  }
}

//
//
const setDisplayVariable = (variable) =>{
  if (props.numberBase == 'decimal'){
    displayVariable.value = variable
  } else {
    displayVariable.value = '0x' + decToHex(variable, 2)
  }
  //console.log(`numberBase ${props.numberBase} ${displayVariable.value}` )
}

//
//
onMounted(() => {
  setDisplayVariable(variableValue.value)
//  console.log(name +': onMounted: eventValue ' + eventValue.value)
})

</script>

<style scoped>

</style>
