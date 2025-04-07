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

const name = "NoderawVariableSingle"

const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "nodeVariableIndex": {
    type: Number,
    required: true
  },
  "numberBase":{
    type: String,
    default: 'decimal'
  }
})

const label = "Variable " + props.nodeVariableIndex
const store = inject('store')
const error = ref(false)
const error_message = ref('')
const displayVariable = ref()

const variableValue = computed(() =>{
    return store.state.nodes[props.nodeNumber].nodeVariables[props.nodeVariableIndex]
})

watch(variableValue, () => {
  setDisplayVariable(variableValue.value)
})

const numberBaseUpdated= computed(() =>{
    return props.numberBase
})

watch(numberBaseUpdated, () => {
//  console.log("numberBase " + props.numberBase)
  setDisplayVariable(variableValue.value)
})

const update_variable = (displayValue) => {
  let newValue = displayValue
  let processArray = displayValue.toUpperCase().split('X')
    if (processArray.length > 1){
      newValue = parseInt(processArray[1], 16)
    } else {
      newValue = parseInt(processArray[0])
    }
  if (newValue < 0 || newValue > 255 ||newValue =='') {
    error.value = true
    error_message.value = 'Invalid Value'
  } else {
    error.value = false
    error_message.value = ''
    store.methods.update_node_variable(props.nodeNumber, props.nodeVariableIndex, newValue)
    setDisplayVariable(newValue)
  }
}

const setDisplayVariable = (variable) =>{
  if (props.numberBase == 'decimal'){
    displayVariable.value = variable
  } else {
    displayVariable.value = '0x' + decToHex(variable, 2)
  }
  //console.log(`numberBase ${props.numberBase} ${displayVariable.value}` )
}

onMounted(() => {
  setDisplayVariable(variableValue.value)
})


</script>

<style scoped>

</style>
