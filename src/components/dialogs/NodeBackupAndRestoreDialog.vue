<template>
  <q-dialog v-model="model" persistent>

    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 1000px" class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Backup & Restore Node: {{ store.getters.node_name(nodeNumber) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card align="right" flat inline class="row">
        <q-space /><q-space /><q-space />
        <div class="text-h6">Backup this node</div>
        &nbsp;
        <q-card-actions >
          <q-btn color="primary" label="backup" @click="clickBackup()"></q-btn>
        </q-card-actions>
        <q-space />
      </q-card>

      <q-separator/>
      <div style="max-height: 80vh" class="scroll no-margin no-padding">

      <div class="q-pa-md row" style="max-height: 70vh">

        <q-card flat inline class="q-pa-none q-ma-none" style="width: 500px">
          <div class="text-h6">Select a backup from the list to download or restore</div>
          <q-card-section style="max-height: 70vh" class="scroll no-margin q-pa-xs">

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
                  <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="sm" label="Rename"
                  @click="() => {oldFilename = props.value; prompt = true;}" no-caps />
                  <q-btn dense class="q-mx-xs q-my-none" outline color="negative" size="sm" label="Delete"
                  @click="clickDelete(props.value)" no-caps />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>


        <q-card flat inline class="q-pa-none q-ma-sm" style="max-width: 400px">

          <q-card-section style="height: 50px" class="text-subtitle2">
            Restore node {{ nodeNumber }} - Module Name: {{ store.getters.module_name(nodeNumber) }}
          </q-card-section>
          <q-card style="height: 70px;" class="q-pa-sm q-ma-sm">
            <div class="text-primary">Selected Backup</div>
            <div class="text-subtitle2">
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

        </q-card>

      </div>

      <q-card-section>
        <q-card-actions>
          <q-btn color="primary" label="Upload Backup" @click="clickUpload()"/>
          <div class="text-body"> &nbsp; Upload an external backup file</div>
          <q-space />
          <q-btn :disabled="!ready" color="primary" label="Download Backup" @click="clickDownload()"/>
          <q-btn :disabled="!ready" color="primary" label="Restore Node" @click="clickRestore()"/>
        </q-card-actions>
      </q-card-section>


      <q-card class="no-margin no-padding">
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Toggle backup json" @click="clickToggleBackupJSON()"/>
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
        <div class="text-h6">enter new filename for {{ oldFilename }}</div>
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

  <q-dialog v-model="showUploadDialog" persistent>
    <q-card style="min-width: 350px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Upload external backup file
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>
        <q-card-section>
          <div class="text-body">
            click below to select backup file to upload
          </div>
        </q-card-section>
        <q-file
          v-model="uploadFile"
          label="Pick one file"
          filled
          style="max-width: 300px"
        />
        <q-card-section>
          <div class="text-body">
            Note that the uploaded file name will have an updated timestamp
          </div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <!-- // Only close top dialog - this gives time for underlying dialogs to update -->
          <q-btn :disabled="!uploadFile" color="positive" label="Upload" v-close-popup  @click="actionUpload()" />
        </q-card-actions>

    </q-card>
  </q-dialog>

  <NodeBackupDialog v-model='showNodeBackupDialog'
    :nodeNumber = nodeNumber
  />

</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import * as utils from "components/functions/utils.js"
import * as eventFunctions from "components/functions/EventFunctions.js"
import NodeBackupDialog from "components/dialogs/NodeBackupDialog"

const $q = useQuasar()
const store = inject('store')
const name = "NodeBackupAndRestoreDialog"
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
const showUploadDialog = ref(false)
const uploadFile = ref()
const newFilename = ref("")
const oldFilename = ref("")
const showNodeBackupDialog = ref(false)

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
  //utils.timeStampedLog(name + `: WATCH model`)
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
  //utils.timeStampedLog(name + `: WATCH restoredData`)
  try {
    restoredNode.value = restoredData.value.backupNode
    moduleName.value = restoredNode.value.moduleName
    numberOfNVs.value = restoredNode.value.parameters[6]
    numberOfEvents.value = restoredNode.value.eventCount
    numberOfEVs.value = restoredNode.value.parameters[5]
  } catch (err) {
    utils.timeStampedLog(name + `: WATCH restoredData ` + err)
    restoredNode.value = {}
    moduleName.value = ""
    numberOfNVs.value = ""
    numberOfEvents.value = ""
    numberOfEVs.value = ""
  }
})


