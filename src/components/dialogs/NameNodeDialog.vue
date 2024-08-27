<template>

  <q-dialog v-model="model" persistent>
    <q-card style="min-width: 350px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Edit name for node :  {{ nodeNumber }}
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>


      <q-card-section class="q-pt-none">
          <q-input dense v-model="newNodeName" autofocus />
        </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Accept" v-close-popup @click="clickAccept()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";

const store = inject('store')

const newNodeName = ref()

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
  if (store.state.layout.nodeDetails[props.nodeNumber]) {
    newNodeName.value = store.state.layout.nodeDetails[props.nodeNumber].name
  }
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAccept = () => {
  console.log("new node name: " + newNodeName.value)
  store.setters.node_name(props.nodeNumber, newNodeName.value)
}





</script>

<style scoped>

</style>
