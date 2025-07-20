<template>
  <div style="border:2px solid grey" class="no-padding no-margin">
    <q-card style="max-height: 70vh" class="scroll q-ma-xs no-padding">

        <q-card-section class="no-margin q-py-none-xs" style="width: 95vw;">

          <q-table
            flat
            dense
            :rows="teRows"
            :columns="teColumns"
            row-key="channelNumber"
            hide-bottom
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="0"
            >

            <template v-slot:body="props">
              <q-tr :props="props" class="q-my-none q-py-none">
                <q-td key="channelNumber" :props="props">{{ props.row.channelNumber }}</q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" v-slot="scope" buttons
                    @save="(newName) => nameChanged(newName, props.row.channelNumber)">
                    <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                  </q-popup-edit>
                </q-td>
                <q-td key="channelType" :props="props">{{ props.row.channelType }}</q-td>
                <q-td key="information" :props="props">{{ props.row.information }}</q-td>
                <q-td key="actions" :props="props">
                  <!-- <q-btn dense class="q-mx-xs" outline :disabled="!props.row.edit" color="primary" size="md" label="edit" -->
                  <q-btn dense class="q-mx-xs" outline v-if="(props.row.edit)" color="primary" size="sm" label="edit"
                  @click="clickEdit(props.row.channelNumber)" no-caps/>
                </q-td>
              </q-tr>
            </template>
          </q-table>


        </q-card-section>

    </q-card>
  </div>

  <NodeChannelVariablesDialog v-model='showNodeChannelVariablesDialog'
    :nodeNumber = nodeNumber
    :channelNumber = selected_channelNumber
    :configuration = selected_configuration
  />


</template>


<script setup>

// Expecting MDF element as per example below
//
//  "nodeVariables": [
//    {
//      "type": "NodeChannelList",
//      "channels":{
//        "1": {"channelType": "output", "information":[], "channelVariables": []},
//        "2": {"channelType": "output", "information":[], "channelVariables": []},
//        ...
//  The content of "information" is expected to be a "text" type element
//  which can have visibility logic, and overloaded labels as well (not shown for clarity)
//            {
//              "type":"text",
//              "visibilityLogic":{"JLL":{ "==" :[ {"NVbit":[1, 7]}, true] } },
//              "label": "Repeat enabled "
//            }
//  The content of "channelVariables" is those usual elements (nodeSlider etc..) that are specific
//  to thois specific channel (anything that would previously been put in a channel 'tab' for instance)
//

import {inject, ref, onBeforeMount, onMounted, onUpdated, computed, watch} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import {timeStampedLog} from "components/functions/utils.js"
import NodeChannelVariablesDialog from "components/dialogs/NodeChannelVariablesDialog"
import {overloadedLabel} from "components/modules/common/CommonLogicParsers.js";
import {parseLogicElement} from "components/modules/common/CommonLogicParsers.js";


const $q = useQuasar()
const store = inject('store')
const name = "NodeChannelList"
const showNodeChannelVariablesDialog = ref(false)
const selected_channelNumber = ref()
const selected_configuration = ref()

const props = defineProps({
  nodeNumber: {type: Number, default: 0 },
  configuration: {type: Object, required: true}
})

const teRows = ref([])

const teColumns = [
  {name: 'channelNumber', field: 'channelNumber', required: true, label: 'Channel', align: 'left', sortable: true},
  {name: 'name', field: 'name', required: true, label: 'Name (click to edit)', align: 'left', sortable: true},
  {name: 'channelType', field: 'channelType', required: true, label: 'Type', align: 'left', sortable: true},
  {name: 'information', field: 'information', required: true, label: '', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: '', align: 'left', sortable: true}
]


