<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-input
        mask="###"
        debounce="1000"
        v-model="displayValue"
        outlined
        :max="max"
        :min="min"
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
  "max": {
    type: Number,
    default: 255
  },
  "min": {
    type: Number,
    default: 0
  },
  "hint": {
    type: String,
    default: ""
  },
  "learn": {
    type: Boolean,
    default: false
  }
})

const label = props.name ? props.name : "Variable" + props.nodeVariableIndex
const store = inject('store')
const error = ref(false)
const error_message = ref('')

const variableValue = computed(() =>{
    return store.state.nodes[props.nodeNumber].nodeVariables[props.nodeVariableIndex]
})

const update_variable = (newValue) => {
  newValue = newValue - props.displayOffset
  if (newValue < props.min || newValue > props.max) {
    //console.log(`Invalid Value : ${newValue}`)
    error.value = true
    error_message.value = 'Invalid Value'
  } else {
    //console.log(`Value Ok : ${newValue}`)
    error.value = false
    error_message.value = ''
    store.methods.update_node_variable(props.nodeNumber, props.nodeVariableIndex, newValue)
  }
}

const displayValue = computed(() =>{
  var value = variableValue.value + props.displayOffset
  return value
})


onMounted(() => {
  //console.log(`NodeVariable`)
})


</script>

<style scoped>

</style>
