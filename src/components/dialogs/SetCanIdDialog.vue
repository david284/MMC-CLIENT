<template>

  <q-dialog v-model="model" persistent>
    <q-card style="min-width: 350px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Set CAN ID for node :  {{ nodeNumber }}
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

<!--         
      <q-card-section class="q-pt-none">
          <q-input dense v-model="newNodeName" autofocus />
        </q-card-section>

 -->
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Accept" v-close-popup @click="clickAccept()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";

const store = inject('store')
const name = 'SetCanIdDialog'

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

const clickAccept = () => {
  console.log(name + ": clickAccept")
//  store.methods.set_can_id(1,2)
}





</script>

<style scoped>

</style>
