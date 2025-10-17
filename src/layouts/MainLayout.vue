<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="row bg-primary text-white no-margin no-padding" style="height: 6vh;">
      <q-toolbar class="col no-margin no-padding">

        <q-btn flat dense icon="menu">
          <q-menu auto-close>
            <q-list style="min-width: 100px">
              <q-item clickable @click="clickExport()">
                <q-item-section>Export</q-item-section>
              </q-item>
              <q-item clickable @click="clickImport()">
                <q-item-section>Import</q-item-section>
              </q-item>
              <q-item clickable @click="clickLogs()">
                <q-item-section>Logs</q-item-section>
              </q-item>
              <q-item clickable @click="clickJson()">
                <q-item-section>JSON</q-item-section>
              </q-item>
              <q-item clickable @click="clickCbusErrors()">
                <q-item-section>CBUS errors</q-item-section>
              </q-item>
              <q-item clickable @click="clickSendCBUS()">
                <q-item-section>Send CBUS message</q-item-section>
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
          <q-btn square unelevated color="primary" icon="settings">
            <q-menu auto-close>
              <q-list style="min-width: 100px">
                <q-item>
                    <q-checkbox class="no-margin no-padding" v-model="store.state.layout.settings.enableBusTraffic" @click="click_enableBusTraffic" label="show Bus Traffic"></q-checkbox>
                </q-item>
                <q-item>
                  <q-btn size="md" color="primary" outline label="Reset all settings" @click="clickResetSettings()" no-caps/>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn size="md" color="negative" label="Exit" @click="clickExit()" no-caps/>
        </div>
      </q-toolbar>

    </q-header>

    <q-drawer class="no-margin no-padding"
      v-if="store.state.layout.settings.enableBusTraffic"
      v-model="leftDrawerOpen"
      show-if-above
      side="left"
      :width="250"
      dense
      bordered
      >
      <q-banner inline-actions style="min-height: 0px;" class="bg-primary text-white dense no-margin q-py-none q-px-xs row">
        <div class="text-h6">Bus Traffic</div>
        <template v-slot:action>
          <div class="text-h6 float-right">
            <q-btn size="sm" color="blue" label="All" @click="clickAllBusTraffic()"/>
            <q-btn square unelevated color="primary" icon="settings" @click="clickBusTrafficSettings()">
              <q-menu auto-close v-model="showBusTrafficSettings">
                <q-list style="min-width: 100px">
                  <q-item>
                      <q-checkbox class="no-margin no-padding" label="show events only"
                        v-model="store.state.layout.settings.MainLayout.showEventsOnly" @click="clickShowEventsOnly()"></q-checkbox>
                  </q-item>
                  <q-item>
                    <q-btn size="md" color="primary" outline label="Clear bus traffic" @click="clickClearBusTraffic()" no-caps/>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </template>
      </q-banner>

      <q-card class="no-margin no-padding">
        <q-scroll-area id="demo" ref="scrollAreaRef" style="height: 89vh;">
          <q-list>
            <q-item
              v-for="message in busTrafficDisplay"
              :key="message"
              clickable
              dense
              @click=clickSingleBusEvent(message)
              >
              <q-item-label dense caption class="q-pa-none q-my-none">
                <!-- <span class="text-bold text-blue">{{ message.timeStamp }} {{ message.direction }}</span> -->
                <span class="text-bold text-blue">{{ message.direction }}</span>
                <span>:&nbsp;</span>
                <span class="text-bold">{{ message.displayText }}</span>
              </q-item-label>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-card>
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
  <ExportDialog v-model='showExportDialog' />
  <jsonDialog v-model='showJsonDialog' />
  <ImportDialog v-model='showImportDialog' />
  <LogsDialog v-model='showLogsDialog' />
  <modifiedGridConnectDialog v-model='showModifiedGridConnectDialog'
    :busMessage="busMessage"/>


    <newNodeDialog v-model='showNewNodeDialog'
    :previousNodeNumber="previousNodeNumber"
    :moduleName="nodeModuleName" />
  <SendCbusDialog v-model='showSendCbusDialog' />
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
import * as utils from "components/functions/utils.js"
import * as EventFunctions from "components/functions/EventFunctions.js"
import nodesView from "components/views/NodesView"
import busTrafficDialog from "components/dialogs/BusTrafficDialog";
import cbusErrorsDialog from "components/dialogs/CbusErrorsDialog";
import ExportDialog from "components/dialogs/ExportDialog";
import jsonDialog from "components/dialogs/JsonDialog";
import ImportDialog from "components/dialogs/ImportDialog";
import LogsDialog from "components/dialogs/LogsDialog";
import modifiedGridConnectDialog from "components/dialogs/ModifiedGridConnectDialog";
import newNodeDialog from "components/dialogs/NewNodeDialog";
import startupDialog from "components/dialogs/StartupDialog";
import systemDialog from "components/dialogs/SystemDialog";
import dialogExampleCompositionAPI from "components/dialogs/DialogExampleCompositionAPI";
import iFrameDialog from "components/dialogs/iFrameDialog";
import EventsView from "components/views/EventsView";
import BusEventsView from "components/views/BusEventsView";
import SendCbusDialog from "components/dialogs/SendCbusDialog";


