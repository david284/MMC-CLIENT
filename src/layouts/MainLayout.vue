<template>
  <q-layout view="hHh lpR fFf">
    <q-header style="min-height: 0;" class="row bg-primary text-white no-margin no-padding">
      <q-toolbar class="col no-margin no-padding">

        <q-btn flat dense icon="menu">
        <q-menu auto-close>
          <q-list style="min-width: 100px">
            <q-item clickable @click="clickLayout()">
              <q-item-section>Layout</q-item-section>
            </q-item>
            <q-item clickable @click="clickBusEvents()">
              <q-item-section>Bus events</q-item-section>
            </q-item>
            <q-item clickable @click="clickJson()">
              <q-item-section>JSON</q-item-section>
            </q-item>
            <q-item clickable @click="clickCbusErrors()">
              <q-item-section>CBUS errors</q-item-section>
            </q-item>
            <q-item clickable @click="clickSystem()">
              <q-item-section>System</q-item-section>
            </q-item>
            <q-item v-if="(store.state.develop)" clickable @click="clickExample()">
              <q-item-section>Example</q-item-section>
            </q-item>
            <q-item v-if="(store.state.develop)" clickable @click="clickiframe()">
              <q-item-section>Example iFrame</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

            
        <q-toolbar-title style="min-height: 0;" class="no-margin no-padding">
          <span style="min-height: 0;" class="text-h6 no-margin no-padding">
            <!-- <span style="min-height: 0;" class="page-title no-margin no-padding text-h6"> -->
            Module Management Console
          </span>
        </q-toolbar-title>
      </q-toolbar>

      <q-toolbar class="col no-margin no-padding">
        <div class="text-h6 no-margin no-padding">{{ store.state.layout.layoutDetails.title }}</div>
      </q-toolbar>


      <q-toolbar class="col no-margin q-py-none">
        <q-space />
        <div class="text-h6 float-right">
          <q-btn size="md" color="negative" label="Exit" @click="clickExit()" no-caps/>
        </div>
      </q-toolbar>

    </q-header>


    <q-drawer 
      v-model="leftDrawerOpen" 
      show-if-above side="left" 
      :width="130"
      dense 
      bordered
      >
      <q-card>
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
          Bus traffic
        </div>
        </q-banner>

        <q-list bordered >
          <q-item 
            v-for="message in store.state.nodeTraffic" 
            :key="message" 
            clickable 
            dense
            v-ripple
            @click=clickSingleBusEvent(message) 
            >
          <q-item-label dense class="q-pa-none q-my-none">{{ message.direction + "&nbsp;&nbsp;&nbsp;" + message.json.mnemonic }}</q-item-label>
          </q-item>
        </q-list>
      </q-card>
      <div>
          Click message for details
      </div>

    </q-drawer>

    <q-page-container class="main-page no-shadow">
      <q-page>
        <!--      <p>{{ store.state.display_component }}</p>-->
        <div v-if="store.state.debug">
          display_component : {{ store.state.display_component }}<br>
          events_component : {{ store.state.events_component }}<br>
          services_component : {{ store.state.services_component }}<br>
          selected_node : {{ store.state.selected_node }}<br>
          selected_events_index : {{ store.state.selected_event_index }}<br>
          selected_service_index : {{ store.state.selected_service_index }}<br>
        </div>
        <nodesList />
      </q-page>
    </q-page-container>
  </q-layout>


  <busEventsDialog v-model='showBusEventsDialog' />
  <cbusErrorsDialog v-model='showCbusErrorsDialog' />
  <jsonDialog v-model='showJsonDialog' />
  <layoutDialog v-model='showLayoutDialog' />
  <modifiedGridConnectDialog v-model='showModifiedGridConnectDialog'
    :busMessage="busMessage"/>
  <newNodeDialog v-model='showNewNodeDialog'
    :previousNodeNumber="previousNodeNumber" />
  <systemDialog v-model='showSystemDialog' />

  <dialogExampleCompositionAPI v-model='showDialogExampleCompositionAPI' />

  <iFrameDialog v-model='showiFrameDialog' 
    :URL=exampleURL />


