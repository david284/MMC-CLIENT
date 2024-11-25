<template>
  <div style="height: 45vh;">
    <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none" >
      <div class="text-h6">Nodes View</div>
      <template v-slot:action>
        <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps
            @click="clickInfo()" />
        <q-space/>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <q-input class="input-box" bg-color="grey-3" style="width: 200px;" filled dense borderless debounce="300" v-model="filter" placeholder="Search">
            <q-icon size="sm" name="search"/>
        </q-input>
        &nbsp;&nbsp;
        <q-btn class="q-mx-xs q-my-none" color="blue" size="sm" label="Refresh" @click="clickRefresh()"/>
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
          <q-td key="mode" :props="props">
            <q-chip dense color="white" text-color="blue" v-if="(props.row.mode=='FLiM')">{{ props.row.mode }}</q-chip>
            <q-chip dense color="white" text-color="red" v-else>{{ props.row.mode }}</q-chip>
          </q-td>
          <q-td key="status" :props="props">
            <q-chip dense color="white" text-color="green" v-if="props.row.status">OK</q-chip>
            <q-chip dense color="white" text-color="red" v-else>Error</q-chip>
          </q-td>
          <q-td key="events" :props="props">{{ props.row.events }}</q-td>
          <q-td key="actions">
            <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Events"
              :disabled="!props.row.status" @click="clickEvents(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Name"
              :disabled="!props.row.status" @click="clickNameNode(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Parameters"
              @click="clickParameters(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="md" label="Variables"
              :disabled="!props.row.status" @click="clickVariables(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline v-if="(!props.row.vlcb)" disabled color="primary" size="md" label="CBUS"
              @click="clickVLCB(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" outline v-if="(props.row.vlcb)" color="primary" size="md" label="VLCB"
              :disabled="!props.row.status" @click="clickVLCB(props.row.nodeNumber)" no-caps/>
            <q-btn dense class="q-mx-xs q-my-none" color="blue-grey-1" text-color="blue-grey-14" size="md" label="Advanced"
              :disabled="!props.row.status" @click="clickNodeAdvanced(props.row.nodeNumber)" no-caps/>

          </q-td>
        </q-tr>
      </template>
      </q-table>
      
      <EventsListByNode v-if="(selected_node_valid == true)"
        :nodeNumber = store.state.selected_node
      />

      <advancedNodeDialog v-model='showAdvancedDialog'
        :nodeNumber = selectedNode
      />

      <nameNodeDialog v-model='showNameNodeDialog'
        :nodeNumber = store.state.selected_node
      />

       <nodeParametersDialog v-model='showNodeParametersDialog'
        :nodeNumber = store.state.selected_node
      />

      <nodeVariablesDialog v-model='showNodeVariablesDialog'
        :nodeNumber = selected_nodeNumber
      />

      <NodeParametersLoadingDialog v-model='showNodeParametersLoadingDialog'
        :nodeNumber = selected_nodeNumber
         @NodeParametersLoadingDialog="nodeParametersLoadingReturn = $event"
      />

      <NodesViewInfoDialog v-model='showNodesViewInfoDialog'/>

      <NodeVariablesLoadingDialog v-model='showNodeVariablesLoadingDialog'
        :nodeNumber = selected_nodeNumber
        @NodeVariablesLoadingDialog="nodeVariablesLoadingReturn = $event"
        />

      <vlcbServicesDialog  v-model='showVLCBServicesDialog' 
        :nodeNumber = store.state.selected_node
      />

      <iFrameDialog v-model='showiFrameDialog'
        :URL=exampleURL />
     
    </div>
  </div>
</template>

<script setup>
import {inject, ref, onBeforeMount, onMounted, computed, watch} from "vue"
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import EventsListByNode from "components/EventsListByNode"
import advancedNodeDialog from "components/dialogs/advancedNodeDialog"
import nameNodeDialog from "components/dialogs/NameNodeDialog"
import nodeParametersDialog from "components/dialogs/NodeParametersDialog"
import nodeVariablesDialog from "components/dialogs/NodeVariablesDialog"
import NodeParametersLoadingDialog from "components/dialogs/NodeParametersLoadingDialog"
import NodesViewInfoDialog from "components/dialogs/NodesViewInfoDialog"
import NodeVariablesLoadingDialog from "components/dialogs/NodeVariablesLoadingDialog"
import vlcbServicesDialog from "components/dialogs/VLCBServicesDialog"
import iFrameDialog from "components/dialogs/iFrameDialog";

const $q = useQuasar()

