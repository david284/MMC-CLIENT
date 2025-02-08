<template>
    <q-checkbox min-width="100"
                v-model = "checked"
                :label = label
                @click = "update_checked"
                right-label
    ></q-checkbox>
</template>

<script setup>
import {inject, ref, onMounted, computed, watch } from "vue";

const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "variableIndex": {
    type: Number,
    required: true
  },
  "bit": {
    type: Number,
    required: true
  },
  "label": {
    type: String,
    required: false
  }
})

//
// the label prop is optional, as a single bit doesn't use it
// but a bit array does
//

const name = "NodeVariableBit"
//console.log(name + `: ` + props.name)
//const label = props.name ? props.name : "Variable" + props.variableIndex
const store = inject('store')
const checked = ref(false)
const bitArray = {0: 1, 1: 2, 2: 4, 3: 8, 4: 16, 5: 32, 6: 64, 7: 128}

const variableValue = computed({
  get() {
    return store.state.nodes[props.nodeNumber].nodeVariables[props.variableIndex]
  },
  set(newValue) {
    store.methods.update_node_variable(props.nodeNumber, props.variableIndex, newValue)
  }
})

watch(variableValue, (newValue, oldValue) => {
  //console.log(newValue, oldValue)
  checked.value = store.state.nodes[props.nodeNumber].nodeVariables[props.variableIndex] & bitArray[props.bit] ? true : false
})

const update_checked = () => {
//  console.log('NodeVariableBit update_checked')
  let byteValue = variableValue.value
  if (checked.value) {
    byteValue = byteValue | bitArray[props.bit]										// set bit by 'or-ing' bit value
//    console.log(`bit ${bitArray[props.bit]} set, new byte value ${byteValue}`)
  } else {
    byteValue = byteValue & ~bitArray[props.bit]									// clear bit by 'and-ing' inverse bit value
//    console.log(`bit ${bitArray[props.bit]} cleared, new byte value ${byteValue}`)
  }
  //store.methods.update_node_variable(props.NodeNumber, props.VariableIndex, byteValue)
  store.methods.update_node_variable(props.nodeNumber, props.variableIndex, byteValue)

}

onMounted(() => {
  //console.log(`NodeVariableBit onMounted: `+store.state.nodes[props.NodeNumber].nodeVariables[props.VariableIndex])
  const checked_value = store.state.nodes[props.nodeNumber].nodeVariables[props.variableIndex] & bitArray[props.bit] ? true : false
  //this.checked.set( store.state.nodes[props.NodeNumber].nodeVariables[props.VariableIndex] & bitArray[props.Bit] ? true : false)
//  console.log(`NodeVariableBit onMounted: Checked`+checked_value)
  checked.value = checked_value
})

</script>

<style scoped>

</style>
