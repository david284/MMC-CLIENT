<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="row bg-primary text-white no-margin no-padding">
      <q-toolbar class="col no-margin no-padding" style="min-width: 180px">


        <q-toolbar-title style="height: 6vh;" class="no-margin no-padding">
          <div class="text-h6 no-margin no-padding">
            &nbsp; CAN BUS Monitor
            </div>
          </q-toolbar-title>
      </q-toolbar>

      <q-toolbar class="col no-margin q-py-none  float-right" v-if="store.getters.develop()">
      <q-space />
        <div class="float-right">
          <q-btn size="md" color="blue" label="clear all" @click="clickClear()" no-caps/>
        </div>
      </q-toolbar>

      <q-toolbar class="col no-margin q-py-none">
        <div class="float-right">
          <q-btn square unelevated size="md" color="primary" icon="settings">
            <q-menu auto-close>
              <q-list style="min-width: 100px">
                <q-item>
                    <q-checkbox class="no-margin no-padding" v-model="eventsOnly"  @click="clickEventsOnly" label="Show Events Only"></q-checkbox>
                </q-item>
                <q-item>
                  <q-btn size="md" color="blue" label="reload" @click="clickReload" no-caps/>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>

    </q-header>

    <q-page-container class="no-margin q-pa-none">

      <q-page>
        <q-card class="no-margin no-padding">
          <q-scroll-area id="demo" ref="scrollAreaRef" style="height: 88vh;">
            <q-list>
              <q-item
                v-for="message in busTrafficDisplay"
                :key="message"
                dense
                >
                <q-item-label dense caption class="q-pa-none q-my-none" >
                  <span class="text-bold text-blue">{{ message.timeStamp }} {{ message.direction }}</span>
                  <span>:&nbsp;</span>
                  <span v-if="(message.highlight=='red')" class="text-bold" style="color:red">{{ message.displayText }}</span>
                  <span v-else class="text-bold" :class="message.higlight">{{ message.displayText }}</span>
                </q-item-label>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card>
      </q-page>

    </q-page-container>

  </q-layout>

  <q-dialog v-model="showHighlightDisplay">
    <q-card style="min-width: 350px">
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Close" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>


</template>

<script setup>

import {computed, inject, onBeforeMount, onMounted, onUpdated, ref, watch} from "vue";
import * as utils from "components/functions/utils.js"
import * as EventFunctions from "components/functions/EventFunctions.js"


const store = inject('store')
const logPrefix = "Monitor"
const busTrafficDisplay = ref([])
const scrollAreaRef = ref(null)
const showHighlightDisplay = ref(false)
const eventsOnly = ref(false)

// local storage for all bus traffic events
let busTrafficEventStore = []

// The event data includes a cbus message
//
store.eventBus.on('BUS_TRAFFIC_EVENT', (eventData) => {
  utils.timeStampedLog(logPrefix + ': BUS_TRAFFIC_EVENT : ' + JSON.stringify(eventData))
  busTrafficEventStore.push(eventData)
  updateBusMonitorDisplay(eventData)
})

// method to reload display array from local bus traffic store
//
const reloadBusMonitorDisplay = () =>{
  busTrafficDisplay.value=[]
  for (const msg of busTrafficEventStore){
    updateBusMonitorDisplay(msg)
  }
}

// Routine to add message to display array
//
const updateBusMonitorDisplay = (eventData) => {
  let data = eventData
  let cbusMsg = data.json
  // check if we want to omit this message from the display
  if (eventsOnly.value == true){
    if (EventFunctions.getEventDetails(cbusMsg).type == undefined){
      return
    }
  }
  // display all messages
  data["displayText"] = cbusMsg.encoded + " " + cbusMsg.text
  busTrafficDisplay.value.push(data)
  scrollAreaRef.value.setScrollPosition('vertical', scrollAreaRef.value.getScroll().verticalSize)
  utils.timeStampedLog(logPrefix + `: BUS_TRAFFIC_EVENT : size ${JSON.stringify(scrollAreaRef.value.getScroll())}` )
}


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickClear = () => {
  utils.timeStampedLog(logPrefix + ': clickClear')
  busTrafficDisplay.value = []
}

//
//
const clickEventsOnly = () => {
  utils.timeStampedLog(logPrefix + ': clickEventsOnly')
  reloadBusMonitorDisplay()
}


//
//
const clickReload = () => {
  utils.timeStampedLog(logPrefix + ': clickReload')
  reloadBusMonitorDisplay()
}

</script>

<style>
</style>
