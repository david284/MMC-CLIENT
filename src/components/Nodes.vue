<template>
  <div>
    <!--    <div class="q-pa-md q-gutter-sm">
          <q-btn color="negative" label="Check Nodes" @click="store.methods.query_all_nodes()" no-caps/>
        </div>-->
    <div>
      <q-table
        title="Nodes"
        :rows=rows
        :columns="columns"
        :filter="filter"
        row-key="nodeNumber"
        virtual-scroll
        :rows-per-page-options="[0]"
        :virtual-scroll-sticky-size-start="48"
      >
        <template v-slot:top="">
          <div class="col-2 q-table__title text-h4">Nodes</div>
          <q-space/>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search"/>
            </template>
          </q-input>
          <q-space/>
          <q-btn color="negative" label="Check Nodes" @click="checkNodes()" no-caps/>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="nodeNumber" :class="'text-'+nodeColour(props.row.nodeNumber)" :props="props">{{ props.row.nodeNumber }}</q-td>
            <q-td key="nodeName" :props="props">{{ props.row.nodeName }}</q-td>
            <!-- <q-td key="group" :props="props">{{ props.row.group }}</q-td> -->
            <q-td key="moduleName" :props="props">{{ props.row.moduleName }}</q-td>
            <!-- <q-td key="component" :props="props">{{ props.row.component }}</q-td> -->
            <q-td key="mode" :props="props">
              <q-chip color="white" text-color="amber" v-if="props.row.mode">Flim</q-chip>
              <q-chip color="white" text-color="green" v-else>Slim</q-chip>
            </q-td>
            <q-td key="status" :props="props">
              <q-chip color="white" text-color="green" v-if="props.row.status">OK</q-chip>
              <q-chip color="white" text-color="red" v-else>Error</q-chip>
            </q-td>
            <q-td key="actions" :props="props">
              <q-btn color="primary" flat rounded label="Edit"
                     @click="editNode(props.row.nodeNumber, props.row.component)" no-caps/>
              <q-btn color="negative" flat rounded label="Delete"
                     @click="deleteNode(props.row.nodeNumber)" no-caps/>
            </q-td>
          </q-tr>
        </template>
      </q-table>

      <p v-if="store.state.debug">
        {{ Object.values(store.state.nodes) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import {inject, ref, onBeforeMount, computed, watch} from "vue";
import { useQuasar } from 'quasar'

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

const nodeList = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.nodes)
})

watch(nodeList, () => {
//  console.log(`WATCH Nodes`)
  update_rows()
})


const update_rows = () => {
  rows.value = []
  nodeList.value.forEach(node => {
    //console.log(node)
    let output = {}
    output['nodeNumber'] = node.nodeNumber
    output['nodeName'] = nodeName(node.nodeNumber)
//    output['group'] = nodeGroup(node.nodeNumber)
    output['moduleName'] = node.moduleName
    output['component'] = node.component
    output['status'] = node.status
    output['mode'] = node.flim
    rows.value.push(output)
  })
}

const checkNodes = () => {
  store.methods.query_all_nodes()
}


const editNode = (nodeId, component) => {
  store.state.selected_node = nodeId
  // will always want parameters, so update as soon as individual node id is known
  store.methods.request_all_node_parameters(store.state.selected_node, 20, 100)
  store.state.display_component = "node"
}

const deleteNode = (nodeId) => {
  store.methods.remove_node(nodeId)
}

const nodeName = (nodeId) => {
  if (nodeId in store.state.layout.nodeDetails) {
    return store.state.layout.nodeDetails[nodeId].name
  } else {
    return nodeId.toString()+' - '+store.state.nodes[nodeId].moduleName
  }
}

const nodeColour = (nodeId) => {
  if (nodeId in store.state.layout.nodeDetails) {
    return store.state.layout.nodeDetails[nodeId].colour
  } else {
    return 'blue'
  }
}

const nodeGroup = (nodeId) => {
  if (nodeId in store.state.layout.nodeDetails) {
    return store.state.layout.nodeDetails[nodeId].group
  } else {
    return ''
  }
}

onBeforeMount(() => {
  //console.log(`Node onBeforeMount`)
  store.methods.query_all_nodes()
})

</script>

<style scoped>

</style>
