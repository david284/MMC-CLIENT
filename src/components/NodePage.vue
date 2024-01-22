<template>
  <div>
    <q-banner  inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin no-padding" >
      <div class="text-h6">Node list</div>
      <template v-slot:action>
        <q-btn flat color="white" label="Refresh" @click="clickRefresh()"/>
      </template>
    </q-banner>
    <div>
        <q-table
        style="height: 350px"
        :rows=rows
        bordered
        dense
        :columns="columns"
        :filter="filter"
        row-key="nodeNumber"
        virtual-scroll
        :rows-per-page-options="[0]"
        :virtual-scroll-sticky-size-start="48"
      >
      <template v-slot:body="props" >
          <q-tr :props="props" :class="selected_nodeNumber==props.row.nodeNumber?'bg-blue-1':'bg-white'">
          <q-td key="nodeNumber" :class="'text-'+nodeColour(props.row.nodeNumber)" :props="props">{{ props.row.nodeNumber }}</q-td>
          <q-td key="nodeName" :props="props">{{ props.row.nodeName }} </q-td>
          <q-td key="moduleName" :props="props">{{ props.row.moduleName }}</q-td>
          <q-td key="mode" :props="props">
            <q-chip color="white" text-color="blue" v-if="props.row.mode">Flim</q-chip>
            <q-chip color="white" text-color="red" v-else>Slim</q-chip>
          </q-td>
          <q-td key="status" :props="props">
            <q-chip color="white" text-color="green" v-if="props.row.status">OK</q-chip>
            <q-chip color="white" text-color="red" v-else>Error</q-chip>
          </q-td>
          <q-td key="events" :props="props">{{ props.row.events }}</q-td>
          <q-td key="actions">
            <q-btn color="cyan-1" text-color="black" size="md" label="Events"
              @click="clickEvents(props.row.nodeNumber)" no-caps/>
            <q-btn color="primary" size="md" flat label="Name"
              @click="clickNameNode(props.row.nodeNumber)" no-caps/>
            <q-btn color="primary" size="md" flat label="Parameters"
              @click="clickParameters(props.row.nodeNumber)" no-caps/>
            <q-btn color="primary" size="md" flat label="Variables"
              @click="clickVariables(props.row.nodeNumber)" no-caps/>
            <q-btn color="primary" size="md" flat label="Add Event"
              @click="clickAddEvent(props.row.nodeNumber)" no-caps/>
            <q-btn color="negative" size="md" flat label="Delete"
              @click="clickDeleteNode(props.row.nodeNumber)" no-caps/>

          </q-td>
        </q-tr>
      </template>
      </q-table>


      <EventsListByNode v-if="(selected_node_valid == true)"
        :nodeNumber = store.state.selected_node
      />



      <addEventDialog v-model='showAddEventDialog' />

      <deleteNodeDialog v-model='showDeleteNodeDialog'
        :nodeNumber = store.state.selected_node
      />

       <nameNodeDialog v-model='showNameNodeDialog'
        :nodeNumber = store.state.selected_node
      />
 
       <nodeParametersDialog v-model='showNodeParametersDialog'
        :nodeNumber = store.state.selected_node
      />

      <nodeVariablesDialog v-model='showNodeVariablesDialog'
        :nodeNumber = store.state.selected_node
      />

      <parametersLoadingDialog v-model='showParametersLoadingDialog'
        :nodeNumber = store.state.selected_node
      />

      <p v-if="store.state.debug">
        {{ Object.values(store.state.nodes) }}
      </p>

    </div>
  </div>
</template>

<script setup>
import {inject, ref, onBeforeMount, computed, watch} from "vue";
import EventsListByNode from "components/EventsListByNode"
import addEventDialog from "components/dialogs/AddEventDialog"
import deleteNodeDialog from "components/dialogs/DeleteNodeDialog"
import nameNodeDialog from "components/dialogs/NameNodeDialog"
import nodeParametersDialog from "components/dialogs/NodeParametersDialog"
import nodeVariablesDialog from "components/dialogs/NodeVariablesDialog"
import parametersLoadingDialog from "components/dialogs/parametersLoadingDialog"


const columns = [
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node number', align: 'left', sortable: true},
  {name: 'nodeName', field: 'nodeName', required: true, label: 'Name', align: 'left', sortable: true},
//  {name: 'group', field: 'group', required: true, label: 'Group', align: 'left', sortable: true},
  {name: 'moduleName', field: 'moduleName', required: true, label: 'Module name', align: 'left', sortable: true},
//  {name: 'component', field: 'component', required: true, label: 'component', align: 'left', sortable: true},
  {name: 'mode', field: 'mode', required: true, label: 'Mode', align: 'left', sortable: true},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: true},
  {name: 'events', field: 'events', required: true, label: 'Stored Events', align: 'left', sortable: false},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const store = inject('store')
