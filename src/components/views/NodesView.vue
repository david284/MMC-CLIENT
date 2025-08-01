<template>
  <div>
    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none" >
      <div class="text-h6">Nodes View</div>
      <template v-slot:action>
        view mode
        <q-btn class="q-mx-xs q-my-none" size="sm" color="info" :label=store.state.nodes_view_mode  no-caps
            @click="clickViewMode()" />
        <q-space/>
        <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps
            @click="clickInfo()" />
        <q-space/>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-input class="input-box" bg-color="grey-3" style="width: 200px;" filled dense borderless debounce="300" v-model="filter" placeholder="Search">
            <q-icon size="sm" name="search"/>
        </q-input>
        &nbsp;&nbsp;
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Advanced"
          @click="clickNodesViewAdvanced()"/>
        &nbsp;&nbsp;
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Refresh" @click="clickRefresh()"/>
      </template>
    </q-banner>

    <div>
        <q-table
        :class=tableStyle
        bordered
        dense
        :rows=rows
        :columns="columns"
        :filter="filter"
        row-key="nodeNumber"
        virtual-scroll
        :rows-per-page-options="[0]"
        :virtual-scroll-sticky-size-start="0"
        hide-bottom
      >
      <template v-slot:body="props" >
          <q-tr :props="props" :class="selected_nodeNumber==props.row.nodeNumber?'bg-blue-1':'bg-white'" class="q-my-none q-py-none">
          <q-td key="nodeNumber" :class="'text-'+nodeColour(props.row.nodeNumber)" :props="props">{{ props.row.nodeNumber }}</q-td>
          <q-td key="CANID" :props="props">{{ props.row.CANID }} </q-td>
          <q-td key="nodeName" :props="props">{{ props.row.nodeName }} </q-td>
          <q-td key="group" :props="props">{{ props.row.group }} </q-td>
          <q-td key="moduleName" :props="props">{{ props.row.moduleName }}</q-td>
          <q-td key="moduleVersion" :props="props">{{ props.row.moduleVersion }}</q-td>
          <q-td key="mode" :props="props">
            <q-chip dense color="white" text-color="blue" v-if="(props.row.mode=='FLiM')">{{ props.row.mode }}</q-chip>
            <q-chip dense color="white" text-color="red" v-else>{{ props.row.mode }}</q-chip>
          </q-td>
          <q-td key="status" :props="props">
            <q-chip dense color="white" text-color="green" v-if="props.row.status">OK</q-chip>
            <q-chip dense color="white" text-color="red" v-else>OFFLINE</q-chip>
          </q-td>
          <q-td key="events" :props="props">{{ props.row.events }}</q-td>
          <q-td key="spaceLeft" :props="props">{{ props.row.spaceLeft }}</q-td>
          <q-td key="actions">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Events"
              :disabled="!props.row.status" @click="clickEvents(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Name"
              @click="clickNameNode(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Parameters"
              @click="clickParameters(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Variables"
              :disabled="!props.row.status" @click="clickVariables(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline v-if="(!props.row.vlcb)" disabled color="primary" size="md" label="CBUS"
              @click="clickVLCB(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline v-if="(props.row.vlcb)" color="primary" size="md" label="VLCB"
              :disabled="!props.row.status" @click="clickVLCB(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" color="blue-grey-1" text-color="blue-grey-14" size="md" label="Advanced"
              @click="clickNodeAdvanced(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="negative" size="md" label="Delete"
              @click="clickDeleteNode(props.row.nodeNumber)" no-caps/>

              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>

      <advancedNodeDialog v-model='showAdvancedNodeDialog'
        :nodeNumber = selectedNode
      />


      <EventsListByNode v-if="((selected_node_valid == true) && (store.state.nodes_view_mode=='split'))"
        :nodeNumber = store.state.selected_node
      />

      <nameNodeDialog v-model='showNameNodeDialog'
        :nodeNumber = store.state.selected_node
      />

      <nodeEventsDialog v-model='showNodeEventsDialog'
        :nodeNumber = store.state.selected_node
      />

      <nodeParametersDialog v-model='showNodeParametersDialog'
        :nodeNumber = store.state.selected_node
      />

      <nodeVariablesDialog v-model='showNodeVariablesDialog'
        :nodeNumber = selected_nodeNumber
      />

      <NodesViewAdvancedDialog v-model='showNodesViewAdvancedDialog'/>

      <NodesViewInfoDialog v-model='showNodesViewInfoDialog'/>

      <WaitingOnBusTrafficDialog v-model='showWaitingOnBusTrafficDialog'
      callingModule = "Nodes View"
      :message = WaitingOnBusTrafficMessage
      @WaitingOnBusTrafficDialogEvent="WaitingOnBusTrafficDialogReturn = $event"
      />

      <vlcbServicesDialog  v-model='showVLCBServicesDialog'
        :nodeNumber = store.state.selected_node
      />

      <iFrameDialog v-model='showiFrameDialog'
        :URL=exampleURL />

  </div>
