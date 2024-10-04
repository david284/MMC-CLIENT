<template>

  <q-dialog v-model="model" persistent>
    <q-card style="min-width: 400px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Set CAN ID for node :  {{ store.getters.node_name(nodeNumber) }}
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card-section class="q-pt-none">
        <div>
          Current CAN ID: {{ store.getters.node_can_id(nodeNumber) }}
        </div>
        </q-card-section>

      <div class="q-pa-md">
      Enter new CAN ID, 1 to 99
        <q-input
          autofocus
          v-model.number="newCANID"
          type="number"
          style="max-width: 200px"
        />
      </div>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Accept" v-close-popup @click="clickAccept()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import {sleep} from "components/functions/utils.js"

const store = inject('store')
const name = 'SetCanIdDialog'
const newCANID = ref()

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: { type:Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })


onUpdated(() => {
//  console.log("NameNodeDialog onUpdated")
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAccept = async () => {
  if (newCANID.value){
    console.log(name + ": clickAccept: node " + props.nodeNumber + ' CAN_ID ' + newCANID.value)
    store.methods.set_can_id( props.nodeNumber, newCANID.value)
    await sleep(100)
    store.methods.query_all_nodes() // not all modules issue a response to CANID
  }
  newCANID.value = undefined
}





</script>

<style scoped>

</style>
