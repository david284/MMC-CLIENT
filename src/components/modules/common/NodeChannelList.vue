<template>
    <q-card style="max-height: 70vh" class="scroll q-ma-xs no-padding">

        <q-card-section class="no-margin q-py-none-xs" style="max-width: 95vw;">

          <q-table
            flat bordered
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
//        "1": {"channelType": "output", "edit": []},
//        "2": {"channelType": "output", "edit": []},
//

import {inject, ref, onBeforeMount, onMounted, onUpdated, computed, watch} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import {timeStampedLog} from "components/functions/utils.js"
import NodeChannelVariablesDialog from "components/dialogs/NodeChannelVariablesDialog"

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
        "channelType": props.configuration.channels[channelNumber].channelType,
        "information": "just some random text",
        "edit": props.configuration.channels[channelNumber].edit ? true : false
      })
    })
  } catch (err){
    timeStampedLog(name + `: update_node_channels ${err}`)
  }
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
  selected_configuration.value = props.configuration.channels[channelNumber].edit
  //timeStampedLog(name + `: clickEdit: config ${JSON.stringify(selected_configuration.value)}`)
  showNodeChannelVariablesDialog.value=true
}


</script>

<style scoped>

</style>
