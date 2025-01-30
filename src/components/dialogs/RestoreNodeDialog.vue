<template>
  <q-dialog v-model="model" persistent>

    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 900px" class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Restore Node: {{ store.getters.node_name(nodeNumber) }} 
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <div style="max-height: 85vh" class="scroll no-margin no-padding">

      <div class="q-pa-md row" style="max-height: 80vh">

        <q-card flat inline class="q-pa-none q-ma-none" style="width: 400px">
          <div class="text-h6">List of Backups</div>
          <q-card-section style="max-height: 75vh" class="scroll no-margin q-pa-xs">

            <q-table
              class="restore-node-table"
              dense
              :rows="teRows"
              :columns="teColumns"
              row-key="name"
              virtual-scroll
              :rows-per-page-options="[0]"
              :virtual-scroll-sticky-size-start="0"
              hide-header
              hide-bottom
            >
              <template #body-cell="props">
                <q-td :props="props" >
                  <q-btn
                    flat
                    color="primary"
                    :label="props.value"
                    @click="clickBackupList(props.value)"
                  />
                </q-td>
                <q-td >
                  <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="xs" label="Rename"
                  @click="prompt = true" no-caps />
                  <q-btn dense class="q-mx-xs q-my-none" outline color="negative" size="xs" label="Delete"
                  @click="clickDelete(props.value)" no-caps />
                </q-td>
              </template>
            </q-table>          
          </q-card-section>
        </q-card>


        <q-card flat inline class="q-pa-none q-ma-sm" style="width: 400px">

          <q-card-section style="height: 50px" class="text-subtitle2">
            This node - Module Name: {{ store.getters.module_name(nodeNumber) }}
          </q-card-section>
          <q-card style="height: 70px;" class="q-pa-sm q-ma-sm">
            <div class="text-primary">Selected Backup</div>
            <div class="text-h6">
              {{ backupFilename }}
            </div>
          </q-card>
          <!-- margin outside, padding inside border -->
          <q-card class="q-pa-sm q-ma-sm">
            <div class="text-primary">Backup file</div>
            <div class="text-subtitle2">Module name: {{ moduleName }}</div>
            <div class="text-subtitle2">Number of Node variables: {{ numberOfNVs }}</div>
            <div class="text-subtitle2">Number of Events: {{ numberOfEvents }}</div>
            <div class="text-subtitle2">Number of Event variables: {{ numberOfEVs }}</div>
          </q-card>
          <q-card style="height: 100px" class="q-pa-sm q-ma-sm">
            <div class="text-primary">status</div>
            <div class="text-subtitle2">{{ restoreStatus }}</div>
            <q-spinner-orbit v-if="inProgress"
              color="primary"
              size="2em"
            />
          </q-card>



        <q-card-section>
          <q-card-actions align="center">
            <q-btn :disabled="!ready" color="primary" label="Restore Node" @click="clickRestore()"/>
          </q-card-actions>
        </q-card-section>


        </q-card>

      </div>

      <q-card class="no-margin no-padding">
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Toggle node json" @click="clickToggleNodeJSON()"/>
        </q-card-actions>
        <q-card-section v-if="showNodeJSON" style="width: 350px" class="text-body2 no-margin no-padding">
          <pre>{{ restoredNode }}</pre>
        </q-card-section>
      </q-card>

    </div>

    </q-card>

  </q-dialog>

  <q-dialog v-model="prompt" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">enter new filename</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input dense v-model="newFilename" autofocus @keyup.enter="prompt = false"></q-input>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Close" v-close-popup></q-btn>
        <q-btn flat label="change Filename" @click="clickChangeFilename()" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>


</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import {sleep} from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const name = "RestoreNodeDialog"
const backupFilename = ref("")
const ready = ref(false)
const restoredNode = ref("")
const showNodeJSON = ref(false)
const teRows = ref([])
const moduleName = ref("")
const numberOfNVs = ref("")
const numberOfEvents = ref("")
const numberOfEVs = ref("")
const restoreStatus = ref("awaiting backup selection")
const inProgress = ref(false)
const prompt = ref(false)
const newFilename = ref("")


const teColumns = [
  {name: 'backup', field: 'backup', required: true, label: 'backup', align: 'left', sortable: true},
]

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  //console.log(name + `: WATCH model`)
  if (model.value){
    backupFilename.value = undefined
    ready.value = false
    moduleName.value = ""
    numberOfNVs.value = ""
    numberOfEvents.value = ""
    numberOfEVs.value = ""
    inProgress.value = false
    store.methods.request_node_backups_list(store.state.layout.layoutDetails.title, props.nodeNumber)
    store.state.restoredData = {}
  }
})

const restoredData = computed(() => {
    return store.state.restoredData
})

