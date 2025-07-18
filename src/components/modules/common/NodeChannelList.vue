<template>
    <q-card style="max-height: 70vh" class="scroll q-ma-md">

        <q-card-section class="no-margin q-py-none-xs" style="max-width: 95vw;">

          <q-table
            flat bordered
            dense
            :rows="teRows"
            :columns="teColumns"
            row-key="channel"
            hide-bottom
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="0"
            >

            <template v-slot:body="props">
              <q-tr :props="props" class="q-my-none q-py-none">
                <q-td key="channel" :props="props">{{ props.row.channel }}</q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" v-slot="scope" buttons
                    @save="(newName) => nameChanged(newName, props.row.channel)">
                    <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                  </q-popup-edit>
                </q-td>
                <q-td key="actions" :props="props">
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
import {sleep} from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const name = "ChannelList"
const showEventVariablesDialog = ref(false)
const selected_nodeNumber = ref(0)
const showWaitingOnBusTrafficDialog = ref(false)
const WaitingOnBusTrafficMessage = ref('')
const WaitingOnBusTrafficDialogReturn = ref('')

const props = defineProps({
  nodeNumber: {type: Number, default: 0 },
  configuration: {type: Object, required: true}
})


const teRows = ref([])

const teColumns = [
  {name: 'channel', field: 'channel', required: true, label: 'channel', align: 'left', sortable: true},
  {name: 'name', field: 'name', required: true, label: 'Name (click to edit)', align: 'left', sortable: true},
  {name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'left', sortable: true}
]

const update_node_channels = async () => {
  try{
    console.log(name + `: update_node_channels`)
    teRows.value = []
    console.log(name + `: update_node_channels ${JSON.stringify(props.configuration)}`)
    let i=1
    let MDF_NodeChannels = Object.keys(props.configuration.channels)
    MDF_NodeChannels.forEach(channel => {
      teRows.value.push({
        "channel" : channel,
        "name" : store.getters.node_channel_name(props.nodeNumber, channel)
      })
    })
  } catch (err){
    console.log(name + `: update_node_channels ${err}`)
  }
}

const nameChanged = (channelName, channelNumber) => {
  console.log(name + `: nameChanged: ${channelNumber} ${channelName}`)
  store.setters.node_channel_name(props.nodeNumber, channelNumber, channelName)
  update_node_channels()
}




onBeforeMount(() => {
//  console.log(name + `: onBeforeMount`)
})

onMounted(() => {
//  console.log(name + ': props: ' + JSON.stringify(props))
  update_node_channels()
})

onUpdated(() => {
//  console.log(name + `: onUpdated`)
  update_node_channels()
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/




</script>

<style scoped>

</style>
