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
              <q-item clickable @click="clickBusEvents()">
                <q-item-section>Bus events</q-item-section>
              </q-item>
              <q-item v-if="(store.state.develop)" clickable @click="clickShortEvents()">
                <q-item-section>Show all Events</q-item-section>
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

    <q-page-container class="main-page no-shadow no-margin q-pa-none">
      <q-page>
        <nodesList />
      </q-page>
    </q-page-container>
  </q-layout>


  <busEventsDialog v-model='showBusEventsDialog' />
  <busTrafficDialog v-model='showBusTrafficDialog' />
  <cbusErrorsDialog v-model='showCbusErrorsDialog' />
  <jsonDialog v-model='showJsonDialog' />
  <layoutDialog v-model='showLayoutDialog' />
  <modifiedGridConnectDialog v-model='showModifiedGridConnectDialog'
    :busMessage="busMessage"/>
  <newNodeDialog v-model='showNewNodeDialog'
    :previousNodeNumber="previousNodeNumber" />
  <systemDialog v-model='showSystemDialog' />

  <dialogExampleCompositionAPI v-model='showDialogExampleCompositionAPI' />

  <AllEventsDialog v-model='showAllEventsDialog' />

  <iFrameDialog v-model='showiFrameDialog' 
    :URL=exampleURL />


</template>

<script setup>
import {computed, inject, onBeforeMount, onMounted, onUpdated, ref, watch} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import nodesList from "components/NodesList"
import busEventsDialog from "components/dialogs/BusEventsDialog";
import busTrafficDialog from "components/dialogs/BusTrafficDialog";
import cbusErrorsDialog from "components/dialogs/CbusErrorsDialog";
import jsonDialog from "components/dialogs/JsonDialog";
import layoutDialog from "components/dialogs/LayoutDialog";
import modifiedGridConnectDialog from "components/dialogs/ModifiedGridConnectDialog";
import newNodeDialog from "components/dialogs/NewNodeDialog";
import systemDialog from "components/dialogs/SystemDialog";
import dialogExampleCompositionAPI from "components/dialogs/DialogExampleCompositionAPI";
import iFrameDialog from "components/dialogs/iFrameDialog";
import AllEventsDialog from "components/dialogs/AllEventsDialog";

const { getVerticalScrollPosition, setVerticalScrollPosition } = scroll
const $q = useQuasar()
const store = inject('store')
const name = "MainLayout"
const leftDrawerOpen = ref(false);
const showBusEventsDialog = ref(false)
const showBusTrafficDialog = ref(false)
const showCbusErrorsDialog = ref(false)
const showJsonDialog = ref(false)
const showLayoutDialog = ref(false)
const showModifiedGridConnectDialog = ref(false)
const showNewNodeDialog = ref(false)
const showSystemDialog = ref(false)
const busMessage = ref({})
const previousNodeNumber = ref(0)
const showDialogExampleCompositionAPI = ref(false)
const showAllEventsDialog = ref(false)
const showiFrameDialog = ref(false)
const exampleURL = ref("dummyModule/index.html")
const scrollAreaRef = ref(null)
var oneShotScroll

const nodeTraffic = computed(() => {
  return Object.values(store.state.nodeTraffic)
})

watch(nodeTraffic, () => {
//  console.log(name + `: WATCH nodeTraffic`)
  scrollAreaRef.value.setScrollPercentage('vertical', 1)
  oneShotScroll = setTimeout(scrollFunc,200);
})


onMounted(() => {
  store.methods.request_bus_connection()
  setInterval(eventIntervalFunc,5000);
})

onUpdated(() =>{
  scrollAreaRef.value.setScrollPercentage('vertical', 1)
//  oneShotScroll = setInterval(scrollIntervalFunc,1000);
})

const eventIntervalFunc = () => {
//  console.log(name + ": interval " + Date.now())
  store.methods.request_bus_connection()
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

const clickShortEvents = () => {
  console.log(name + ': clickShortEvents')
  showAllEventsDialog.value = true
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
  console.log(name + ': clickSingleBusEvent: scroll ' + getVerticalScrollPosition(document.getElementById("demo")))
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