const { getVerticalScrollPosition, setVerticalScrollPosition } = scroll
const $q = useQuasar()
const store = inject('store')
const name = "MainLayout"

const busMessage = ref({})
const leftDrawerOpen = ref(false)
const showBusTrafficDialog = ref(false)
const showCbusErrorsDialog = ref(false)
const showExportDialog = ref(false)
const showJsonDialog = ref(false)
const showImportDialog = ref(false)
const showLogsDialog = ref(false)
const showModifiedGridConnectDialog = ref(false)
const showNewNodeDialog = ref(false)
const showSystemDialog = ref(false)
const previousNodeNumber = ref(0)
const nodeModuleName = ref('')
const showDialogExampleCompositionAPI = ref(false)
const showiFrameDialog = ref(false)
const exampleURL = ref("dummyModule/index.html")
const scrollAreaRef = ref(null)
const selectedView = ref('NodesView')
var serverDisconnectNotification = null
var oneShotScroll
const showSendCbusDialog = ref(false)
const busTraffic = ref([])
const busTrafficDisplay = ref([])
const showBusTrafficSettings = ref(false)

//
//
const layoutDataTitle = computed(() => {
  var value = ''
  try{
  value =  store.state.layout.layoutDetails.title
  } catch(e){}
  return value
})

//
//
onBeforeMount(() => {
  store.methods.request_server_status()
  store.methods.request_layout_list()
  getSettings()
})

//
//
onMounted(() => {
  setInterval(eventIntervalFunc,5000);
  setInterval(layoutDetailsIntervalFunc,1000);
  setInterval(fastIntervalFunction, 100);
})

//
//
onUpdated(() =>{
})

//
//
const eventIntervalFunc = () => {
  //console.log(name + ": interval " + Date.now())
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
    store.state.layout.updateTimestamp = Date.now()
    store.methods.update_layout()
  }
}

//
// Method
//
const fastIntervalFunction = () => {
  // check if traffic has stopped, and reset various things if so
  if ((Date.now() - store.state.cbusTrafficTimeStamp) > 1000) {
  }

}

//
//
const scrollFunc = () => {
//  console.log(name + ": scroll timeout " + Date.now())
  try {
    scrollAreaRef.value.setScrollPercentage('vertical', 1)
  } catch {}
}


