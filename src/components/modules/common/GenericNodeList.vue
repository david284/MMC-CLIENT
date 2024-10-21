<template>
    <q-card style="max-height: 70vh" class="scroll q-ma-md">

        <q-card-section class="no-margin q-py-none-xs" style="width: 450px;">

          <q-table
            flat bordered
            dense
            :rows="teRows"
            :columns="teColumns"
            row-key="nodeNumber"
            hide-header
            hide-bottom
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="48"
            >

            <template v-slot:body="props">
              <q-tr :props="props" class="q-my-none q-py-none">
                <q-td key="nodeNumber" :props="props">{{ props.row.nodeNumber }}</q-td>
                <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                <q-td key="actions" :props="props">
<!-- 
                  <q-btn dense class="q-mx-xs" outline :disabled="!props.row.storedEvent" color="primary" size="md" label="Variables"
                  @click="clickVariables(props.row.eventIndex, props.row.eventIdentifier)" no-caps/>
                  -->
                  <q-btn dense class="q-mx-xs" outline size="md" color="negative" label="Delete" @click="clickDelete(props.row.nodeNumber)" no-caps/>
                </q-td>
              </q-tr>
            </template>
          </q-table>


        </q-card-section>

  </q-card>
</template>

<script setup>
import {inject, ref, onBeforeMount, onMounted, onUpdated, computed, watch} from "vue";
import { date, useQuasar, scroll } from 'quasar'

const $q = useQuasar()
const store = inject('store')
const name = "GenericNodeList"

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
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]

const update_nodes_table = async () => {
//  console.log(name + `: update__nodes_table`)
  teRows.value = []
  props.nodeNumberList.forEach(nodeNumber => {
    var nodeName = store.getters.node_name(nodeNumber)
    teRows.value.push({"nodeNumber" : nodeNumber, "name" : nodeName})
  })
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



</script>

<style scoped>

</style>