const name = "NodePage"
const filter = ref('')
const rows = ref([])
const selected_node_valid = ref(false)
const showAddEventDialog = ref(false)
const showDeleteNodeDialog = ref(false)
const showNameNodeDialog = ref(false)
const showNodeParametersDialog = ref(false)
const showNodeVariablesDialog = ref(false)
const selected_nodeNumber = ref()
const showParametersLoadingDialog = ref(false)

const nodeList = computed(() => {
  return Object.values(store.state.nodes)
})

watch(nodeList, () => {
//  console.log(`WATCH Nodes`)
  update_rows()
})


const nodeDetails = computed(() => {
  return store.state.layout.nodeDetails
})

watch(nodeDetails, () => {
//  console.log(`WATCH Nodes`)
  update_rows()
})


const update_rows = () => {
  rows.value = []
  nodeList.value.forEach(node => {
//    console.log(JSON.stringify(node))
    let output = {}
    output['nodeNumber'] = node.nodeNumber
    output['nodeName'] = getNodeName(node.nodeNumber)
//    output['group'] = nodeGroup(node.nodeNumber)
    output['moduleName'] = node.moduleName
    output['component'] = node.component
    output['status'] = node.status
    output['mode'] = node.flim
    output['events'] = node.eventCount
    rows.value.push(output)
  })
}

const getNodeName = (nodeNumber) => {
  if (nodeNumber in store.state.layout.nodeDetails) {
    return store.state.layout.nodeDetails[nodeNumber].name
  } else {
    return nodeId.toString()+' - '+store.state.nodes[nodeNumber].moduleName
  }
}

const nodeColour = (nodeId) => {
  if (nodeId in store.state.layout.nodeDetails) {
    return store.state.layout.nodeDetails[nodeId].colour
  } else {
    return 'blue'
  }
}


onBeforeMount(() => {
  //console.log(`Node onBeforeMount`)
  store.methods.query_all_nodes()
})


const checkNodeParameters = (nodeNumber) => {
  // param9 - cpu type to check if parameters have been fully retrieved
  if(store.state.nodes[nodeNumber].parameters[9]){
    console.log("parameters exist")
  } else {
    console.log("need to read parameters")
    store.methods.request_all_node_parameters(nodeNumber, 20, 100)
  }
}


const select_node_row = (nodeNumber) => {
  if (store.state.selected_node != nodeNumber) {
    console.log(name + ': request_all_node_events')
    store.state.selected_node = nodeNumber
    store.methods.request_all_node_events(store.state.selected_node)
    selected_nodeNumber.value = nodeNumber    // used to highlight row
    selected_node_valid.value = true 
    console.log(name + ': node row ', store.state.selected_node + " selected")
  }
}


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickAddEvent = (nodeNumber) => {
  console.log('clicked on node', store.state.selected_node)
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  console.log('add event', nodeNumber)
  if(store.state.nodes[nodeNumber].parameters[9]) {
    // parameters loaded, so showAddEventDialog
    showAddEventDialog.value = true
  } else {
    // parameters not loaded, so showParametersLoadingDialog
    showParametersLoadingDialog.value = true
  }
}

const clickDeleteNode = (nodeNumber) => {
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  showDeleteNodeDialog.value=true
  console.log('selected node' + store.state.selected_node)
}

const clickEvents = (nodeNumber) => {
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  console.log('selected node', nodeNumber)
}

const clickNameNode = (nodeNumber) => {
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  console.log(`clickNameNode`)
  showNameNodeDialog.value = true;
}

const clickParameters = (nodeNumber) => {
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  console.log(`clickParameters`)
  showNodeParametersDialog.value = true
}

const clickRefresh = () => {
  store.methods.query_all_nodes()
}


const clickVariables = (nodeNumber) => {
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  console.log(`clickVariables`)
  if(store.state.nodes[nodeNumber].parameters[9]) {
    // parameters loaded, so read variables & showNodeVariablesDialog
    store.methods.request_all_node_variables(
      nodeNumber, 
      store.state.nodes[nodeNumber].parameters[6], 
      100, 
      1)
    showNodeVariablesDialog.value = true
  } else {
    // parameters not loaded, so showParametersLoadingDialog
    showParametersLoadingDialog.value = true
  }
}


</script>

<style scoped>


</style>
