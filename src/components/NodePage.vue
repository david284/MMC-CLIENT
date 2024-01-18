<template>
  <div>
    <!--    <div class="q-pa-md q-gutter-sm">
          <q-btn color="negative" label="Check Nodes" @click="store.methods.QNN()" no-caps/>
    </div>-->
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
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="nodeNumber" :class="'text-'+nodeColour(props.row.nodeNumber)" :props="props">{{ props.row.nodeNumber }}</q-td>
          <q-td key="nodeName" :props="props">{{ props.row.nodeName }}</q-td>
          <q-td key="moduleName" :props="props">{{ props.row.moduleName }}</q-td>
          <q-td key="mode" :props="props">
            <q-chip color="white" text-color="blue" v-if="props.row.mode">Flim</q-chip>
            <q-chip color="white" text-color="red" v-else>Slim</q-chip>
          </q-td>
          <q-td key="status" :props="props">
            <q-chip color="white" text-color="green" v-if="props.row.status">OK</q-chip>
            <q-chip color="white" text-color="red" v-else>Error</q-chip>
          </q-td>
          <q-td key="actions">
            <q-btn color="cyan-1" text-color="black" size="md" label="Events"
                    @click="selectNode(props.row.nodeNumber)" no-caps/>
            <q-btn color="primary" size="md" flat label="Name"
                    @click="clickNameNode(props.row.nodeNumber)" no-caps/>

            <q-btn color="primary" size="md" flat label="Parameters"
              @click="clickParameters(props.row.nodeNumber)" no-caps/>

            <q-btn color="primary" size="md" flat label="Variables"
              @click="clickVariables(props.row.nodeNumber)" no-caps/>
<!-- 
            <q-btn color="primary" size="md" flat label="Edit"
                    @click="editNode(props.row.nodeNumber, props.row.component)" no-caps/>
 -->
            <q-btn color="primary" size="md" flat label="Add Event"
                    @click="addEvent(props.row.nodeNumber)" no-caps/>
            <q-btn color="negative" size="md" flat label="Delete"
                    @click="deleteNode(props.row.nodeNumber)" no-caps/>
          </q-td>
        </q-tr>
      </template>
      </q-table>


      <EventsListByNode v-if="(selected_node_valid == true)" />


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

      <p v-if="store.state.debug">
        {{ Object.values(store.state.nodes) }}
      </p>

    </div>
  </div>
</template>

<script setup>
import {inject, ref, onBeforeMount, computed, watch} from "vue";
import { useQuasar } from 'quasar'
import addEventDialog from "components/dialogs/AddEventDialog"
import deleteNodeDialog from "components/dialogs/DeleteNodeDialog"
import nameNodeDialog from "components/dialogs/NameNodeDialog"
import nodeParametersDialog from "components/dialogs/NodeParametersDialog"
import EventsListByNode from "components/EventsListByNode"

const columns = [
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node Number', align: 'left', sortable: true},
  {name: 'nodeName', field: 'nodeName', required: true, label: 'Node Name', align: 'left', sortable: true},
//  {name: 'group', field: 'group', required: true, label: 'Group', align: 'left', sortable: true},
  {name: 'moduleName', field: 'moduleName', required: true, label: 'Module Name', align: 'left', sortable: true},
//  {name: 'component', field: 'component', required: true, label: 'component', align: 'left', sortable: true},
  {name: 'mode', field: 'mode', required: true, label: 'Mode', align: 'left', sortable: true},
  {name: 'status', field: 'status', required: true, label: 'Status', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: false}
]

const store = inject('store')
const filter = ref('')
const rows = ref([])
const selected_node_valid = ref(false)
const showAddEventDialog = ref(false)
const showDeleteNodeDialog = ref(false)
const showNameNodeDialog = ref(false)
const showNodeParametersDialog = ref(false)

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
    rows.value.push(output)
  })
}

const checkNodes = () => {
  store.methods.QNN()
}

const selectNode = (nodeNumber) => {
  store.state.selected_node = nodeNumber
  store.methods.request_all_node_events(store.state.selected_node)
  selected_node_valid.value = true
  console.log('selected node', nodeNumber)
}

const editNode = (nodeId, component) => {
  store.state.selected_node = nodeId
  // will always want parameters, so update as soon as individual node id is known
  store.methods.request_all_node_parameters(store.state.selected_node, 20, 100)
  store.state.display_component = "node"
}

const deleteNode = (nodeNumber) => {
  store.state.selected_node = nodeNumber
  showDeleteNodeDialog.value=true
  console.log('selected node' + store.state.selected_node)
}

const addEvent = (nodeNumber) => {
  store.state.selected_node = nodeNumber
  console.log('add event', nodeNumber)
  showAddEventDialog.value = true
  console.log('clicked on node', store.state.selected_node)
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


const clickNameNode = (nodeNumber) => {
  console.log(`clickNameNode`)
  store.state.selected_node = nodeNumber
  showNameNodeDialog.value = true;
}

const clickParameters = (nodeNumber) => {
  console.log(`clickParameters`)
  store.state.selected_node = nodeNumber
  store.methods.request_all_node_parameters(store.state.selected_node, 20, 100)
  showNodeParametersDialog.value = true
}

const clickVariables = (nodeNumber) => {
  console.log(`clickVariables`)
  store.state.selected_node = nodeNumber
}


onBeforeMount(() => {
  //console.log(`Node onBeforeMount`)
  store.methods.QNN()
})

</script>

<style scoped>

</style>
