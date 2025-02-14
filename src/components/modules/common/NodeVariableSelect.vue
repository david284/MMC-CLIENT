<template>
  <q-card  class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}
        <q-card-section style ="min-width: 10px; height: 10px" class="no-margin no-padding float-right text-caption text-weight-thin">
          &nbsp; {{ nodeVariableIndex }}
        </q-card-section>
      </div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
    <q-select
      v-model="selectValue"
      :options="options"
      map-options
      @update:model-value="update_variable"
    >
    </q-select>
    </q-card-section>
  </q-card>
</template>

<script setup>
import {inject, ref, onMounted, computed, watch} from "vue";
import {getLinkedNodeVariables} from "components/modules/common/commonFunctions.js"

const name = "NodeVariableSelect"

const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "nodeVariableIndex": {
    type: Number,
    required: true
  },
  "bitMask": {
    type: Number,
    default: 255
  },
  "name": {
    type: String,
    required: false
  },
  "options": {
    required: true
  },
  "hint": {
    type: String,
    default: ""
  },
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
    type: String,
    required: false
  },
  "configuration": {
    type: Object
  }
})

const label = props.name ? props.name : "Variable" + props.nodeVariableIndex
const store = inject('store')
const selectValue = ref()

const nodeVariable = computed(() =>{
  return store.state.nodes[props.nodeNumber].nodeVariables[props.nodeVariableIndex]
})

watch(nodeVariable, () => {
  selectValue.value = nodeVariable.value & props.bitMask
  //console.log(name + `: watch variableValue ` + selectValue.value + ' bitMask ' + props.bitMask)
})

const update_variable = (newValue) => {
  //console.log(`NodeVariableSelect update_variable ${newValue.value}`)

  // get previous value
  let byteValue = nodeVariable.value
  //set bits, but only if they match bits in the bitmask
  byteValue = byteValue | (newValue.value & props.bitMask)							// set bit by 'or-ing' bit value
  // clear bits, but only if they match bits in the bitmask
  byteValue = byteValue & (newValue.value | ~props.bitMask)							// clear bit by 'and-ing' inverse bit value

  //console.log(`NodeVariableSelect: byteValue ${byteValue}`);
  
  store.methods.update_node_variable(
    props.nodeNumber, 
    props.nodeVariableIndex, 
    byteValue, 
    true,
    getLinkedNodeVariables(props.configuration)
  )

//  store.methods.update_node_variable(props.nodeNumber, props.nodeVariableIndex, byteValue)
}


onMounted(() => {
//  console.log(`NodeVariableSelect: onMounted`)
  selectValue.value = nodeVariable.value & props.bitMask
//  console.log(`NodeVariableSelect: props: ${JSON.stringify(props)}`)
})


</script>

<style scoped>

</style>