</template>

<script setup>
import {inject, ref, onBeforeMount, onMounted, computed, watch} from "vue"
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import {timeStampedLog} from "components/functions/utils.js"
import EventsListByNode from "components/views/EventsListByNode"
import advancedNodeDialog from "components/dialogs/advancedNodeDialog"
import nameNodeDialog from "components/dialogs/NameNodeDialog"
import nodeEventsDialog from "components/dialogs/nodeEventsDialog"
import nodeParametersDialog from "components/dialogs/NodeParametersDialog"
import nodeVariablesDialog from "components/dialogs/NodeVariablesDialog"
import NodesViewAdvancedDialog from "components/dialogs/NodesViewAdvancedDialog"
import NodesViewInfoDialog from "components/dialogs/NodesViewInfoDialog"
import vlcbServicesDialog from "components/dialogs/VLCBServicesDialog"
import iFrameDialog from "components/dialogs/iFrameDialog";
import WaitingOnBusTrafficDialog from "components/dialogs/WaitingOnBusTrafficDialog";

const $q = useQuasar()

const columns = [
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node number', align: 'center', sortable: true},
  {name: 'CANID', field: 'CANID', required: true, label: 'CAN ID', align: 'center', sortable: true},
  {name: 'nodeName', field: 'nodeName', required: true, label: 'Name', align: 'left', sortable: true},
  {name: 'group', field: 'group', required: true, label: 'Group', align: 'left', sortable: true},
  {name: 'moduleName', field: 'moduleName', required: true, label: 'Module name', align: 'left', sortable: true},
  {name: 'moduleVersion', field: 'moduleVersion', required: true, label: 'Version', align: 'left', sortable: true},
  {name: 'mode', field: 'mode', required: true, label: 'Mode', align: 'left', sortable: true},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: true},
  {name: 'events', field: 'events', required: true, label: 'Stored Events', align: 'center', sortable: true},
  {name: 'spaceLeft', field: 'spaceLeft', required: true, label: 'Space', align: 'center', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const store = inject('store')
const name = "NodesList"
const filter = ref('')
const rows = ref([])
const selectedNode = ref()
const selected_node_valid = ref(false)
const showAdvancedNodeDialog = ref(false)
const showNodesViewAdvancedDialog = ref(false)
const showNameNodeDialog = ref(false)
const showNodeEventsDialog = ref(false)
const showNodeParametersDialog = ref(false)
const showNodesViewInfoDialog = ref(false)
const showNodeVariablesDialog = ref(false)
const selected_nodeNumber = ref()
const showVLCBServicesDialog = ref(false)
const showWaitingOnBusTrafficDialog = ref(false)
const showiFrameDialog = ref(false)
const exampleURL = ref("dummyModule/index.html")
const WaitingOnBusTrafficMessage = ref('')
const WaitingOnBusTrafficDialogReturn = ref('')
const tableStyle = ref("nodes-view-split-table")

const nodesUpdated = computed(() => {
  return store.state.nodes.updateTimestamp
})

watch(nodesUpdated, () => {
  //timeStampedLog(name + `: WATCH: nodesUpdated ` + nodesUpdated.value)
  update_rows()
})


const layoutUpdated = computed(() => {
  return store.state.layout.updateTimestamp
})

watch(layoutUpdated, () => {
  //timeStampedLog(name + `: WATCH: layoutUpdated`)
  update_rows()
})


const update_rows = () => {
//  timeStampedLog(name + ': update_rows')
  rows.value = []
  let nodeList = Object.values(store.state.nodes)
  nodeList.forEach(node => {
    // don't show node number 0
    if (node.nodeNumber > 0){
      let output = {}
      output['nodeNumber'] = parseInt(node.nodeNumber)
      output['CANID'] = node.CANID
      output['nodeName'] = store.getters.node_name(node.nodeNumber)
      output['group'] = store.getters.node_group(node.nodeNumber)
      output['moduleName'] = store.getters.module_name(node.nodeNumber)
      output['moduleVersion'] = store.getters.module_version(node.nodeNumber)
      output['component'] = node.component
      output['status'] = node.status
      if (node.flim == true) {
        output['mode'] = 'FLiM'
      } else if (node.flim == false) {
        output['mode'] = 'SLiM'
      } else {
        output['mode'] = 'unknown'
      }
      output['events'] = node.eventCount
      output['spaceLeft'] = node.eventSpaceLeft
      output['vlcb'] = node.VLCB
      rows.value.push(output)
    }
  })
}


const nodeColour = (nodeNumber) => {
  if (nodeNumber in store.state.layout.nodeDetails) {
    return store.state.layout.nodeDetails[nodeNumber].colour
  } else {
    return 'blue'
  }
}


onBeforeMount(() => {
  //timeStampedLog(name + `: onBeforeMount`)
  if (store.state.nodes_view_mode == undefined){
    store.state.nodes_view_mode = "split"
  }
  if (store.state.nodes_view_mode == 'split'){
    tableStyle.value = "nodes-view-split-table"
  } else {
    tableStyle.value = "nodes-view-full-table"
  }
 update_rows()
})


const select_node_row = async (nodeNumber) => {
  //timeStampedLog(name + ': select_node_row: node ' + nodeNumber)
  store.state.selected_node = nodeNumber
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  selected_node_valid.value = true
  // give the module chance to report it's events
  await sleep(300)
//    timeStampedLog(name + ': node row ', store.state.selected_node + " selected")
}


store.eventBus.on('NODE_DELETED_EVENT', (nodeNumber) => {
//  timeStampedLog(name + ': NODE_DELETED_EVENT - node number ' + nodeNumber)
  if (store.state.selected_node == nodeNumber){
    selected_node_valid.value = false
  }
})


const checkNodeParameters = async (nodeNumber) => {
  //timeStampedLog(name + ': checkNodeParameters: node ' + nodeNumber)
  //
  // params 5 & 6 - check if parameters have been fully retrieved
  // logical and &&
  if((store.state.nodes[nodeNumber].parameters[5]) && (store.state.nodes[nodeNumber].parameters[6])){
    // parameters exist, so don't need to load
  } else {
    WaitingOnBusTrafficDialogReturn.value =''
    WaitingOnBusTrafficMessage.value = "Loading Node Parameters"
    showWaitingOnBusTrafficDialog.value = true
    store.methods.request_all_node_parameters(nodeNumber, 20, 100)
    // allow up to 2 minutes to finish loading
    let startTime = Date.now()
    while ((Date.now() - startTime) < 120000){
      if (WaitingOnBusTrafficDialogReturn.value.length > 0)
      {
        // success if we exit early
        //timeStampedLog(name + ': checkNodeParameters: return ' + WaitingOnBusTrafficDialogReturn.value)
        break
      }
      await sleep (100)
    }
    showWaitingOnBusTrafficDialog.value = false
  }
  var result = (store.state.nodes[nodeNumber].parameters[5] != undefined)? true : false
  if (result == false){
    timeStampedLog(name + `: checkNodeParameters: node ${nodeNumber} failed`)
    $q.notify({
      message: 'Reading Node Parameters has failed',
      caption: 'please check connections to node',
      timeout: 5000,
      type: 'warning',
      position: 'center',
      actions: [ { label: 'Dismiss' } ]
    })
  }
  return result
}



// raise notification if nodeDescriptor file not present
const checkFileLoad = async (nodeNumber) => {
//  await sleep(500)
  //timeStampedLog(name + `: checkFileLoad`)
  if (store.state.loadFile_notification_raised[nodeNumber] == undefined) {
    if (store.state.nodeDescriptors[nodeNumber] == undefined)
    {
      $q.notify({
        message: 'NPD: Failed to load descriptor file for module identifier ' + store.state.nodes[nodeNumber].moduleIdentifier,
        timeout: 0,
        type: 'warning',
        position: 'center',
        actions: [ { label: 'Dismiss' } ]
      })
      store.state.loadFile_notification_raised[nodeNumber]=true;
    }
  }
}


const checkNodeVariables = async (nodeNumber) => {
  //timeStampedLog(name + ': checkNodeVariables: node ' + nodeNumber)
  var maxNodeVariableIndex = store.state.nodes[nodeNumber].parameters[6]
  if(store.state.nodes[nodeNumber].nodeVariables[maxNodeVariableIndex] != undefined){
    //timeStampedLog(name + ": checkNodeVariables: already read")
  } else {
    WaitingOnBusTrafficDialogReturn.value =''
    WaitingOnBusTrafficMessage.value = "Loading Node Variables"
    store.methods.request_all_node_variables(nodeNumber)
    showWaitingOnBusTrafficDialog.value = true
    // wait for variables to load
    for (let i = 0; i < 10000; i++){
      if (WaitingOnBusTrafficDialogReturn.value.length > 0) break
      await sleep (10)
    }
    showWaitingOnBusTrafficDialog.value = false
  }
}


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickDeleteNode = (nodeNumber) => {
  timeStampedLog(name + `: clickDeleteNode ` + nodeNumber)
  const result = $q.notify({
    message: 'Are you sure you want to delete node '+ store.getters.node_name(nodeNumber),
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
        store.methods.remove_node(nodeNumber)
        store.eventBus.emit('NODE_DELETED_EVENT', nodeNumber)
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

//
//
const clickEvents = async (nodeNumber) => {
  timeStampedLog(name + `: clickEvents: node ` + nodeNumber)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  await checkNodeParameters(nodeNumber)
  await checkNodeVariables(nodeNumber)
  store.methods.request_all_node_events(nodeNumber)
  await select_node_row(nodeNumber)
  if (store.state.nodes_view_mode == 'full'){
    showNodeEventsDialog.value = true
  }
}

//
//
const clickViewMode = () => {
  timeStampedLog(name + `: clickViewMode ${store.state.nodes_view_mode}`)
  store.state.nodes_view_mode = (store.state.nodes_view_mode == 'full') ? 'split' : 'full'
  if (store.state.nodes_view_mode == 'split'){
    tableStyle.value = "nodes-view-split-table"
  } else {
    tableStyle.value = "nodes-view-full-table"
  }
}

//
//
const clickInfo = () => {
  timeStampedLog(name + `: clickInfo`)
  showNodesViewInfoDialog.value = true
}

//
//
const clickNameNode = async (nodeNumber) => {
  timeStampedLog(name + `: clickNameNode: node ` + nodeNumber)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  await select_node_row(nodeNumber)
  showNameNodeDialog.value = true;
}

//
//
const clickNodeAdvanced = async (nodeNumber) => {
  timeStampedLog(name + `: clickNodeAdvanced`)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  if (store.state.nodes[nodeNumber].status) {
    await checkNodeParameters(nodeNumber)
  }
  await select_node_row(nodeNumber)
  selectedNode.value = nodeNumber
  showAdvancedNodeDialog.value=true
  timeStampedLog(name + ': clickAdvanced: node' + store.state.selected_node)
}

//
//
const clickNodesViewAdvanced = async () => {
  timeStampedLog(name + `: clickNodesViewAdvanced:`)
  showNodesViewAdvancedDialog.value = true
}

//
//
const clickParameters = async (nodeNumber) => {
  timeStampedLog(name + `: clickParameters`)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  // clear out parameters to force them to be reloaded
  store.state.nodes[nodeNumber].parameters = {}
  if (await checkNodeParameters(nodeNumber)){
    //timeStampedLog(name + `: clickParameters: checkNodeParameters true`)
    await select_node_row(nodeNumber)
    //timeStampedLog(name + `: clickParameters: node ` + nodeNumber)
    showNodeParametersDialog.value = true
  }
}

//
//
const clickRefresh = () => {
  timeStampedLog(name + ': clickRefresh')
  store.methods.query_all_nodes()
}

//
//
const clickVariables = async (nodeNumber) => {
  timeStampedLog(name + `: clickVariables: node ` + nodeNumber)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  await checkNodeParameters(nodeNumber)
  await select_node_row(nodeNumber)
  if ((nodeNumber == 1000) && store.state.develop){
    showiFrameDialog.value = true
  } else {
      await checkNodeVariables(nodeNumber)
      showNodeVariablesDialog.value = true
    }
}

//
//
const clickVLCB = async (nodeNumber) => {
  timeStampedLog(name + ': clickVLCB')
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  await checkNodeParameters(nodeNumber)
  await select_node_row(nodeNumber)
  await store.methods.request_service_discovery(store.state.selected_node)
  // give the module chance to report it's services before we request diagnostics
  await sleep(200)
  showVLCBServicesDialog.value = true
}


</script>

<style lang="sass">
.nodes-view-full-table
  /* height or max-height is important */
  height: 89vh

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

.nodes-view-split-table
  /* height or max-height is important */
  height: 43vh

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

<style scoped>
:deep(.input-box .q-field__control),
:deep(.input-box .q-field__marginal) {
  height: 25px;
  font-size: 12px;
}
</style>
