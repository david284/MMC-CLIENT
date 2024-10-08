<template>
  <q-card class="q-pa-xs" flat style="max-width: 300px">

<q-input 
  filled
  :label = label
  v-model="variable" 
  outlined
  disable 
  readonly />

</q-card>
</template>

<script setup>
import {computed, inject, watch, ref} from "vue";
const name = "NodeParameterRaw"
const store = inject('store')

// note use of array, not object so the type isn't defined
// this is so it can handle a mix of text & numbers
const props = defineProps([
  "nodeNumber",
  "parameterIndex"
])


const label  = computed(() =>{
    return store.getters.node_parameter_name(props.nodeNumber, props.parameterIndex)
})

const variable = computed(() =>{
  return store.getters.node_parameter_value(props.nodeNumber, props.parameterIndex)
})






</script>
