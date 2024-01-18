<template>

<q-dialog v-model="model" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h4">Edit node name</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
            <q-input dense v-model="newNodeName" autofocus />
          </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Accept" v-close-popup @click="clickAccept()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

</template>


<script setup>

/************************************************************************************
      usage
      <DialogExampleCompositionAPI v-model='showAddEventDialog' />
      
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { stringifyQuery } from "vue-router";

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


const clickAccept = () => {
  console.log("new node name: " + newNodeName.value)
  store.setters.node_name(props.nodeNumber, newNodeName.value)
}


onUpdated(() => {
  console.log("NameNodeDialog onUpdated")
  if (store.state.layout.nodeDetails[props.nodeNumber]) {
    newNodeName.value = store.state.layout.nodeDetails[props.nodeNumber].name
  }
})




</script>

<style scoped>

</style>
