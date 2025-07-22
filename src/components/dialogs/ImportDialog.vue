<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 800px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Import
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>


        <q-card-section>
          <div class="text-h6">
            This allows the import of names, groups & modules for Events & Nodes from external files
          </div>
          <div class="text-h6">The data imported depends on the file type</div>
          <div class="text-h6">Click the info button by each file type for more details</div>
        </q-card-section>

        <q-card-section class="dense no-padding no-margin">
            <q-radio v-model="importType" val="SPREADSHEET" label="Spreadsheet import" /> &nbsp; &nbsp;
            <q-btn dense color="primary" size="sm" label="info" @click="clickSheetInfo()" no-caps/>
        </q-card-section>
        <q-card-section class="dense no-padding no-margin">
          <q-radio v-model="importType" val="FCU" label="FCU configuration file import" /> &nbsp; &nbsp;
          <q-btn dense color="primary" size="sm" label="info" @click="clickFCUInfo()" no-caps/>
        </q-card-section>

        <q-file
            v-model="importFile"
            label="Pick one file"
            filled
            style="max-width: 400px"
          />
          <q-card-section>
            <div class="text-subtitle2">
              By default, if there is any existing data for an element being imported, this is retained, and the imported data for that element is ignored
            </div>
            <div class="text-subtitle2">
              However, selecting "overwrite" will result in the import being used instead
            </div>
          </q-card-section>

          <q-card-section class="dense no-padding no-margin">
            <q-radio v-model="mode" val="retain" label="Retain any existing data" />
          </q-card-section>
          <q-card-section class="dense no-padding no-margin">
            <q-radio v-model="mode" val="overwrite" label="Overwrite existing data" />
          </q-card-section>

          <q-card-section>

          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <!-- // Only close top dialog - this gives time for underlying dialogs to update -->
            <q-btn color="positive" label="IMPORT" v-close-popup
              :disabled="!importFile"   @click="clickImport()" />
          </q-card-actions>

    </q-card>
  </q-dialog>

  <q-dialog v-model='showSheetInfo'>
    <q-card style="min-width: 800px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Import spreadsheet information
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card style="max-height: 85vh" class="scroll no-margin q-py-none">
        <q-card-section>
          <div class="text-subtitle2">
            The import will accept most spreadsheet types, such as xls, xlsx & ods, but NOT csv
            (which strictly isn't a spreadsheet format anyway)
          </div>
          <div class="text-subtitle2">
            The information for long events is expected to be on a sheet named 'Long_Events'
          </div>
          <div>
            <q-img
              src="~/assets/Long_Events_Sheet.png"
              spinner-color="white"
              style="width: 500px"
            />
          </div>
          <br>
          <div class="text-subtitle2">
            The information for short events is expected to be on a sheet named 'Short_Events', and doesn't need the 'EventNodeNumber' column
          </div>
          <div>
            <q-img
              src="~/assets/Short_Events_Sheet.png"
              spinner-color="white"
              style="width: 500px"
            />
          </div>
          <br>
          <div class="text-subtitle2">
            The node information is expected to be on a sheet named 'Nodes'.<br>
            'moduleName' is optional, and will be updated when the node connects anyway, but useful if the node isn't connected.
          </div>
          <div>
            <q-img
              src="~/assets/Nodes_sheet.png"
              spinner-color="white"
              style="width: 500px"
            />
          </div>
          <br>
          <div class="text-subtitle2">
            The channel information is expected to be on a sheet named 'Channels'.<br>
            Only 'nodeNumber', 'channelNumber' & 'channelName' are actually used by the import.<br>
            'nodeName', 'moduleName' and 'groupName' are not used by the import, and so optional.<br>
             These are populated when a spreadsheet is exported, and very useful to make the list more readable.
          </div>
          <div>
            <q-img
              src="~/assets/Channels_sheet.png"
              spinner-color="white"
              style="width: 500px"
            />
          </div>
          <br>
          <div class="text-subtitle2">
            NOTE: the column names are case sensitive and have no spaces, but the order of the columns doesn't matter, as it looks for columns by name, not position.
          </div>
          <div class="text-subtitle2">
            Additional columns with different headers are ignored, as are other sheets with different names.
          </div>
        </q-card-section>
      </q-card>
    </q-card>
  </q-dialog>

  <q-dialog v-model='showFCUInfo'>
    <q-card style="min-width: 800px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Import FCU configuration information
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      <q-card-section>
        <div class="text-subtitle2">
          FCU confiduration files contain names for events, nodes and modules, but doesn't support groups
        </div>
        <div class="text-subtitle2">
          FCU confiduration files are xml, and the elements used are as follows
        </div>
        <div class="text-subtitle2">
          For events, the elements used are: eventNode, eventValue and eventName
        </div>
        <div class="text-subtitle2">
          For nodes, the elements used are: nodeNum, nodeName and moduleName
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {importFCU} from "components/functions/ImportFunctions.js"
import {importSPREADSHEET} from "components/functions/ImportFunctions.js"
import {sleep} from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const name = "ImportDialog"
const importFile = ref()
const importType = ref("SPREADSHEET")
const mode = ref("retain")
const showFCUInfo = ref(false)
const showSheetInfo = ref(false)


const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

watch(model, () => {
  //console.log(name + `: WATCH model`)
  if (model.value){
    // now clear filename when dialog opened
    importFile.value = undefined
    importType.value = "SPREADSHEET"
    showFCUInfo.value = false
    showSheetInfo.value = false
  }
})


onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickFCUInfo = () => {
  console.log(name + `: clickFCUInfo`)
  showFCUInfo.value = true
}

const clickImport = () => {
  console.log(name + `: clickImport ` + importFile.value.name)
  var jsonResult = null
  let reader = new FileReader();
  try{
    if (importType.value == "FCU"){
      reader.readAsText(importFile.value)
      reader.onload = function() {
        importFCU(reader.result, store, mode.value)
        store.eventBus.emit('GENERAL_MESSAGE_EVENT', "import " + importFile.value.name, "successful", 'info', 0)
      }
    }
    else if (importType.value == "SPREADSHEET"){
      reader.readAsArrayBuffer(importFile.value)
      reader.onload = function() {
        importSPREADSHEET(reader.result, store, mode.value)
        store.eventBus.emit('GENERAL_MESSAGE_EVENT', "import " + importFile.value.name, "successful", 'info', 0)
      }
    }
  } catch(err){
    console.log(name + `: clickImport: ` + err)
    store.eventBus.emit('GENERAL_MESSAGE_EVENT', "import " + importFile.value.name + " failed", err, 'warning', 0)

  }
}

const clickSheetInfo = () => {
  console.log(name + `: clickSheetInfo`)
  showSheetInfo.value = true
}

</script>

<style scoped>

</style>
