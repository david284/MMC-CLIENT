<template>
  <div>
    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none" >
      <div class="text-h6">Nodes list</div>
      <template v-slot:action>
        <q-btn flat color="white" size="sm" label="Refresh" @click="clickRefresh()"/>
      </template>
    </q-banner>

    <div>
        <q-table
        class="my-sticky-header-table"
        bordered
        dense
        :rows=rows
        :columns="columns"
        :filter="filter"
        row-key="nodeNumber"
        virtual-scroll
        :rows-per-page-options="[0]"
        :virtual-scroll-sticky-size-start="48"
        hide-bottom
      >
      <template v-slot:body="props" >
          <q-tr :props="props" :class="selected_nodeNumber==props.row.nodeNumber?'bg-blue-1':'bg-white'" class="q-my-none q-py-none">
          <q-td key="nodeNumber" :class="'text-'+nodeColour(props.row.nodeNumber)" :props="props">{{ props.row.nodeNumber }}</q-td>
          <q-td key="nodeName" :props="props">{{ props.row.nodeName }} </q-td>
          <q-td key="moduleName" :props="props">{{ props.row.moduleName }}</q-td>
          <q-td key="mode" :props="props">
            <q-chip dense color="white" text-color="blue" v-if="props.row.mode">Flim</q-chip>
            <q-chip dense color="white" text-color="red" v-else>Slim</q-chip>
          </q-td>
          <q-td key="status" :props="props">
            <q-chip dense color="white" text-color="green" v-if="props.row.status">OK</q-chip>
            <q-chip dense color="white" text-color="red" v-else>Error</q-chip>
          </q-td>
          <q-td key="events" :props="props">{{ props.row.events }}</q-td>
          <q-td key="actions">
            <q-btn dense class="q-mx-xs q-my-none" color="cyan-1" text-color="black" size="md" label="Events"
              @click="clickEvents(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Name"
              @click="clickNameNode(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Parameters"
              @click="clickParameters(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Variables"
              @click="clickVariables(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline v-if="(!props.row.vlcb)" disabled color="primary" size="md" label="CBUS"
              @click="clickVLCB(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline v-if="(props.row.vlcb)" color="primary" size="md" label="VLCB"
              @click="clickVLCB(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Add Event"
              @click="clickAddEvent(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="negative" size="md" label="Delete"
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

      <vlcbServicesDialog  v-model='showVLCBServicesDialog' />

      <p v-if="store.state.debug">
        {{ Object.values(store.state.nodes) }}
      </p>

    </div>
  </div>
</template>

<script setup>
import {inject, ref, onBeforeMount, onMounted, computed, watch} from "vue";
import EventsListByNode from "components/EventsListByNode"
import addEventDialog from "components/dialogs/AddEventDialog"
import deleteNodeDialog from "components/dialogs/DeleteNodeDialog"
import nameNodeDialog from "components/dialogs/NameNodeDialog"
import nodeParametersDialog from "components/dialogs/NodeParametersDialog"
import nodeVariablesDialog from "components/dialogs/NodeVariablesDialog"
import parametersLoadingDialog from "components/dialogs/parametersLoadingDialog"
import vlcbServicesDialog from "components/dialogs/VLCBServicesDialog"


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
const name = "NodesList"
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
const showVLCBServicesDialog = ref(false)

const nodeList = computed(() => {
  return Object.values(store.state.nodes)
})

watch(nodeList, () => {
//  console.log(name + `: WATCH Nodes`)
  update_rows()
})


const nodeDetails = computed(() => {
  return store.state.layout.nodeDetails
})

watch(nodeDetails, () => {
//  console.log(name + `: WATCH Nodes`)
  update_rows()
})


const update_rows = () => {
  console.log(name + ': update_rows')
  rows.value = []
  nodeList.value.forEach(node => {
    let output = {}
    output['nodeNumber'] = node.nodeNumber
    output['nodeName'] = getNodeName(node.nodeNumber)
//    output['group'] = nodeGroup(node.nodeNumber)
    output['moduleName'] = node.moduleName
    output['component'] = node.component
    output['status'] = node.status
    output['mode'] = node.flim
    output['events'] = node.eventCount
    output['vlcb'] = node.VLCB
    rows.value.push(output)
  })
}

const getNodeName = (nodeNumber) => {
  if (nodeNumber in store.state.layout.nodeDetails) {
    return store.state.layout.nodeDetails[nodeNumber].name
  } else {
    return nodeNumber.toString()+' - '+store.state.nodes[nodeNumber].moduleName
  }
}

const nodeColour = (nodeNumber) => {
  if (nodeNumber in store.state.layout.nodeDetails) {
    return store.state.layout.nodeDetails[nodeNumber].colour
  } else {
    return 'blue'
  }
}


onBeforeMount(() => {
  //console.log(name + `: onBeforeMount`)
  store.methods.query_all_nodes()
})


const checkNodeParameters = (nodeNumber) => {
  // param9 - cpu type to check if parameters have been fully retrieved
  if(store.state.nodes[nodeNumber].parameters[9]){
    console.log(name + ": parameters exist")
  } else {
    console.log(name + ": need to read parameters")
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
    store.methods.request_service_discovery(store.state.selected_node)
    console.log(name + ': node row ', store.state.selected_node + " selected")
  }
}


store.eventBus.on('NODE_DELETED_EVENT', (nodeNumber) => {
  console.log(name + ': NODE_DELETED_EVENT - node number ' + nodeNumber)
  if (store.state.selected_node == nodeNumber){
    selected_node_valid.value = false
  }
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickAddEvent = (nodeNumber) => {
  console.log(name + ': clickAddEvent: node', store.state.selected_node)
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
  console.log(name + ': clickDeleteNode: node' + store.state.selected_node)
}

const clickEvents = (nodeNumber) => {
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  console.log(name + ': clickEvents: node', nodeNumber)
}

const clickNameNode = (nodeNumber) => {
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  console.log(name + `: clickNameNode: node ` + nodeNumber)
  showNameNodeDialog.value = true;
}

const clickParameters = (nodeNumber) => {
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  console.log(name + `: clickParameters: node ` + nodeNumber)
  showNodeParametersDialog.value = true
}

const clickRefresh = () => {
  console.log(name + ': clickRefresh')
  store.methods.query_all_nodes()
}


const clickVariables = (nodeNumber) => {
  checkNodeParameters(nodeNumber)
  select_node_row(nodeNumber)
  console.log(name + `: clickVariables: node ` + nodeNumber)
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

const clickVLCB = (nodeNumber) => {
  console.log(name + ': clickVLCB')
  // don't need parameters for this
  select_node_row(nodeNumber)
  store.methods.request_diagnostics(nodeNumber)
  showVLCBServicesDialog.value = true
}


</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 300px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    /* otherwise you see the table scrolling underneath the header */
    background-color: $blue-grey-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
