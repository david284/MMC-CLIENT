<template>
  <q-card class="q-ma-xs no-padding">
    <q-card-section style="height: 120px" class="no-margin q-py-none">
      <div class="text-h6">{{ displayTitle }}</div>
      <div class="text-subtitle2">{{ displaySubTitle }}</div>
      <node-variable-bit
        :nodeNumber = nodeNumber
        :variableIndex = variableIndex
        :bit = bit
        :learn = learn
        :name = name
      >
      </node-variable-bit>
    </q-card-section>

  </q-card>
</template>

<script setup>
import NodeVariableBit from "components/modules/common/NodeVariableBit"

import {inject} from "vue";
import {onMounted} from "vue";

const store = inject('store')
const name = "NodeVariableBitsingle"

const props = defineProps({
  "nodeNumber": {
    type: Number,
    required: true
  },
  "variableIndex": {
    type: Number,
    required: true
  },
  "displayTitle": {
    type: String,
    required: false
  },
  "displaySubTitle": {
    type: String,
    default: ""
  },
  "bit": {
    type: Number,
    required: true
  },
  "name": {
    type: String,
    required: false
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

onMounted(() => {
//  console.log(name + `: onMounted`)
})
</script>

<style scoped>

</style>
