<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="row bg-primary text-white no-margin no-padding" style="height: 7vh;">
      <q-toolbar class="col no-margin no-padding">

        <q-btn flat dense icon="menu">
          <q-menu auto-close>
            <q-list style="min-width: 100px">
              <q-item clickable @click="clickLayout()">
                <q-item-section>Layout</q-item-section>
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
          <div class="text-h6 no-margin no-padding">
            <!-- <span style="min-height: 0;" class="page-title no-margin no-padding text-h6"> -->
            MMC
            </div>
          </q-toolbar-title>

      </q-toolbar>

      <q-toolbar class="col no-margin no-padding" style="min-width: 400px">
        <q-space />
        <div class="text-h6 no-margin no-padding float-right">{{ layoutDataTitle }}</div>
      </q-toolbar>

      <q-toolbar class="col no-margin no-padding">
        <q-space />
      </q-toolbar>

      <q-toolbar class="col no-margin q-py-none">
        <div class="text-h6 float-right">
          <q-btn size="md" color="secondary" label="Bus Events" @click="clickBusEventsView()" no-caps/>
        </div>
      </q-toolbar>
      <q-toolbar class="col no-margin q-py-none">
        <div class="text-h6 float-right">
          <q-btn size="md" color="secondary" label="Events view" @click="clickEventsView()" no-caps/>
        </div>
      </q-toolbar>
      <q-toolbar class="col no-margin q-py-none">
        <div class="text-h6 float-right">
          <q-btn size="md" color="secondary" label="Nodes view" @click="clickNodesView()" no-caps/>
        </div>
      </q-toolbar>

      <q-toolbar class="col no-margin q-py-none">
        <q-space />
        <div class="text-h6 float-right">
          <q-btn size="md" color="negative" label="Exit" @click="clickExit()" no-caps/>
        </div>
      </q-toolbar>

    </q-header>

    <q-drawer class="no-margin no-padding"
      v-model="leftDrawerOpen" 
      show-if-above
      side="left" 
      :width="250"
      dense 
      bordered
      >
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none q-px-xs">
        <div class="text-h6">
        Bus traffic
      </div>
      </q-banner>

      <q-card class="no-margin no-padding" style="height: 83vh;">
        <q-scroll-area id="demo" ref="scrollAreaRef" style="height: 82vh;">
          <q-list>
            <q-item 
              v-for="message in store.state.nodeTraffic" 
              :key="message" 
              clickable 
              dense
              @click=clickSingleBusEvent(message) 
              >
              <q-item-label dense caption class="q-pa-none q-my-none">
                <span class="text-bold text-blue">{{ message.direction }}</span>
                <span>:&nbsp;</span>
                <span class="text-bold">{{ message.json.text }}</span>
              </q-item-label>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-card>
      Click message to show encoding
    </q-drawer>

    <q-page-container v-if="(store.state.inStartup == false)" class="main-page no-shadow no-margin q-pa-none">
       
      <q-page v-if="(selectedView == 'BusEventsView')">
        <BusEventsView />
      </q-page>
      <q-page v-if="(selectedView == 'EventsView')">
        <EventsView />
      </q-page>
      <q-page v-if="(selectedView == 'NodesView')">
        <nodesView />
      </q-page>
      
    </q-page-container>
  </q-layout>


  <busTrafficDialog v-model='showBusTrafficDialog' />
  <cbusErrorsDialog v-model='showCbusErrorsDialog' />
  <jsonDialog v-model='showJsonDialog' />
  <layoutDialog v-model='showLayoutDialog' />
  <modifiedGridConnectDialog v-model='showModifiedGridConnectDialog'
    :busMessage="busMessage"/>
  <newNodeDialog v-model='showNewNodeDialog'
    :previousNodeNumber="previousNodeNumber" />
  <startupDialog v-model='store.state.inStartup' />
  <systemDialog v-model='showSystemDialog' />
  <dialogExampleCompositionAPI v-model='showDialogExampleCompositionAPI' />
  <iFrameDialog v-model='showiFrameDialog' 
    :URL=exampleURL />

</template>

<script setup>

//
// the 'store.state.inStartup' flag is used to determine if the server is in startup, and needs a layout selecting
// or, if flag is false, then the layout has already been selected (by another client) and it's now connected & running
// so if flag true, the startupDialog is shown
// if false, the main 'views' are enabled (they need a valid layout to work)
//
// the client will assume inStartup to be true initially (i.e. needs layout selecting)
// and when connected, the server will send it's status, which if running will set the inStartup to false
// Otherwise, flag left at true, and the startupDialog will be displayed
// The startupDialog will set the inStartup flag to false when proceeding with a selected layout
//
//

