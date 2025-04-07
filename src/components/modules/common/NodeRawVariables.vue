<template>
  <q-card-section q-pa-none q-ma-none>
    <q-card-actions class="text-primary">
      <q-btn size="sm" color="blue" label="Toggle" @click="clickToggle()"/>
      &nbsp;&nbsp;
      <div class="text-h6"> display in {{ numberBase }} </div>
    </q-card-actions>
    <div class="text-h6">Enter value in decimal, or hexadecimal preceeded by '0x' (e.g. 0x55), irrespective of display format </div>
  </q-card-section>

  <div class="q-pa-none row">
    <NodeRawVariableSingle :node-variable-index="n"
      :node-number=props.nodeNumber
      v-for="n in store.state.nodes[props.nodeNumber].parameters[6]"
      :key="n"
      :numberBase=numberBase>
    </NodeRawVariableSingle>
  </div>

</template>

<script setup>
import {computed, inject, onBeforeMount, onMounted, onUpdated, watch, ref} from "vue";
import NodeRawVariableSingle from "components/modules/common/NodeRawVariableSingle"

const store = inject('store')
const name = "NodeRawVariables"
const numberBase = ref('decimal')

const props = defineProps({
  nodeNumber: {type: Number, default: 0 }
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickToggle = () => {
  console.log(name + `: clickToggle`)
  numberBase.value = (numberBase.value == 'decimal') ? (numberBase.value = 'hex') : (numberBase.value = 'decimal')
}


</script>

<style scoped>

</style>