const columns = [
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node number', align: 'left', sortable: true},
  {name: 'CANID', field: 'CANID', required: true, label: 'CAN ID', align: 'left', sortable: true},
  {name: 'nodeName', field: 'nodeName', required: true, label: 'Name', align: 'left', sortable: true},
  {name: 'group', field: 'group', required: true, label: 'Group', align: 'left', sortable: true},
  {name: 'moduleName', field: 'moduleName', required: true, label: 'Module name', align: 'left', sortable: true},
  {name: 'mode', field: 'mode', required: true, label: 'Mode', align: 'left', sortable: true},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: true},
  {name: 'events', field: 'events', required: true, label: 'Stored Events', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const store = inject('store')
const name = "NodesList"
const filter = ref('')
const rows = ref([])
const selectedNode = ref()
const selected_node_valid = ref(false)
const showAdvancedDialog = ref(false)
const showNameNodeDialog = ref(false)
const showNodeParametersDialog = ref(false)
const showNodeParametersLoadingDialog = ref(false)
const showNodesViewInfoDialog = ref(false)
const showNodeVariablesDialog = ref(false)
const selected_nodeNumber = ref()
const showNodeVariablesLoadingDialog = ref(false)
const showVLCBServicesDialog = ref(false)
const showiFrameDialog = ref(false)
const exampleURL = ref("dummyModule/index.html")
const nodeParametersLoadingReturn = ref('')
const nodeVariablesLoadingReturn = ref('')

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
//  console.log(name + ': update_rows')
  rows.value = []
  nodeList.value.forEach(node => {
    let output = {}
    output['nodeNumber'] = node.nodeNumber
    output['CANID'] = node.CANID
    output['nodeName'] = store.getters.node_name(node.nodeNumber)
    output['group'] = store.getters.node_group(node.nodeNumber)
    output['moduleName'] = node.moduleName
    output['component'] = node.component
    output['status'] = node.status
    if (node.flim){
      output['mode'] = 'FLiM'
    } else {
      if (node.VLCB){
        output['mode'] = 'unInit'
      } else {
        output['mode'] = 'SLiM'
      }
    }
    output['events'] = node.eventCount
    output['vlcb'] = node.VLCB
    rows.value.push(output)
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
  //console.log(name + `: onBeforeMount`)
 update_rows()
})


const select_node_row = async (nodeNumber) => {
//    console.log(name + ': request_all_node_events')
  store.state.selected_node = nodeNumber
//  store.methods.request_all_node_events(store.state.selected_node)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  selected_node_valid.value = true
  // give the module chance to report it's events
  await sleep(300)
//    console.log(name + ': node row ', store.state.selected_node + " selected")
}


store.eventBus.on('NODE_DELETED_EVENT', (nodeNumber) => {
//  console.log(name + ': NODE_DELETED_EVENT - node number ' + nodeNumber)
  if (store.state.selected_node == nodeNumber){
    selected_node_valid.value = false
  }
})


const checkNodeParameters = async (nodeNumber) => {
  nodeParametersLoadingReturn.value=''
  showNodeParametersLoadingDialog.value = true
  // wait for parameters to load
  for (let i = 0; i < 1000; i++){
     if (nodeParametersLoadingReturn.value.length > 0) break
     await sleep (10)
  }
  showNodeParametersLoadingDialog.value = false
  var result = (store.state.nodes[nodeNumber].parameters[9] != undefined)? true : false
  if (result == false){
    $q.notify({
      message: 'Reading Node Parameters has failed',
      caption: 'please check connections to node',
      timeout: 5000,
      type: 'warning',
      position: 'center',
      actions: [ { label: 'Dismiss' } ]
    })
  }
  console.log(name + ': checkNodeParameters - result ' + result)
  return result
}


const checkNodeVariables = async (nodeNumber) => {
  nodeVariablesLoadingReturn.value =''
  showNodeVariablesLoadingDialog.value = true
  // wait for variables to load
  for (let i = 0; i < 10000; i++){
     if (nodeVariablesLoadingReturn.value.length > 0) break
     await sleep (10)
  }
  showNodeVariablesLoadingDialog.value = false
}


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickEvents = async (nodeNumber) => {
  console.log(name + `: clickEvents`)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  await checkNodeParameters(nodeNumber)
  await checkNodeVariables(nodeNumber)
  await select_node_row(nodeNumber)
  console.log(name + ': clickEvents: node', nodeNumber)
}

const clickInfo = () => {
  console.log(name + `: clickInfo`)
  showNodesViewInfoDialog.value = true
}

const clickNameNode = async (nodeNumber) => {
  console.log(name + `: clickNameNode: node ` + nodeNumber)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  await checkNodeParameters(nodeNumber)
  await select_node_row(nodeNumber)
  showNameNodeDialog.value = true;
}

const clickNodeAdvanced = async (nodeNumber) => {
  console.log(name + `: clickNodeAdvanced`)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  await checkNodeParameters(nodeNumber)
  await select_node_row(nodeNumber)
  selectedNode.value = nodeNumber
  showAdvancedDialog.value=true
  console.log(name + ': clickAdvanced: node' + store.state.selected_node)
}


const clickParameters = async (nodeNumber) => {
  console.log(name + `: clickParameters`)
  selected_nodeNumber.value = nodeNumber    // used to highlight row
  // always re-read parameters
  store.methods.request_all_node_parameters(nodeNumber, 20, 100)
  if (await checkNodeParameters(nodeNumber)){
    console.log(name + `: clickParameters: checkNodeParameters true`)
    await select_node_row(nodeNumber)
    console.log(name + `: clickParameters: node ` + nodeNumber)
    showNodeParametersDialog.value = true
  }
}

const clickRefresh = () => {
  console.log(name + ': clickRefresh')
  store.methods.query_all_nodes()
}


const clickVariables = async (nodeNumber) => {
  console.log(name + `: clickVariables: node ` + nodeNumber)
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

const clickVLCB = async (nodeNumber) => {
  console.log(name + ': clickVLCB')
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
.my-sticky-header-table
  /* height or max-height is important */
  height: 42vh

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