import {computed, inject, onBeforeMount, onMounted, onUpdated, ref, watch} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import nodesView from "components/NodesView"
import busEventsDialog from "components/dialogs/BusEventsDialog";
import busTrafficDialog from "components/dialogs/BusTrafficDialog";
import cbusErrorsDialog from "components/dialogs/CbusErrorsDialog";
import jsonDialog from "components/dialogs/JsonDialog";
import layoutDialog from "components/dialogs/LayoutDialog";
import modifiedGridConnectDialog from "components/dialogs/ModifiedGridConnectDialog";
import newNodeDialog from "components/dialogs/NewNodeDialog";
import startupDialog from "components/dialogs/StartupDialog";
import systemDialog from "components/dialogs/SystemDialog";
import dialogExampleCompositionAPI from "components/dialogs/DialogExampleCompositionAPI";
import iFrameDialog from "components/dialogs/iFrameDialog";
import EventsView from "components/EventsView";
import BusEventsView from "components/BusEventsView";

const { getVerticalScrollPosition, setVerticalScrollPosition } = scroll
const $q = useQuasar()
const store = inject('store')
const name = "MainLayout"

const busMessage = ref({})
const leftDrawerOpen = ref(false)
const showBusTrafficDialog = ref(false)
const showCbusErrorsDialog = ref(false)
const showJsonDialog = ref(false)
const showLayoutDialog = ref(false)
const showModifiedGridConnectDialog = ref(false)
const showNewNodeDialog = ref(false)
const showStartupDialog = ref(true)
const showSystemDialog = ref(false)
const previousNodeNumber = ref(0)
const showDialogExampleCompositionAPI = ref(false)
const showiFrameDialog = ref(false)
const exampleURL = ref("dummyModule/index.html")
const scrollAreaRef = ref(null)
const selectedView = ref('NodesView')
var oneShotScroll

const nodeTraffic = computed(() => {
  return Object.values(store.state.nodeTraffic)
})

watch(nodeTraffic, () => {
//  console.log(name + `: WATCH nodeTraffic`)
  scrollAreaRef.value.setScrollPercentage('vertical', 1)
  oneShotScroll = setTimeout(scrollFunc,200);
})


const layoutDataTitle = computed(() => {
  var value = ''
  try{
  value =  store.state.layout.layoutDetails.title
  } catch(e){}
  return value
})


onBeforeMount(() => {
  store.methods.request_server_status()
  store.methods.request_layout_list()
})

onMounted(() => {
  setInterval(eventIntervalFunc,5000);
  setInterval(layoutDetailsIntervalFunc,2000);
})

onUpdated(() =>{
  scrollAreaRef.value.setScrollPercentage('vertical', 1)
//  oneShotScroll = setInterval(scrollIntervalFunc,1000);
})

const eventIntervalFunc = () => {
//  console.log(name + ": interval " + Date.now())
  store.methods.request_server_status()
}

//
// Method to throttle the update to the server
//
const layoutDetailsIntervalFunc = () => {
//  console.log(name + ": layoutDetailsIntervalFunc " + Date.now())
  if (store.state.update_layout_needed == true){
    // clear the flag immediately, so something else can set it again whilt update in process
    store.state.update_layout_needed = false
    store.methods.update_layout()
  }
}

const scrollFunc = () => {
//  console.log(name + ": scroll timeout " + Date.now())
//  clearInterval(oneShotScroll)
  scrollAreaRef.value.setScrollPercentage('vertical', 1)
}



store.eventBus.on('REQUEST_NODE_NUMBER_EVENT', (nodeNumber) => {
 console.log(name + ': REQUEST_NODE_NUMBER_EVENT - previous node number ' + nodeNumber)
 previousNodeNumber.value = nodeNumber
 showNewNodeDialog.value = true
})


store.eventBus.on('SERVER_STATUS_EVENT', (serverStatus) => {
//  console.log(name + ': SERVER_STATUS_EVENT ' + JSON.stringify(serverStatus))
  try{
    if (serverStatus.busConnection.state == false){
      $q.notify({
        message: 'Server has no connection to the CAN BUS',
        caption: 'please check & restart application',
        timeout: 0,
        type: 'warning',
        position: 'center',
        actions: [ { label: 'Dismiss' } ]
      })
    }
  } catch(err){
    console.log(name + ': SERVER_STATUS_EVENT: ' + err)    
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

const clickBusEventsView = () => {
  console.log(name + ': clickBusEventsView')
  selectedView.value = 'BusEventsView'
}

const clickEventsView = () => {
  console.log(name + ': clickEventView')
  selectedView.value = 'EventsView'
}

const clickNodesView = () => {
  console.log(name + ': clickNodeView')
  selectedView.value = 'NodesView'
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
  console.log(name + `: clickExit`)
  const result = $q.notify({
    message: 'Are you sure you want to exit and stop the server?',
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => { 
        store.methods.STOP_SERVER()
        await sleep(50)     // allow a bit of a delay for the change
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
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
  scrollAreaRef.value.setScrollPercentage('vertical', 1)
  showModifiedGridConnectDialog.value = true

//  showBusTrafficDialog.value = true
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
