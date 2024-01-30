<template>
  <q-layout view="hHh lpR fFf">
    <q-header style="min-height: 0;" class="row bg-primary text-white no-margin no-padding">
      <q-toolbar class="col">

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
            <q-item clickable @click="clickNewNode()">
              <q-item-section>New Node</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

            
        <q-toolbar-title style="min-height: 0;" >
          <span style="min-height: 0;" class="text-h6">
            <!-- <span style="min-height: 0;" class="page-title no-margin no-padding text-h6"> -->
            Module Management Console
          </span>
        </q-toolbar-title>
      </q-toolbar>

      <q-toolbar class="col">
        <div class="text-h6">{{ store.state.layout.layoutDetails.title }}</div>
      </q-toolbar>


      <q-toolbar class="col">
        <q-space />
        <div class="text-h6 float-right"></div>
      </q-toolbar>

    </q-header>


    <q-drawer 
      v-model="leftDrawerOpen" 
      show-if-above side="left" 
      :width="120" 
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
            v-ripple
            @click=clickSingleBusEvent(message) 
            >
          <q-item-label class="q-pa-none q-ma-xs">{{ message.direction + "&nbsp;&nbsp;&nbsp;" + message.json.mnemonic }}</q-item-label>
          </q-item>
        </q-list>
      </q-card>

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



</template>

<script setup>
import {computed, inject, onBeforeMount, onMounted, ref, watch} from "vue";
import nodesList from "components/NodesList"
import busEventsDialog from "components/dialogs/BusEventsDialog";
import cbusErrorsDialog from "components/dialogs/CbusErrorsDialog";
import jsonDialog from "components/dialogs/JsonDialog";
import layoutDialog from "components/dialogs/LayoutDialog";
import modifiedGridConnectDialog from "components/dialogs/ModifiedGridConnectDialog";
import newNodeDialog from "components/dialogs/NewNodeDialog";
import systemDialog from "components/dialogs/SystemDialog";

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
const busMessage = ref("")
const previousNodeNumber = ref()


store.eventBus.on('REQUEST_NODE_NUMBER_EVENT', (nodeNumber) => {
 console.log(name + ': REQUEST_NODE_NUMBER_EVENT - previous node number ' + nodeNumber)
 previousNodeNumber.value = nodeNumber
 showNewNodeDialog.value = true
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickCbusErrors = () => {
  console.log(name + ': clickCbusErrors')
  showCbusErrorsDialog.value = true
}

const clickBusEvents = () => {
  console.log(name + ': clickBusEvents')
  showBusEventsDialog.value = true
}

const clickSingleBusEvent = (message) => {
  console.log(name + ': clickSingleBusEvent')
  busMessage.value = message
  showModifiedGridConnectDialog.value = true
}

const clickJson = () => {
  console.log(name + ': clickJson')
  showJsonDialog.value = true
}

const clickLayout = () => {
  console.log(name + ': clickLayout')
  showLayoutDialog.value = true
}

const clickSystem = () => {
  console.log(name + ': clickSystem')
  showSystemDialog.value = true
}

const clickNewNode = () => {
  console.log(name + ': clickNewNode')
  store.eventBus.emit('REQUEST_NODE_NUMBER_EVENT', 100)
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
