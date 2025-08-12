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
          <div class="text-subtitle2">
            The export data does not include node configuration & events, use node backup for that
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

//
//

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {importFCU} from "components/functions/ImportFunctions.js"
import {createDateStamp} from "components/functions/utils.js"
import {sleep} from "components/functions/utils.js"
import { getNumberOfChannels } from "../functions/NodeFunctions";
import {timeStampedLog} from "components/functions/utils.js"



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
  //timeStampedLog(name + `: WATCH model`)
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
  timeStampedLog(name + `: clickExport`)

  //
  // Uses sheetsjs
  // Unfortunately, column centering is not in the free edition
  //

  // Events
  //
  let eventDetails = store.state.layout.eventDetails
  let longEvents = []
  let shortEvents = []
  for (let eventIdentifier of Object.keys(eventDetails).sort()) {
    if (eventIdentifier != '00000000'){
      let output = {}
      let eventNodeNumber = parseInt(eventIdentifier.slice(0,4), 16)
      output['eventName'] = eventDetails[eventIdentifier].name ? eventDetails[eventIdentifier].name : ''
      if (eventNodeNumber != 0){
        output['eventNodeNumber'] = eventNodeNumber   // only for long events
      }
      output['eventNumber'] = parseInt(eventIdentifier.slice(4,8), 16)
      output['eventGroup'] = eventDetails[eventIdentifier].group ? eventDetails[eventIdentifier].group : ''
      if (eventNodeNumber == 0){
        shortEvents.push(output)
      } else {
        longEvents.push(output)
      }
    }
  }

  // Nodes
  //
  let nodeDetails = store.state.layout.nodeDetails
  let channels = []
  let nodes = []
  for (let nodeNumber of Object.keys(nodeDetails).sort(function(a, b){return a - b})) {
    let output = {}
    output['nodeName'] = nodeDetails[nodeNumber].name ? nodeDetails[nodeNumber].name : ''
    output['moduleName'] = nodeDetails[nodeNumber].moduleName ? nodeDetails[nodeNumber].moduleName : ''
    output['nodeNumber'] = parseInt(nodeNumber)
    output['nodeGroup'] = nodeDetails[nodeNumber].group ? nodeDetails[nodeNumber].group : ''
    //timeStampedLog(name + `: clickExport: nodeDetail output1 ${JSON.stringify(output)}`)
    nodes.push(output)
    try{
      let numberOfChannels = getNumberOfChannels(store, nodeNumber)
      //timeStampedLog(name + `: clickExport: node ${nodeNumber} number of channels ${numberOfChannels}`)
      for (var i= 1; i <= numberOfChannels; i++){
        let channelOutput = {}
        channelOutput['nodeNumber'] = parseInt(nodeNumber)
        channelOutput['nodeName'] = nodeDetails[nodeNumber].name ? nodeDetails[nodeNumber].name : ''
        channelOutput['nodeGroup'] = nodeDetails[nodeNumber].group ? nodeDetails[nodeNumber].group : ''
        channelOutput['moduleName'] = nodeDetails[nodeNumber].moduleName ? nodeDetails[nodeNumber].moduleName : ''
        channelOutput['channelNumber'] = i
        try{
          channelOutput['channelName'] = nodeDetails[nodeNumber].channels[i].channelName
        }catch{
          channelOutput['channelName'] = ''
        }
        channels.push(channelOutput)
      }
    } catch(err){
      timeStampedLog(name + `: clickExport: ${err}`)
    }
  }

  // lets put a blank line into all json data to ensure we get headers
  // need to have a blank entry for each column to get a column header

  let shortEventOutput = {}
  shortEventOutput['eventName'] = ''
  shortEventOutput['eventNumber'] = ''
  shortEventOutput['eventGroup'] = ''
  shortEvents.push(shortEventOutput)
  //
  let longEventOutput = {}
  longEventOutput['eventName'] = ''
  longEventOutput['eventNumber'] = ''
  longEventOutput['eventGroup'] = ''
  longEventOutput['eventNodeNumber'] = ''
  longEvents.push(longEventOutput)
  //
  let nodeOutput = {}
  nodeOutput['nodeName'] = ''
  nodeOutput['moduleName'] = ''
  nodeOutput['nodeNumber'] = ''
  nodeOutput['nodeGroup'] = ''
  nodes.push(nodeOutput)
  //

  let channelOutput = {}
  channelOutput['nodeNumber'] = ''
  channelOutput['nodeName'] = ''
  channelOutput['nodeGroup'] = ''
  channelOutput['moduleName'] = ''
  channelOutput['channelNumber'] = ''
  channelOutput['channelName'] = ''
  channels.push(channelOutput)

  // ok, lets convert that json data into sheets
  // add some formatting while we're at it
  //

  const nodesWorksheet = xlsx.utils.json_to_sheet(nodes);
  try{
    //timeStampedLog(name + `: clickExport: nodesWorksheet ${JSON.stringify(nodes)}`)
    /* calculate column width */
    const nodes_name_width = nodes.reduce((w, r) => Math.max(w, r.nodeName.length), 15) + 5;
    const nodes_group_width = nodes.reduce((w, r) => Math.max(w, r.nodeGroup.length), 15) + 5;
    nodesWorksheet["!cols"] = [ { wch: nodes_name_width }, { wch: 20 }, { wch: 20 }, { wch: nodes_group_width } ];
    timeStampedLog(name + `: clickExport: nodesWorksheet`)
  } catch (err){
      timeStampedLog(name + `: clickExport: nodesWorksheet ${err}`)
  }

  const longEventsWorksheet = xlsx.utils.json_to_sheet(longEvents);
  try{
    /* calculate column width */
    const long_events_name_width = longEvents.reduce((w, r) => Math.max(w, r.eventName.length), 15) + 5;
    const long_events_group_width = longEvents.reduce((w, r) => Math.max(w, r.eventGroup.length), 15) + 5;
    longEventsWorksheet["!cols"] = [ { wch: long_events_name_width }, { wch: 20 }, { wch: 20 }, { wch: long_events_group_width } ];
    timeStampedLog(name + `: clickExport: longEventsWorksheet`)
  } catch (err){
      timeStampedLog(name + `: clickExport: longEventsWorksheet ${err}`)
  }


  const shortEventsWorksheet = xlsx.utils.json_to_sheet(shortEvents);
  try{
    //timeStampedLog(name + `: clickExport: shortEventsWorksheet ${JSON.stringify(shortEvents)}`)
    // calculate column width
    const short_events_name_width = shortEvents.reduce((w, r) => Math.max(w, r.eventName.length), 15) + 5;
    const short_events_group_width = shortEvents.reduce((w, r) => Math.max(w, r.eventGroup.length), 15) + 5;
    shortEventsWorksheet["!cols"] = [ { wch: short_events_name_width }, { wch: 20 }, { wch: short_events_group_width } ];
    timeStampedLog(name + `: clickExport: shortEventsWorksheet`)
  } catch (err){
      timeStampedLog(name + `: clickExport: shortEventsWorksheet ${err}`)
  }


  const channelsWorksheet = xlsx.utils.json_to_sheet(channels);
  try{
    /* calculate column width */
    // just do it for the variable size text fields
    // w is the previous result, r is the current element (row)
    const channelName_width = channels.reduce((w, r) => Math.max(w, r.channelName.length), 15) + 5;
    const nodeName_width = channels.reduce((w, r) => Math.max(w, r.nodeName.length), 15) + 5;
    const nodeGroup_width = channels.reduce((w, r) => Math.max(w, r.nodeGroup.length), 15) + 5;
    const moduleName_width = channels.reduce((w, r) => Math.max(w, r.moduleName.length), 15) + 5;
    channelsWorksheet["!cols"] = [ { wch: 15 }, { wch: nodeName_width }, { wch: nodeGroup_width }, { wch: moduleName_width }, { wch: 18 }, { wch: channelName_width } ];
    timeStampedLog(name + `: clickExport: channelsWorksheet`)
  } catch (err){
      timeStampedLog(name + `: clickExport: channelsWorksheet ${err}`)
  }

  const workbook = xlsx.utils.book_new();
  try{
    xlsx.utils.book_append_sheet(workbook, nodesWorksheet, "Nodes");
    xlsx.utils.book_append_sheet(workbook, longEventsWorksheet, "Long_Events");
    xlsx.utils.book_append_sheet(workbook, shortEventsWorksheet, "Short_Events");
    xlsx.utils.book_append_sheet(workbook, channelsWorksheet, "Channels");
  } catch (err){
      timeStampedLog(name + `: clickExport: book_append_sheet ${err}`)
  }

  const fileName = store.state.layout.layoutDetails.title + ' export '+createDateStamp() + '.ods'
  const newFilename = fileName.replaceAll(" ", "_")
  xlsx.writeFile(workbook, newFilename, { bookType:'ods', compression: true, cellStyles: true });

}


</script>

<style scoped>

</style>