//
//
const backupList = computed(() => {
  return store.state.backups_list
})

// need to update when new layout added
watch(backupList, () => {
  //utils.timeStampedLog(name + `: WATCH backupList`)
  updateBackupList()
})

const updateBackupList = () => {
  teRows.value = []
  backupList.value.forEach(backup => {
    //utils.timeStampedLog(name + `: update ` + backup)
    teRows.value.push({"backup" : backup})
  })
}

//
//
const restoreNodeVariables = async () => {
  utils.timeStampedLog(name + ': restoreNodeVariables')
  restoreStatus.value = "restoring Node Variables"
  inProgress.value = true
  try{
    let nodeVariables = restoredNode.value.nodeVariables
    // ensure variables are restored in ascending index order
    for (let index of Object.keys(nodeVariables).sort(function(a, b){return a - b})) {
      if (index > 0)
      {
        let variable = nodeVariables[index]
        utils.timeStampedLog(name + `: restoreNodeVariables: ${index} ${variable}` )
        let reLoad = false  // don't reLoad variables after teaching
        store.methods.update_node_variable(props.nodeNumber, index, variable, reLoad)
        await utils.sleep(100)  // allow a little time between requests
      }
    }
  } catch (err){
    utils.timeStampedLog(name + ': restoreNodeVariables: ' + err)
  }

  await utils.sleep(2000)

  while ((Date.now() - store.state.cbusTrafficTimeStamp) < 500) {
    await utils.sleep(100)
  }
  inProgress.value = false
}

//
//
const restoreEventsByIdentifier = async () => {
  utils.timeStampedLog(name + ': restoreEventsByIdentifier')
  inProgress.value = true
  try{
    // first remove all existing events - even if there's no events in the backup
    restoreStatus.value = "erasing Events"
    store.methods.delete_all_events(props.nodeNumber)
    await utils.sleep(2000)  // allow a little time for this to take effect
    //
    restoreStatus.value = "restoring Events & Variables"
    //
    // don't use forEach, as couldn't get it to work with async/await
    var storedEventsNI = restoredNode.value.storedEventsNI
    utils.timeStampedLog(name + `: restoreEventsByIdentifier: storedEventsNI ${JSON.stringify(storedEventsNI)}` )
    for(const eventIdentifier in storedEventsNI){
      utils.timeStampedLog(name + ': restoreEventsByIdentifier: ' + eventIdentifier)
      //await restoreEventVariablesByIdentifier(eventIdentifier)
      let eventVariables = restoredNode.value.storedEventsNI[eventIdentifier].variables
      let eventIndex = restoredNode.value.storedEventsNI[eventIdentifier].eventIndex
      await eventFunctions.restoreEventVariables(store, props.nodeNumber, eventIdentifier, eventIndex, eventVariables )
    }
  } catch (err){
    utils.timeStampedLog(name + `: restoreEventsByIdentifier: ${err}`)
  }
  await utils.sleep(2000)
  while ((Date.now() - store.state.cbusTrafficTimeStamp) < 1000) {
    await utils.sleep(100)
  }
  inProgress.value = false
}

