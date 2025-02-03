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

  let rows = [
    { name: "George Washington", birthday: "1732-02-22" },
    { name: "John Adams", birthday: "1735-10-19" }
  ]

  /*
  let events = [
    {"event": "00000001", 
      "colour": "black",
      "group": "",
      "name": "Short event 1"
    },
    {"event": "00000002",
      "colour": "black",
      "group": "",
      "name": "Short event 2"
    }
  ]
    */

//  console.log (name + ': rows ' + JSON.stringify(events))

  let eventDetails = store.state.layout.eventDetails
  let events = []
  for (let eventIdentifier of Object.keys(eventDetails).sort()) {
    let output = []
    output['eventName'] = eventDetails[eventIdentifier].name ? eventDetails[eventIdentifier].name : ''
    output['nodeNumber'] = parseInt(eventIdentifier.slice(0,3), 16)
    output['eventNumber'] = parseInt(eventIdentifier.slice(4,8), 16)
    output['group'] = eventDetails[eventIdentifier].group
    events.push(output)
  }

  let nodeDetails = store.state.layout.nodeDetails
  let nodes = []
  for (let nodeNumber of Object.keys(nodeDetails).sort()) {
    let output = []
    output['nodeName'] = nodeDetails[nodeNumber].name ? nodeDetails[nodeNumber].name : ''
    output['moduleName'] = nodeDetails[nodeNumber].moduleName    
    output['nodeNumber'] = nodeNumber
    output['group'] = nodeDetails[nodeNumber].group
    nodes.push(output)
  }

  const eventsWorksheet = xlsx.utils.json_to_sheet(events);
  /* calculate column width */
  const events_max_width = events.reduce((w, r) => Math.max(w, r.eventName.length), 20);
  eventsWorksheet["!cols"] = [ { wch: events_max_width + 5 }, { wch: 20 }, { wch: 20 }, { wch: 20 } ];
  
  const nodesWorksheet = xlsx.utils.json_to_sheet(nodes);
  /* calculate column width */
  const nodes_max_width = nodes.reduce((w, r) => Math.max(w, r.nodeName.length), 20);
  nodesWorksheet["!cols"] = [ { wch: events_max_width + 5 }, { wch: 20 }, { wch: 20 }, { wch: 20 } ];
  
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, eventsWorksheet, "Events");

  xlsx.utils.book_append_sheet(workbook, nodesWorksheet, "Nodes");

  const fileName = store.state.layout.layoutDetails.title + ' export.ods'
  xlsx.writeFile(workbook, fileName, { bookType:'ods', compression: true, cellStyles: true });

  /*
    await sleep(500)
    let text = JSON.stringify(store.state.exported_MDF, null, "  ")
    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
    */
  }


</script>

<style scoped>

</style>
