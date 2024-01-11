<template>
  <div class="q-pa-md row items-start q-gutter-md">

    <q-card class="q-pa-xs" style="max-width: 300px">
      <q-card-section class="q-pa-xs">
        <div class="text-h6">Event Details</div>
        <div class="text-subtitle2">Details to help identify the Event</div>
        <q-input
          class="q-pa-sm"
          outlined
          v-model="eventName"
          label="Event Name"
          maxlength="30"
          @change="update_event">
        </q-input>

<!--         <q-select
          class="q-pa-sm"
          outlined
          v-model="eventColour"
          :options="store.state.colours"
          label="Event Colour"
          maxlength="30"
          @update:model-value="update_event">
        </q-select>
 -->
<!--         <q-select
          class="q-pa-sm"
          outlined
          use-input
          v-model="eventGroup"
          :options="groupList"
          label="Event Group"
          maxlength="30"
          new-value-mode="add-unique"
          @update:model-value="update_event">
        </q-select>
 -->
      </q-card-section>
    </q-card>

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
              @click="teach_event()"
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

    <q-card class="q-pa-xs" style="max-width: 300px">
      <q-card-section class="q-pa-xs">
        <div class="text-h6">Generate event</div>
        <div class="text-subtitle2">Send this event as ON or OFF</div>
        <div class="q-pa-md q-gutter-sm">
          <q-btn color="green" label="ON" @click="send_on()"/>
          <q-btn color="negative" label="OFF" @click="send_off()"/>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import {inject, onMounted, ref, computed, watch} from "vue";

const props = defineProps({
  "eventIdentifier": {
    type: String,
    required: true
  },
  "nodeNumber": {
    type: Number,
    required: true
  },
  "eventNumber": {
    type: Number,
    required: true
  },
  "type": {
    type: String,
    required: true
  }
})

const eventName = ref('')
const eventColour = ref('')
const eventGroup = ref('')
const newNode = ref()
const availableNodes = ref([])
const taughtNodes = ref([])
const groupList = ref([])
const teRows = ref([])

const teColumns = [
  {name: 'number', field: 'number', required: true, label: 'Number', align: 'left', sortable: true},
  {name: 'name', field: 'name', required: true, label: 'Name', align: 'left', sortable: true},
]


const store = inject('store')

const eventDetails = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.layout.eventDetails)
})


watch(eventDetails, () => {
  console.log(`WATCH Node Details`)
  update_taught_nodes()
  updateGroupList()
})


const updateGroupList = () => {
  groupList.value = []
  eventDetails.value.forEach(node => {
    if (!groupList.value.includes(node.group)) {
      groupList.value.push(node.group)
    }
  })
}

const nodeList = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.nodes)
})

watch(nodeList, () => {
  //console.log(`WATCH Nodes`)
  update_taught_nodes()
  updateGroupList()
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
        console.log("update_available_nodes: event " + props.eventIdentifier + " already in node " + nodeNumber)
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

onMounted(() => {
  //console.log(`Event Details Mounted ${props.eventIdentifier})`)
  if (props.eventIdentifier in store.state.layout.eventDetails) {
    eventName.value = store.state.layout.eventDetails[props.eventIdentifier].name
    eventColour.value = store.state.layout.eventDetails[props.eventIdentifier].colour
    eventGroup.value = store.state.layout.eventDetails[props.eventIdentifier].group
  } else {
    //console.log(`Event No Layout ${props.eventIdentifier}`)
    eventName.value = props.eventIdentifier
    eventColour.value = "black"
    eventGroup.value = ""
  }

  update_taught_nodes()
  updateGroupList()

})

const teach_event = () => {
  console.log(`teach_event : ${newNode.value} : ${props.eventIdentifier}`)
  if (newNode.value != "") {
    // get node number from input value
    var array = newNode.value.split(':')
    console.log(`teach_event : ${array[0]} : ${props.eventIdentifier}`)
    store.methods.teach_event(array[0], props.eventIdentifier, props.eventIndex)
    newNode.value = undefined
  }

}

const update_event = () => {
  //console.log(`Event Details Update Event`)
  if (props.eventIdentifier in store.state.layout.eventDetails === false) {
    store.state.layout.eventDetails[props.eventIdentifier] = {}
  }
  store.state.layout.eventDetails[props.eventIdentifier].name = eventName.value
  store.state.layout.eventDetails[props.eventIdentifier].colour = eventColour.value
  store.state.layout.eventDetails[props.eventIdentifier].group = eventGroup.value
  store.methods.update_layout()

}

const send_on = () => {
  if (props.type == 'long') {
    store.methods.long_on_event(props.nodeNumber, props.eventNumber)
  } else {
    store.methods.short_on_event(props.nodeNumber, props.eventNumber)
  }
}

const send_off = () => {
  if (props.type == 'long') {
    store.methods.long_off_event(props.nodeNumber, props.eventNumber)
  } else {
    store.methods.short_off_event(props.nodeNumber, props.eventNumber)
  }
}

</script>

<style scoped>

</style>