watch(restoredData, () => {
  //console.log(name + `: WATCH restoredData`)
  try {
    restoredNode.value = restoredData.value.nodeConfig.nodes[props.nodeNumber]
    moduleName.value = restoredNode.value.moduleName
    numberOfNVs.value = restoredNode.value.parameters[6]
    numberOfEvents.value = restoredNode.value.eventCount
    numberOfEVs.value = restoredNode.value.parameters[5]
  } catch (err) {
    console.log(name + `: WATCH restoredData ` + err)
    restoredNode.value = {}
    moduleName.value = ""
    numberOfNVs.value = ""
    numberOfEvents.value = ""
    numberOfEVs.value = ""
  }
})

const backupList = computed(() => {
  return store.state.backups_list
})

// need to update when new layout added
watch(backupList, () => {
  //console.log(name + `: WATCH backupList`)
  updateBackupList()
})

const updateBackupList = () => {
  teRows.value = []
  backupList.value.forEach(backup => {
    //console.log(name + `: update ` + backup)
    teRows.value.push({"backup" : backup})
  })
}

const restoreNodeVariables = async () => {
  console.log(name + ': restoreNodeVariables')
  restoreStatus.value = "restoring Node Variables"
  inProgress.value = true
  try{
    let nodeVariables = restoredNode.value.nodeVariables
    for (let i=1; i<nodeVariables.length-1; i++){
      //console.log(name + `: Node variable ${i} ${nodeVariables[i]}`)
      store.methods.update_node_variable(props.nodeNumber, i, nodeVariables[i])
      await sleep(100)  // allow a little time between requests
    }
  } catch (err){
    console.log(name + ': restoreNodeVariables: ' + err)
  }

  await sleep(1000)

  while ((Date.now() - store.state.cbusTrafficTimeStamp) < 1000) {
    await sleep(100)
  }
  inProgress.value = false
}

const restoreEvents = async () => {
  console.log(name + ': restoreEvents')
  restoreStatus.value = "restoring Event Variables"
  inProgress.value = true
  try{
    var storedEventsNI = Object.values(restoredNode.value.storedEventsNI)
    storedEventsNI.forEach(event => {
      console.log(name + ': restoreEvents: ' + event.eventIdentifier)
      restoreEventVariables(event.eventIdentifier)
    })   
  } catch (err){
    console.log(name + ': restoreEvents: ' + err)
  }

  await sleep(2000)

  while ((Date.now() - store.state.cbusTrafficTimeStamp) < 1000) {
    await sleep(100)
  }
  inProgress.value = false

}

const restoreEventVariables = async (eventIdentifier) => {
  console.log(name + ': restoreEventVariables ' + eventIdentifier)
  try{
    let eventVariables = restoredNode.value.storedEventsNI[eventIdentifier].variables
    // ensure variables are restored in ascending index order
    for (let index of Object.keys(eventVariables).sort(function(a, b){return a - b})) {
      if (index > 0)
      {
        let variable = restoredNode.value.storedEventsNI[eventIdentifier].variables[index]
        console.log(name + `: restoreEventVariables: ${index} ${variable}` )
        store.methods.event_teach_by_identifier(props.nodeNumber, eventIdentifier, index, variable)
        await sleep(50)  // allow a little time between requests
      }

    }

  } catch (err){
    console.log(name + ': restoreEventVariables: ' + err)
  }
}



onBeforeMount(() => {
})

onMounted(() => {
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/
//
//
const clickChangeFilename = () => {
  console.log(name + ': clickChangeFilename ', newFilename.value)
}


//
//
const clickBackupList = (row) => {
  console.log(name + ': clickBackupList on ', row)
  backupFilename.value = row
  store.methods.request_node_backup(store.state.layout.layoutDetails.title, props.nodeNumber, backupFilename.value)
  ready.value = true
  restoreStatus.value = "ready to restore"
}

//
//
const clickDelete = (fileName) => {
  console.log(name + ': clickDelete ', fileName)
  const result = $q.notify({
    message: 'Are you sure you want to delete backup ' + fileName,
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => { 
        store.methods.delete_node_backup(
          store.state.layout.layoutDetails.title, 
          props.nodeNumber, 
          fileName)
        await sleep(50)     // allow a bit of a delay for the change
        store.methods.request_node_backups_list(store.state.layout.layoutDetails.title, props.nodeNumber)
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

//
//
const clickRestore = async (row) => {
  ready.value = false
  console.log(name + ': clickRestore')
  restoreStatus.value = "restore in progress"
  await restoreNodeVariables()
  await restoreEvents()
  restoreStatus.value = "restore complete\n(select a backup to run again)"
}

//
//
const clickToggleNodeJSON = () => {
  console.log(name + `: clickToggleNodeJSON`)
  showNodeJSON.value  = showNodeJSON.value ? false : true
}



</script>

<style lang="sass">
.restore-node-table
  /* height or max-height is important */
  max-height: 65vh

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
