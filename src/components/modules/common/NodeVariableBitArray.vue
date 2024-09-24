<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <div v-for="item in newBitCollection" :key="item">
        <node-variable-bit
          :nodeNumber = nodeNumber
          :variableIndex = variableIndex
          :bit = item.bitPosition
          :name = item.label
        ></node-variable-bit>
      </div>
    </q-card-section>

  </q-card>
</template>

<script setup>
import NodeVariableBit from "components/modules/common/NodeVariableBit"
import {overloadedLabel} from "components/modules/common/CommonLogicParsers.js";

import { inject, onMounted, ref, computed, watch } from "vue";
const name = "NodeVariableBitArray"
const store = inject('store')
var items = ref();
var newBitCollection = ref()



const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "variableIndex": {
    type: Number,
    required: true
  },
  "bitCollection": {
    required: true
  },
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
    type: String,
    default: ""
  }
})

const variables = computed(() =>{
  return store.state.nodes[props.nodeNumber].nodeVariables
})

watch(variables, () => {
  refeshArray();
})


onMounted(() => {
//  console.log(name + `: onMounted`)
  refeshArray();
})

function refeshArray() {
  newBitCollection.value = []
  for (var i in props.bitCollection){
    if (props.bitCollection[i].overload){
      var label = overloadedLabel(props.nodeNumber, props.bitCollection[i].overload, store) 
      if (label) {
        var entry = {"bitPosition": props.bitCollection[i].bitPosition, "label": label}
        newBitCollection.value.push(entry)
      }
    } else 
    if (props.bitCollection[i].label){
      newBitCollection.value.push(props.bitCollection[i])
    }
  }
}



</script>

<style scoped>

</style>
