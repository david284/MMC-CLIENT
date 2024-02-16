<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <q-input
        mask="###"
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
const variable = ref()

const variableValue = computed(() =>{
    return store.state.nodes[props.nodeNumber].nodeVariables[props.nodeVariableIndex]
})

watch(variableValue, () => {
  variable.value = variableValue.value
})

const update_variable = (newValue) => {
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

onMounted(() => {
  //console.log(`NodeVariable`)
  variable.value = variableValue.value
})


</script>

<style scoped>

</style>