</template>

<script setup>
import {computed, inject, onBeforeMount, onMounted, ref, watch} from "vue";
import { date, useQuasar } from 'quasar'
import nodesList from "components/NodesList"
import busEventsDialog from "components/dialogs/BusEventsDialog";
import cbusErrorsDialog from "components/dialogs/CbusErrorsDialog";
import jsonDialog from "components/dialogs/JsonDialog";
import layoutDialog from "components/dialogs/LayoutDialog";
import modifiedGridConnectDialog from "components/dialogs/ModifiedGridConnectDialog";
import newNodeDialog from "components/dialogs/NewNodeDialog";
import systemDialog from "components/dialogs/SystemDialog";
import dialogExampleCompositionAPI from "components/dialogs/DialogExampleCompositionAPI";
import iFrameDialog from "components/dialogs/iFrameDialog";

const $q = useQuasar()
const store = inject('store')
const name = "MainLayout"
const leftDrawerOpen = ref(false);
const showBusEventsDialog = ref(false)
const showCbusErrorsDialog = ref(false)
const showJsonDialog = ref(false)
const showLayoutDialog = ref(false)
const showModifiedGridConnectDialog = ref(false)
const showNewNodeDialog = ref(false)
const showSystemDialog = ref(false)
const busMessage = ref({})
const previousNodeNumber = ref(0)
const showDialogExampleCompositionAPI = ref(false)
const showiFrameDialog = ref(false)
const exampleURL = ref("http://192.168.1.50")


onMounted(() => {
  store.methods.request_bus_connection()
  setInterval(eventIntervalFunc,5000);
})

const eventIntervalFunc = (nodeNumber) => {
//  console.log(name + ": interval " + Date.now())
  store.methods.request_bus_connection()
}


store.eventBus.on('REQUEST_NODE_NUMBER_EVENT', (nodeNumber) => {
 console.log(name + ': REQUEST_NODE_NUMBER_EVENT - previous node number ' + nodeNumber)
 previousNodeNumber.value = nodeNumber
 showNewNodeDialog.value = true
})

store.eventBus.on('BUS_CONNECTION_EVENT', (busConnection) => {
  if (busConnection.state == false){
    $q.notify({
      message: 'Server has no connection to the CAN BUS',
      caption: 'please check & restart application',
      timeout: 0,
      type: 'warning',
      position: 'center',
      actions: [ { label: 'Dismiss' } ]
    })
  }
})

store.eventBus.on('SERVER_DISCONNECT', () => {
  $q.notify({
    message: 'MMC-server has disconnected',
    caption: 'please restart application',
    timeout: 0,
    type: 'warning',
    position: 'center',
    actions: [ { label: 'Dismiss' } ]
  })
})
/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickBusEvents = () => {
  console.log(name + ': clickBusEvents')
  showBusEventsDialog.value = true
}

const clickCbusErrors = () => {
  console.log(name + ': clickCbusErrors')
  showCbusErrorsDialog.value = true
}

const clickExample = () => {
  console.log(name + `: clickExample`)
  showDialogExampleCompositionAPI.value = true
}


const clickExit = () => {
  console.log(name + `: clickStop`)
  store.methods.STOP_SERVER()
}

const clickiframe = () => {
  console.log(name + ': clickiframe')
  showiFrameDialog.value = true
}

const clickJson = () => {
  console.log(name + ': clickJson')
  showJsonDialog.value = true
}

const clickLayout = () => {
  console.log(name + ': clickLayout')
  showLayoutDialog.value = true
}

const clickSingleBusEvent = (message) => {
  console.log(name + ': clickSingleBusEvent')
  busMessage.value = message
  showModifiedGridConnectDialog.value = true
}

const clickSystem = () => {
  console.log(name + ': clickSystem')
  showSystemDialog.value = true
}


</script>

<style scoped>
.main-page {
  background-color: white;
}

.page-title {
  font-weight: bold;
  font-size: 25px;
  font-family: Roboto;
}

.page-sub-title {
  font-family: Roboto;
  font-size: 15px;
  margin-left: 10px;
  color: white;
}

</style>