//
// general notfication method
// types are 'positive', 'negative', 'warning', 'info', 'ongoing'
//
store.eventBus.on('GENERAL_MESSAGE_EVENT', (message, caption, type, timeout) => {
  console.log(name + ': GENERAL_MESSAGE_EVENT ' + JSON.stringify(message))
  try{
    if ((timeout > 0) && (timeout <= 2000)){
      $q.notify({   // don't add a dismiss button
        message: message,
        caption: caption,
        timeout: timeout,
        type: type,
        position: 'center'
      })

    } else {
      $q.notify({
        message: message,
        caption: caption,
        timeout: timeout,
        type: type,
        position: 'center',
        actions: [ { label: 'Dismiss' } ]
      })
    }
  } catch(err){
    console.log(name + ': MESSAGE_EVENT: ' + err)
  }
})

//
//
store.eventBus.on('REQUEST_NODE_NUMBER_EVENT', (nodeNumber, moduleName) => {
 console.log(name + ': REQUEST_NODE_NUMBER_EVENT - previous node number ' + nodeNumber + ' moduleName ' + moduleName )
 previousNodeNumber.value = nodeNumber
 nodeModuleName.value = moduleName
 showNewNodeDialog.value = true
})

//
//
store.eventBus.on('NETWORK_CONNECTION_FAILURE', (message, caption, type, timeout) => {
  if(store.state.notification_settings.networkConnection_notify){
    try{
      $q.notify({
        message: message,
        caption: caption,
        timeout: timeout,
        type: type,
        position: 'center',
        actions: [
          { label: `Don't remind me again`,
            handler: () => { store.state.notification_settings.networkConnection_notify = false }
          },
          { label: 'Dismiss' }
        ]
      })
    } catch(err){
      console.log(name + ': NETWORK_CONNECTION_FAILURE: ' + err)
    }
  }
})

//
//
store.eventBus.on('SERIAL_CONNECTION_FAILURE', (message, caption, type, timeout) => {
  if(store.state.notification_settings.serialConnection_notify){
    try{
      $q.notify({
        message: message,
        caption: caption,
        timeout: timeout,
        type: type,
        position: 'center',
        actions: [
          { label: `Don't remind me again`,
            handler: () => { store.state.notification_settings.serialConnection_notify = false }
          },
          { label: 'Dismiss' }
        ]
      })
    } catch(err){
      console.log(name + ': SERIAL_CONNECTION_FAILURE: ' + err)
    }
  }
})


//
//
store.eventBus.on('SERVER_CONNECT', () => {
  if (serverDisconnectNotification){
    // dismiss the other notification
    serverDisconnectNotification()
  }
  $q.notify({
    message: 'MMC-server has connected',
    timeout: 1000,
    type: 'info',
    position: 'center'
  })
})


//
//
store.eventBus.on('SERVER_DISCONNECT', () => {
  serverDisconnectNotification = $q.notify({
    message: 'MMC-server has disconnected',
    timeout: 0,
    type: 'warning',
    position: 'center',
    actions: [ { label: 'Dismiss' } ]
  })
})

//
//
store.eventBus.on('LAYOUT_DATA', () => {
//  timeStampedLog(name + ': LAYOUT_DATA')
  getSettings()
})

//
//
const getSettings = () => {
  if (store.state.layout.settings == undefined){store.state.layout["settings"] = {}}
  if (store.state.layout.settings.MainLayout == undefined){store.state.layout.settings["MainLayout"] = {}}
  //
  if (store.state.layout.settings.enableBusTraffic == undefined){
    store.state.layout.settings['enableBusTraffic'] = true
    store.state.update_layout_needed = true
  }
  //
  if (store.state.layout.settings.MainLayout.showEventsOnly == undefined){
    store.state.layout.settings.MainLayout['showEventsOnly'] = false
    store.state.update_layout_needed = true
  }
  updateBusTrafficDisplay()
}


store.eventBus.on('BUS_TRAFFIC_EVENT', (data) => {
  utils.timeStampedLog(name + ': BUS_TRAFFIC_EVENT : ' + JSON.stringify(data))
  busTraffic.value.push(data)
  if (busTraffic.value.length > 32) {
    busTraffic.value.shift()
  }
  updateBusTrafficDisplay()
})

