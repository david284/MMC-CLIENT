<template>
    <q-card style="max-height: 70vh" class="scroll q-ma-md">

        <q-card-section class="no-margin q-py-none-xs" style="width: 450px;">

          <q-table
            flat bordered
            dense
            :rows="teRows"
            :columns="teColumns"
            row-key="nodeNumber"
            hide-bottom
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="48"
            >

            <template v-slot:body="props">
              <q-tr :props="props" class="q-my-none q-py-none">
                <q-td key="nodeNumber" :props="props">{{ props.row.nodeNumber }}</q-td>
                <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                <q-td key="group" :props="props">{{ props.row.group }}</q-td>
                <q-td key="actions" :props="props">
                  <q-btn dense class="q-mx-xs" outline color="primary" size="md" label="Variables"
                    @click="clickVariables(props.row.nodeNumber)" no-caps/>
                  <q-btn dense class="q-mx-xs" outline size="md" color="negative" label="Delete" @click="clickDelete(props.row.nodeNumber)" no-caps/>
                </q-td>
              </q-tr>
            </template>
          </q-table>


        </q-card-section>

  </q-card>

  <EventVariablesDialog v-model='showEventVariablesDialog'
    :nodeNumber = selected_nodeNumber
    :eventIdentifier = eventIdentifier
  />

  <NodeParametersLoadingDialog v-model='showNodeParametersLoadingDialog'
    :nodeNumber = selected_nodeNumber
    @NodeParametersLoadingDialog="nodeParametersLoadingReturn = $event"
  />

  <NodeVariablesLoadingDialog v-model='showNodeVariablesLoadingDialog'
    :nodeNumber = selected_nodeNumber
    @NodeVariablesLoadingDialog="nodeVariablesLoadingReturn = $event"
  />


</template>

<script setup>
import {inject, ref, onBeforeMount, onMounted, onUpdated, computed, watch} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import NodeParametersLoadingDialog from "components/dialogs/NodeParametersLoadingDialog"
import NodeVariablesLoadingDialog from "components/dialogs/NodeVariablesLoadingDialog"
import EventVariablesDialog from "components/dialogs/EventVariablesDialog"

const $q = useQuasar()
const store = inject('store')
const name = "GenericNodeList"
const showEventVariablesDialog = ref(false)
const selected_nodeNumber = ref(0)
const showNodeVariablesLoadingDialog = ref(false)
const showNodeParametersLoadingDialog = ref(false)
const nodeParametersLoadingReturn = ref('')
const nodeVariablesLoadingReturn = ref('')

const props = defineProps({
  nodeNumberList: {
    type: Object,
    required: true
  },
  eventIdentifier:{
    type: String,
    required: true
  }
})


const teRows = ref([])

const teColumns = [
  {name: 'nodeNumber', field: 'nodeNumber', required: true, label: 'Node Number', align: 'left', sortable: true},
  {name: 'name', field: 'name', required: true, label: 'Name', align: 'left', sortable: true},
  {name: 'group', field: 'group', required: true, label: 'Node Group', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]

const update_nodes_table = async () => {
//  console.log(name + `: update__nodes_table`)
  teRows.value = []
  props.nodeNumberList.forEach(nodeNumber => {
    var nodeName = store.getters.node_name(nodeNumber)
    teRows.value.push({
      "nodeNumber" : nodeNumber, 
      "name" : nodeName,
      "group" : store.getters.node_group(nodeNumber)
    })
  })
}


const checkNodeParameters = async (nodeNumber) => {
  nodeParametersLoadingReturn.value=''
  showNodeParametersLoadingDialog.value = true
  // wait for parameters to load
  for (let i = 0; i < 1000; i++){
     if (nodeParametersLoadingReturn.value.length > 0) break
     await sleep (10)
  }
  showNodeParametersLoadingDialog.value = false
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


onBeforeMount(() => {
//  console.log(name + `: onBeforeMount`)
})

onMounted(() => {
//  console.log(name + ': props: ' + JSON.stringify(props))
})

onUpdated(() => {
//  console.log(name + `: onUpdated`)
  update_nodes_table()
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickDelete = (nodeNumber) => {
  console.log(name + `: clickDelete`)
  const result = $q.notify({
    message: 'Are you sure you want to delete this event?',
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => { 
        console.log(`removeEvent ` + nodeNumber + ' ' + props.eventIdentifier)
        store.methods.remove_event(nodeNumber, props.eventIdentifier)
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}


const clickVariables = async (nodeNumber) => {
  console.log(name + `: clickVariables: node ` + nodeNumber + ' eventIdentifer ' + props.eventIdentifier)
  selected_nodeNumber.value = nodeNumber
  await checkNodeParameters(nodeNumber)
  await checkNodeVariables(nodeNumber)
  store.methods.request_event_variables_by_identifier(nodeNumber, props.eventIdentifier)
  showEventVariablesDialog.value = true
}


</script>

<style scoped>

</style>
