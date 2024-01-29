<template>

  <q-dialog v-model="model" persistent>
    <q-card style="min-width: 350px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          New node
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card-section class="q-pt-none">
        <div class="text-h6">
          New node number
        </div>
        <q-input dense v-model="newNodeNumber" autofocus />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-h6">
          (optional) name for this node
        </div>
        <q-input dense v-model="newNodeName" autofocus />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Accept" v-close-popup @click="clickAccept()"/>
        <q-btn flat label="Cancel" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";

const store = inject('store')
const name = "NewNodeDialog"
const newNodeName = ref()
const newNodeNumber = ref()


const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(model, () => {
  console.log(name + `: WATCH model`)
  newNodeNumber.value = store.state.layout.layoutDetails.nextNodeId
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
