<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}
        <q-card-section style ="min-width: 10px; height: 10px" class="no-margin no-padding float-right text-caption">
            {{ NodeVariableIndexHigh }} : {{ NodeVariableIndexLow }}
        </q-card-section>
      </div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-input
        mask="#####"
        debounce="1000"
        v-model="variable"
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
import {getLinkedNodeVariables} from "components/modules/common/commonFunctions.js"

const name = 'NodeVariableDual'

const props = defineProps({
  "NodeNumber": {
    type: Number,
    required: true
  },
  "NodeVariableIndexHigh": {
    type: Number,
    required: true
  },
  "NodeVariableIndexLow": {
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
  "max": {
    type: Number,
    default: 65025
  },
  "min": {
    type: Number,
    default: 0
  },
  "configuration": {
    type: Object,
    required: true
  }
})

const store = inject('store')
const error = ref(false)
const error_message = ref('')
const variable = ref()

const variableValue = computed(() =>{
    return (store.state.nodes[props.NodeNumber].nodeVariables[props.NodeVariableIndexHigh] << 8)
      + store.state.nodes[props.NodeNumber].nodeVariables[props.NodeVariableIndexLow]
})

watch(variableValue, () => {
  variable.value = variableValue.value
})

const update_variable = (newValue) => {
  if (newValue < props.min || newValue > props.max) {
    console.log(`Invalid Value : ${newValue}`)
    error.value = true
    error_message.value = 'Invalid Value'
  } else {
    //console.log(`Value Ok : ${newValue}`)
    error.value = false
    error_message.value = ''
    store.methods.update_node_variable(
      props.NodeNumber, 
      props.NodeVariableIndexHigh, 
      newValue >> 8,
      true,
      getLinkedNodeVariables(props.configuration)
    )
    store.methods.update_node_variable(
      props.NodeNumber, 
      props.NodeVariableIndexLow, 
      newValue & 0xFF,
      true,
      getLinkedNodeVariables(props.configuration)
    )
  }
}

onMounted(() => {

  variable.value = (store.state.nodes[props.NodeNumber].nodeVariables[props.NodeVariableIndexHigh] << 8)
    + store.state.nodes[props.NodeNumber].nodeVariables[props.NodeVariableIndexLow]
  //console.log(`NodeVariableDual ${variable.value}`)
})


</script>

<style scoped>

</style>
