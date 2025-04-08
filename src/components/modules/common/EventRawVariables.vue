<template>
  <q-card flat class = "q-pa-none q-ma-none row justify-between">
    <q-card-section class="text-primary">
      <div class="text-h6">Raw view</div>     
    </q-card-section>
    <q-card-actions class="text-primary">
      <q-btn size="sm" color="blue" label="Toggle" @click="clickToggle()"/>
      &nbsp;&nbsp;
      <div class="text-h6"> display in {{ numberBase }} </div>
    </q-card-actions>
    <q-card-section>
      <div class="text-body">Enter value in decimal, or hexadecimal preceeded by '0x' (e.g. 0x55), irrespective of display format </div>
    </q-card-section>
  </q-card>

  <div class="q-pa-none row">
    <EventRawVariableSingle
      :eventVariableIndex="n"
      :nodeNumber="props.nodeNumber"
      :eventIdentifier = props.eventIdentifier
      v-for="n in store.state.nodes[props.nodeNumber].parameters[5]"
      :key="n"
      :numberBase=numberBase>
    </EventRawVariableSingle>
    <q-separator />
  </div>

</template>

<script setup>
import {computed, inject, onBeforeMount, onMounted, onUpdated, watch, ref} from "vue";
import EventRawVariableSingle from "components/modules/common/EventRawVariableSingle"

const store = inject('store')
const name = "EventRawVariables"
const numberBase = ref('decimal')

const props = defineProps({
  nodeNumber: {type: Number, default: 0 },
  eventIdentifier: {type: String, required: true }
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
