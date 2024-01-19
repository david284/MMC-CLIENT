<template>

  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Event Teach</div>
      </q-card-section>

      <div class="q-pa-md row items-start q-gutter-md">
         
        <q-card class="q-pa-xs" style="max-width: 300px">
          <q-card-section class="q-pa-xs">
            <div class="text-h6">Teach Event</div>
            <div class="text-subtitle2">To consumer nodes only</div>
            <q-select
              v-model="newNode"
              :options="availableNodes">
            </q-select>
            <div class="q-pa-xs q-gutter-sm">
              <q-btn color="negative"
                  label="Teach"
                  @click="clickTeachEvent()"
                  no-caps/>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="q-pa-xs" style="max-width: 300px">
          <q-card-section class="q-pa-xs">
            <div class="text-h6">Taught Events</div>
            <div class="text-subtitle2">Nodes using this event</div>
            <q-table
              flat bordered
              dense
              :rows="teRows"
              :columns="teColumns"
              row-key="number"
              hide-header
              :pagination="{rowsPerPage: 10}"
            />
          </q-card-section>
        </q-card>

      </div>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup/>
      </q-card-actions>

    </q-card>


  </q-dialog>


</template>


<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";

const store = inject('store')

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  eventIdentifier: {type: String, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

const newNode = ref()
const availableNodes = ref([])
const taughtNodes = ref([])
const teRows = ref([])

const teColumns = [
  {name: 'number', field: 'number', required: true, label: 'Number', align: 'left', sortable: true},
  {name: 'name', field: 'name', required: true, label: 'Name', align: 'left', sortable: true},
]


const nodeList = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.nodes)
})

watch(nodeList, () => {
  //console.log(`WATCH Nodes`)
  update_taught_nodes()
//  updateGroupList()
})

const update_taught_nodes = () => {
  teRows.value = []
  taughtNodes.value = []
  nodeList.value.forEach(node => {
    if (Object.values(node.storedEvents).length > 0) {
      let events = Object.values(node.storedEvents)
      events.forEach(event => {
        if (event.eventIdentifier == props.eventIdentifier) {
          taughtNodes.value.push(event.node)
          var nodeName = store.state.layout.nodeDetails[node.nodeNumber].name
          teRows.value.push({"number" : node.nodeNumber, "name" : nodeName})
        }
      })
    }
  })
  update_available_nodes()
}


const update_available_nodes = () =>{
  availableNodes.value = []
  var nodes = store.state.nodes                       // contains all node numbers
  // loop through json object properties with a for-in loop
  // returns top level property even if a nested object (not an index like an array)
  for (var nodeNumber in nodes) {
    // don't add node if event already taught to this node
    var notAdded = true
    for (var index in taughtNodes.value){
      if (taughtNodes.value[index] == nodeNumber){
        notAdded = false
//        console.log("update_available_nodes: event " + props.eventIdentifier + " already in node " + nodeNumber)
      }
    }
    if (notAdded){
      // not already taught, but only add to list if consumer node
      if (nodes[nodeNumber].consumer){
        var entry = nodeNumber + ': '
        if (store.state.layout.nodeDetails[nodeNumber]){
          // add node name if it exists
          entry += store.state.layout.nodeDetails[nodeNumber].name
        }
        availableNodes.value.push(entry)
      }
    }
  }  
}


const clickTeachEvent = () => {
  console.log(`teach_event : ${newNode.value} : ${props.eventIdentifier}`)
  if (newNode.value != "") {
    // get node number from input value
    var array = newNode.value.split(':')
    console.log(`teach_event : ${array[0]} : ${props.eventIdentifier}`)
    store.methods.teach_event(array[0], props.eventIdentifier, props.eventIndex)
    newNode.value = undefined
  }
}



onBeforeMount(() => {
})

onMounted(() => {
})

onUpdated(() => {
  console.log("EventTeachDialog onUpdated")
  if (props.eventIdentifier){
    update_taught_nodes()
  }
})


</script>

<style scoped>

</style>