//
//
const restoreEventsByIndex = async () => {
  utils.timeStampedLog(name + ': restoreEventsByIndex')
  inProgress.value = true
  try{
    // first remove all existing events - even if there's no events in the backup
    restoreStatus.value = "erasing Events"
    store.methods.delete_all_events(props.nodeNumber)
    await utils.sleep(2000)  // allow a little time for this to take effect
    //
    restoreStatus.value = "restoring Events & Variables"
    // node uses indexed events
    for(const eventIndex in restoredNode.value.eventsByIndex){
      utils.timeStampedLog(name + `: restoreEvents: eventIndex ${eventIndex}` )
      let defaultEventIdentifier = utils.decToHex(props.nodeNumber, 4) + utils.decToHex(eventIndex, 4)
      let newEventIdentifier = restoredNode.value.eventsByIndex[eventIndex].eventIdentifier
      if (newEventIdentifier == defaultEventIdentifier){
        // matches default entry, so don't bother writing back
        utils.timeStampedLog(name + `: restoreEventsByIndex: ${eventIndex} default ${defaultEventIdentifier}` )
      } else {
        // modified entry, so need to write it
        utils.timeStampedLog(name + `: restoreEventsByIndex: ${eventIndex} default ${defaultEventIdentifier} new ${newEventIdentifier}` )
        // we're just updating the eventIdentifier here, so event variable index & value set to 0
        eventFunctions.eventTeach(
          store,
          props.nodeNumber,
          newEventIdentifier,
          eventIndex,
          0,
          0,
          false,
        )
      }
      // does it support any event variables?
      if (store.getters.node_eventCapacity(props.nodeNumber) > 0){
        utils.timeStampedLog(name + `: restoreEventsByIndex: Indexed variables ` )
        // so lets restore the event variables in the backup for this event
        let eventVariables = restoredNode.value.eventsByIndex[eventIndex].variables
        await eventFunctions.restoreEventVariables(store, props.nodeNumber, newEventIdentifier, eventIndex, eventVariables )
      }
    }
  } catch (err){
    utils.timeStampedLog(name + `: restoreEventsByIndex: ${err}`)
  }
  await utils.sleep(2000)
  while ((Date.now() - store.state.cbusTrafficTimeStamp) < 1000) {
    await utils.sleep(100)
  }
  inProgress.value = false
}


//
//
const restoreEventVariablesByIdentifier = async (eventIdentifier) => {
  //utils.timeStampedLog(name + ': restoreEventVariables ' + eventIdentifier)
  try{
    let eventVariables = restoredNode.value.storedEventsNI[eventIdentifier].variables
    // ensure variables are restored in ascending index order
    for (let index of Object.keys(eventVariables).sort(function(a, b){return a - b})) {
      if (index > 0)
      {
        let variable = restoredNode.value.storedEventsNI[eventIdentifier].variables[index]
        //utils.timeStampedLog(name + `: restoreEventVariables: ${index} ${variable}` )
        let reLoad = false  // don't reLoad variables after teaching
        store.methods.event_teach_by_identifier(props.nodeNumber, eventIdentifier, index, variable, reLoad)
        await utils.sleep(200)  // allow a little time between requests
      }
    }
  } catch (err){
    utils.timeStampedLog(name + ': restoreEventVariables: ' + err)
  }
}



onBeforeMount(() => {
})

onMounted(() => {
})

store.eventBus.on('NODE_BACKUP_COMPLETED', () => {
  if (model.value){
    store.methods.request_node_backups_list(store.state.layout.layoutDetails.title, props.nodeNumber)
  }
})