const update_node_channels = async () => {
  try{
    timeStampedLog(name + `: update_node_channels`)
    teRows.value = []
    //timeStampedLog(name + `: update_node_channels ${JSON.stringify(props.configuration)}`)
    let i=1
    let MDF_NodeChannels = Object.keys(props.configuration.channels)
    MDF_NodeChannels.forEach(channelNumber => {
      teRows.value.push({
        "channelNumber" : channelNumber,
        "name" : store.getters.node_channel_name(props.nodeNumber, channelNumber),
        "channelType": getChannelTypeText(props.configuration.channels[channelNumber]),
        "information": getInformationText(channelNumber, props.configuration.channels[channelNumber]),
        "edit": props.configuration.channels[channelNumber].channelVariables ? true : false
      })
    })
  } catch (err){
    timeStampedLog(name + `: update_node_channels ${err}`)
  }
}

//
//
const getChannelTypeText = (channelDescriptor) => {
  try{
    let result = ""
    //timeStampedLog(name + `: getChannelTypeText ${JSON.stringify(channelDescriptor.channelType)}`)
    let channelType = channelDescriptor.channelType
    //timeStampedLog(name + `: getChannelTypeText: item ${JSON.stringify(channelType)}`)
    if (channelType.overload != undefined) {
      result = overloadedLabel(props.nodeNumber, channelType.overload, store)
    } else{
      result = channelType
    }
    return result
  } catch(err){
    timeStampedLog(name + `: getChannelTypeText ${err}`)
  }
}

//
//
const getInformationText = (channelNumber, channelDescriptor) => {
  try{
    let result = ""
    //timeStampedLog(name + `: getInformationText: channel ${channelNumber} ${JSON.stringify(channelDescriptor.information)}`)
    let information = channelDescriptor.information
    for (var index in information){
      //timeStampedLog(name + `: getInformationText: item ${JSON.stringify(information[index])}`)
      //timeStampedLog(name + `: getInformationText: visibilityLogic ${JSON.stringify(information[index].visibilityLogic)}`)
      //timeStampedLog(name + `: getInformationText: label ${JSON.stringify(information[index].label)}`)
      let label = null
      if (information[index].type == "text") {
        // check if it should be shown
        if (information[index].visibilityLogic){
          if (parseLogicElement(props.nodeNumber, information[index].visibilityLogic, store)){
            label = information[index].label
          }
        } else {
          // no logic, so show anyway
          label = information[index].label
        }
        // ok, so label should now contain something if we're going to show it...
        if (label != null) {
          // check if the label is overloaded
          if (label.overload != undefined) {
            label = overloadedLabel(props.nodeNumber, label.overload, store)
          }
          // ok, can now add to result if there is a label
          if (label != null) {
            result += '<' + label + '> '
          }
        }
      }
    }
    timeStampedLog(name + `: getInformationText: result ${JSON.stringify(result)}`)
    return result
  } catch(err){
    timeStampedLog(name + `: getInformationText ${err}`)
  }
}

function isVisible(item){
  var result = true
  if (item.visibilityLogic) {
    result = parseLogicElement(props.nodeNumber, item.visibilityLogic, store)
  }
//  console.log(name + `: isVisible: ` + result + ' ' + item.type)
  return result
}


const nameChanged = (channelName, channelNumber) => {
  timeStampedLog(name + `: nameChanged: ${channelNumber} ${channelName}`)
  store.setters.node_channel_name(props.nodeNumber, channelNumber, channelName)
  update_node_channels()
}




onBeforeMount(() => {
  //timeStampedLog(name + `: onBeforeMount`)
})

onMounted(() => {
  //timeStampedLog(name + ': props: ' + JSON.stringify(props))
  update_node_channels()
})

onUpdated(() => {
  //timeStampedLog(name + `: onUpdated`)
  update_node_channels()
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickEdit = async (channelNumber) => {
  timeStampedLog(name + `: clickEdit: node ${props.nodeNumber} channel ${channelNumber}`)
  // JSON keys are strings, so convert to number
  selected_channelNumber.value = parseInt(channelNumber)
  selected_configuration.value = props.configuration.channels[channelNumber].channelVariables
  timeStampedLog(name + `: clickEdit: config ${JSON.stringify(selected_configuration.value)}`)
  showNodeChannelVariablesDialog.value=true
}


</script>

<style scoped>

</style>
