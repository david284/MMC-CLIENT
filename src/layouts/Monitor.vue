<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="row bg-primary text-white no-margin no-padding">
      <q-toolbar class="col no-margin no-padding" style="min-width: 180px">


        <q-toolbar-title style="min-height: 0;" class="no-margin no-padding">
          <div class="text-h6 no-margin no-padding">
            &nbsp; CAN BUS Monitor
            </div>
          </q-toolbar-title>
      </q-toolbar>

      <q-toolbar class="col no-margin q-py-none  float-right" v-if="store.getters.develop()">
        <div class="float-right">
          <q-btn size="md" color="secondary" label="clear all" @click="clickClear()" no-caps/>
        </div>
      </q-toolbar>

    </q-header>

    <q-page-container class="no-margin q-pa-none">

      <q-page>
        <q-card class="no-margin no-padding">
          <q-scroll-area id="demo" ref="scrollAreaRef" style="height: 87vh;">
            <q-list>
              <q-item
                v-for="message in busTrafficDisplay"
                :key="message"
                dense
                >
                <q-item-label dense caption class="q-pa-none q-my-none">
                  <span class="text-bold text-blue">{{ message.timeStamp }} {{ message.direction }}</span>
                  <!-- <span class="text-bold text-blue">{{ message.direction }}</span> -->
                  <span>:&nbsp;</span>
                  <span class="text-bold">{{ message.displayText }}</span>
                </q-item-label>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card>
      </q-page>

    </q-page-container>

  </q-layout>
</template>

<script setup>

import {computed, inject, onBeforeMount, onMounted, onUpdated, ref, watch} from "vue";
import * as utils from "components/functions/utils.js"


const store = inject('store')
const logPrefix = "Monitor"
const busTrafficDisplay = ref([])
const busTraffic = ref([])


store.eventBus.on('BUS_TRAFFIC_EVENT', (eventData) => {
  utils.timeStampedLog(logPrefix + ': BUS_TRAFFIC_EVENT : ' + JSON.stringify(eventData))
  busTraffic.value.push(eventData)
  if (busTraffic.value.length > 32) {
    busTraffic.value.shift()
  }
  updateBusMonitorDisplay1(eventData)
})


const updateBusMonitorDisplay1 = (eventData) => {
    let data = eventData
    let cbusMsg = data.json
    // display all messages
    data["displayText"] = cbusMsg.encoded + " " + cbusMsg.text
    //data["displayText"] = cbusMsg.text
    busTrafficDisplay.value.push(data)
}


const updateBusMonitorDisplay0 = () => {
  //busTrafficDisplay.value=[]
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


</script>

<style>
</style>
