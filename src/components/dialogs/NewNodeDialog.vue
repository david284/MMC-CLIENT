<template>

  <q-dialog v-model="model" persistent>
    <q-card style="min-width: 350px" class="bg-amber-2">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          New node detected
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card-section class="q-pa-md" color="orange-1">
        <div class="text-h6">
          Accept the first free node number below <br/> or enter a new one
        </div>
        <q-input type="number" style="max-width: 150px" :input-style="{ fontSize: '25px' }" dense v-model="newNodeNumber" autofocus />
        <div class="text-h6">
          This node was previously {{ props.previousNodeNumber }}
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="text-h6">
          Enter a name for this node (optional)
        </div>
        <q-input :input-style="{ fontSize: '25px' }" dense v-model="newNodeName" autofocus />
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
const newNodeName = ref("")
const newNodeNumber = ref(0)


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  previousNodeNumber:{ type: Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

watch(model, () => {
  console.log(name + `: WATCH model`)
  console.log(name + `: WATCH model: previousNodeNumber ` + props.previousNodeNumber)
  newNodeNumber.value = getNextFreeNodeNumber()
//  newNodeName.value = store.state.layout.nodeDetails[props.previousNodeNumber].name
})


const getNextFreeNodeNumber = () => {
  var freeNode = 0
  var baseNodeNumber = 256
  if (store.state.layout.layoutDetails.baseNodeNumber){
    baseNodeNumber = store.state.layout.layoutDetails.baseNodeNumber
  }
  var nodes = Object.keys(store.state.nodes)  // just get node numbers
  // loop through all node numbers starting at base, checking it it already exists
  for (var i = baseNodeNumber; i < 65535; i++){
    if (nodes.includes(i.toString())) {
      //console.log(name + " node number match: " + i)
      // found node, so not free
    } else {
      console.log(name + " first free node number: " + i)
      freeNode = i
      break
    }
  }
  return freeNode
}



onUpdated(() => {
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAccept = () => {
  console.log(name + " new node number: " + newNodeNumber.value)
  console.log(name + " new node name: " + newNodeName.value)
  store.methods.set_node_number(newNodeNumber.value)
  // setting name will trigger layoutdetails update & create entry if it doesn't exist
  store.setters.node_name(newNodeNumber.value, newNodeName.value)
}





</script>

<style scoped>

</style>