const updateBusTrafficDisplay = () => {
  busTrafficDisplay.value=[]
  for (let i =0; i < busTraffic.value.length; i++){
    let data = busTraffic.value[i]
    let cbusMsg = data.json
    if (store.state.layout.settings.MainLayout.showEventsOnly){
      if (EventFunctions.getEventDetails(cbusMsg).type != undefined){
        data["displayText"] = cbusMsg.mnemonic
        data["displayText"] += " Node:" + cbusMsg.nodeNumber
        if (EventFunctions.getEventDetails(cbusMsg).type == "LONG"){
          data["displayText"] += " Event:" + cbusMsg.eventNumber
        } else {
          data["displayText"] += " Event:" + cbusMsg.deviceNumber
        }
        data["displayText"] += " " + store.state.layout.eventDetails[cbusMsg.eventIdentifier].name
        busTrafficDisplay.value.push(data)
      }
    } else {
      // display all messages
      data["displayText"] = cbusMsg.text
      busTrafficDisplay.value.push(data)
    }
  }
  //scrollAreaRef.value.setScrollPercentage('vertical', 1)
  oneShotScroll = setTimeout(scrollFunc,200);
}

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickAllBusTraffic = (message) => {
  console.log(name + ': clickAllBusTraffic')
  store.methods.request_log_file("bustraffic.txt")
  showBusTrafficDialog.value = true
}


//
//
const clickBusEventsView = () => {
  console.log(name + ': clickBusEventsView')
  selectedView.value = 'BusEventsView'
}

//
//
const clickBusTrafficSettings = async () => {
  console.log(name + ': clickBusTrafficSettings')
  await utils.sleep(5000)   // collapse popup after 5 seconds
  showBusTrafficSettings.value = false
}

//
//
const clickCbusErrors = () => {
  console.log(name + ': clickCbusErrors')
  showCbusErrorsDialog.value = true
}


//
//
const clickClearBusTraffic = () => {
  console.log(name + ': clickClearBusTraffic')
  busTraffic.value = []
  updateBusTrafficDisplay()
}


//
//
const click_enableBusTraffic = () =>{
  console.log(name + ': click_enableBusTraffic')

}

//
//
const clickEventsView = () => {
  console.log(name + ': clickEventView')
  selectedView.value = 'EventsView'
}

//
//
const clickExample = () => {
  console.log(name + `: clickExample`)
  showDialogExampleCompositionAPI.value = true
}

//
//
const clickNodesView = () => {
  console.log(name + ': clickNodeView')
  selectedView.value = 'NodesView'
}

//
//
const clickExit = () => {
  console.log(name + `: clickExit`)
  const result = $q.notify({
    message: 'Are you sure you want to close the application?',
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

//
//
const clickExport = () => {
  console.log(name + ': clickExport')
  showExportDialog.value = true
}

//
//
const clickiframe = () => {
  console.log(name + ': clickiframe')
  showiFrameDialog.value = true
}

//
//
const clickImport = () => {
  console.log(name + ': clickImport')
  showImportDialog.value = true
}

//
//
const clickJson = () => {
  console.log(name + ': clickJson')
  showJsonDialog.value = true
}

//
//
const clickLogs = () => {
  console.log(name + ': clickLogs')
  showLogsDialog.value = true
}

//
//
const clickResetSettings = () => {
  console.log(name + ': clickResetSettings')
  store.state.layout.settings = {}
  store.state.update_layout_needed = true
}

//
//
const clickShowEventsOnly = () => {
  console.log(name + ': clickShowEventsOnly')
  store.state.update_layout_needed = true
  updateBusTrafficDisplay()
}

//
//
const clickSingleBusEvent = (message) => {
  console.log(name + ': clickSingleBusEvent')
  busMessage.value = message
  showModifiedGridConnectDialog.value = true
}

//
//
const clickSendCBUS = () => {
  console.log(name + ': clickSendCBUS')
  showSendCbusDialog.value = true
}

//
//
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
