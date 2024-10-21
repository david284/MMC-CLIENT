<template>

  <q-dialog v-model='model' persistent>
    <q-card  class="q-pa-none q-ma-none" style="min-width: 850px">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin g-py-none">
          <div class="text-h6">
            Nodes linked to event:  {{ store.getters.event_name(props.eventIdentifier) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>



      <q-card>
        <GenericNodeList
          :nodeNumberList=linkedNodeNumbers
          :eventIdentifier = eventIdentifier
        />
      </q-card>
      
    </q-card>
  </q-dialog>


</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import {sleep} from "components/functions/utils.js"
import GenericNodeList from "components/modules/common/GenericNodeList"

const store = inject('store')
const name = 'LinkedNodesDialog'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  eventIdentifier: {type: String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

// model changes when Dialog opened & closed
watch(model, () => {
//  console.log(name + `: WATCH model`)
})

const linkedNodeNumbers = ref([])

const nodesDetails = computed(() => {
  console.log(name + `: nodesDetails`)
  return store.state.nodes
})

watch(nodesDetails, () => {
  console.log(name + `: WATCH Nodes`)
  update_nodes_table()
})

const nodeList = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.nodes)
})

watch(nodeList, () => {
  //console.log(`WATCH Nodes`)
  update_nodes_table()
})

const update_nodes_table = async () => {
//  console.log(name + `: update__nodes_table`)
  linkedNodeNumbers.value = []
  nodeList.value.forEach(node => {
    if (Object.values(node.storedEventsNI).length > 0) {
      let events = Object.values(node.storedEventsNI)
      events.forEach(async event => {
        if (event.eventIdentifier == props.eventIdentifier) {
          linkedNodeNumbers.value.push(node.nodeNumber)
        }
      })
    }
  })
}


onBeforeMount(() => {
})

onMounted(() => {
})

onUpdated(() => {
//  console.log("EventTeachDialog onUpdated")
  if (props.eventIdentifier){
    update_nodes_table()
  }
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/



</script>

<style scoped>

</style>
