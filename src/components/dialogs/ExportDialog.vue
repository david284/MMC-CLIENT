<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Export
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-section>
          <div class="text-subtitle2">
            The data exported includes node & event names
          </div>
        </q-card-section>

        <q-card style="min-width: 350px">
          <q-card-actions align="right" class="text-primary">
          <q-btn color="positive" label="Export" v-close-popup="2"  @click="clickExport()" />
          </q-card-actions>
        </q-card>

    </q-card>
  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {importFCU} from "components/functions/ImportFunctions.js"
import {createDateStamp} from "components/functions/utils.js"
import {sleep} from "components/functions/utils.js"

const $q = useQuasar()
const xlsx = require('xlsx');
const store = inject('store')
const name = "ExportDialog"
const importFile = ref()
const mode = ref("retain")


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
  }
})


onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickExport = async (filename) => {
  console.log(name + `: clickExport`)

  let eventDetails = store.state.layout.eventDetails
  let longEvents = []
  let shortEvents = []
  for (let eventIdentifier of Object.keys(eventDetails).sort()) {
    if (eventIdentifier != '00000000'){
      let output = []
      let eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
      output['eventName'] = eventDetails[eventIdentifier].name ? eventDetails[eventIdentifier].name : ''
      output['eventNodeNumber'] = eventNodeNumber
      output['eventNumber'] = parseInt(eventIdentifier.slice(4,8), 16)
      output['eventGroup'] = eventDetails[eventIdentifier].group
      if (eventNodeNumber == 0){
        delete output.eventNodeNumber // not needed for short events
        shortEvents.push(output)
      } else {
        longEvents.push(output)
      }
    }
  }

  let nodeDetails = store.state.layout.nodeDetails
  let nodes = []
  for (let nodeNumber of Object.keys(nodeDetails).sort()) {
    let output = []
    output['nodeName'] = nodeDetails[nodeNumber].name ? nodeDetails[nodeNumber].name : ''
    output['moduleName'] = nodeDetails[nodeNumber].moduleName    
    output['nodeNumber'] = parseInt(nodeNumber)
    output['nodeGroup'] = nodeDetails[nodeNumber].group
    nodes.push(output)
  }
  const longEventsWorksheet = xlsx.utils.json_to_sheet(longEvents);
  const shortEventsWorksheet = xlsx.utils.json_to_sheet(shortEvents);
  /* calculate column width */
  const long_events_max_width = longEvents.reduce((w, r) => Math.max(w, r.eventName.length), 20);
  longEventsWorksheet["!cols"] = [ { wch: long_events_max_width + 5 }, { wch: 20 }, { wch: 20 }, { wch: 20 } ];
  const short_events_max_width = shortEvents.reduce((w, r) => Math.max(w, r.eventName.length), 20);
  shortEventsWorksheet["!cols"] = [ { wch: short_events_max_width + 5 }, { wch: 20 }, { wch: 20 }, { wch: 20 } ];
  
  const nodesWorksheet = xlsx.utils.json_to_sheet(nodes);
  /* calculate column width */
  const nodes_max_width = nodes.reduce((w, r) => Math.max(w, r.nodeName.length), 20);
  nodesWorksheet["!cols"] = [ { wch: nodes_max_width + 5 }, { wch: 20 }, { wch: 20 }, { wch: 20 } ];
  
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, nodesWorksheet, "Nodes");
  xlsx.utils.book_append_sheet(workbook, longEventsWorksheet, "Long_Events");
  xlsx.utils.book_append_sheet(workbook, shortEventsWorksheet, "Short_Events");

  const fileName = store.state.layout.layoutDetails.title + ' export '+createDateStamp() + '.ods'
  xlsx.writeFile(workbook, fileName, { bookType:'ods', compression: true, cellStyles: true });

}


</script>

<style scoped>

</style>