store.eventBus.on('NODE_BACKUP_SAVED', (filename) => {
  if (model.value){
    $q.notify({
      message: 'Backup saved',
      caption: filename,
      timeout: 2000,
      position: 'center',
      color: 'primary',
      actions: [
        { label: 'dismiss', color: 'white', handler: () => { /* ... */ } }
      ]
    })
  }
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const actionUpload = async() => {
  utils.timeStampedLog(name + `: actionUpload`)

  var result = {}
  if (uploadFile.value){
    var fileName = uploadFile.value.name
    utils.timeStampedLog(name + ': selected filename ' + fileName)
    let reader = new FileReader();
    reader.readAsText(uploadFile.value)
    reader.onload = async function() {
      try{
        var resultOBJ = JSON.parse(reader.result)
        store.methods.save_node_backup(props.nodeNumber, resultOBJ.backupNode)
        await utils.sleep(500)
        store.methods.request_node_backups_list(store.state.layout.layoutDetails.title, props.nodeNumber)
      } catch(e){
        $q.notify({
          message: 'backup file upload has failed',
          caption: 'please check the file is valid JSON, and try again',
          timeout: 0,
          type: 'warning',
          position: 'center',
          actions: [ { label: 'Dismiss' } ]
        })
      }
    }
    uploadFile.value=null
  } else {
    utils.timeStampedLog(name + `: actionUpload: uploadFile no value `)
  }
}

//
//
const clickBackup = async() => {
  utils.timeStampedLog(name + `: clickBackup`)
  showNodeBackupDialog.value = true
}

//
//
const clickChangeFilename = async() => {
  utils.timeStampedLog(name + `: clickChangeFilename ${oldFilename.value} ${newFilename.value}`)
  if (newFilename.value.length > 0){
    // rename_node_backup should invoke a new list to be returned
    store.methods.rename_node_backup(store.state.layout.layoutDetails.title, props.nodeNumber, oldFilename.value, newFilename.value)
  }
  newFilename.value = ""
}


//
//
const clickBackupList = (row) => {
  utils.timeStampedLog(name + ': clickBackupList on ', row)
  backupFilename.value = row
  store.methods.request_node_backup(store.state.layout.layoutDetails.title, props.nodeNumber, backupFilename.value)
  ready.value = true
  restoreStatus.value = "ready to restore"
}

//
//
const clickDelete = (fileName) => {
  utils.timeStampedLog(name + ': clickDelete ', fileName)
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
        await utils.sleep(50)     // allow a bit of a delay for the change
        store.methods.request_node_backups_list(store.state.layout.layoutDetails.title, props.nodeNumber)
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

const clickDownload = async () => {
  utils.timeStampedLog(name + `: clickDownload ${backupFilename.value}`)

  let text = JSON.stringify(store.state.restoredData, null, "  ")

  let element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', backupFilename.value);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);

}

//
//
const clickUpload = () => {
  utils.timeStampedLog(name + `: clickImport`)
  showUploadDialog.value = true

  //store.methods.save_node_backup(props.nodeNumber, store.state.nodes[props.nodeNumber])

}

//
//
const clickRestore = async (row) => {
  ready.value = false
  utils.timeStampedLog(name + ': clickRestore')
  // check the module name matches
  if (moduleName.value == store.getters.module_name(props.nodeNumber)) {
    restoreStatus.value = "restore in progress"
    await restoreNodeVariables()
    if (store.getters.node_useEventIndex(props.nodeNumber) == true)  {
      await restoreEventsByIndex()
    } else {
      await restoreEventsByIdentifier()
    }
    // now lets reset the node
    restoreStatus.value = "node resetting"
    store.methods.reset_node(props.nodeNumber)
    // allow 2 seconds for module to restart
    await utils.sleep(2000)
    // now lets refresh all node variables
    store.methods.request_all_node_variables(
      props.nodeNumber,
      store.state.nodes[props.nodeNumber].parameters[6]
    )
    await utils.sleep(1000)
    // now lets refresh all events
    eventFunctions.requestAllNodeEvents(store, props.nodeNumber)
    restoreStatus.value = "restore complete\n(select a backup to run again)"
  } else {
    const result = $q.notify({
      message: 'backup module name \'' + moduleName.value + '\' doesnt match restore module name',
      caption: 'restore module name \'' + store.getters.module_name(props.nodeNumber) + '\'',
      timeout: 0,
      position: 'center',
      color: 'negative"',
      multiLine: true,
      actions: [
        { label: 'dismiss', color: 'white', handler: () => { /* ... */ } }
      ]
    })
  }
}

//
//
const clickToggleBackupJSON = () => {
  utils.timeStampedLog(name + `: clickToggleBackupJSON`)
  showNodeJSON.value  = showNodeJSON.value ? false : true
}



</script>

<style lang="sass">
.restore-node-table
  /* height or max-height is important */
  max-height: 55vh

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
