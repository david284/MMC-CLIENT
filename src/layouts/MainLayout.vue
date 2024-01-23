<template>
  <q-layout view="hHh lpR fFf">
    <q-header style="min-height: 0;" class="bg-primary text-white no-margin no-padding">
      <q-toolbar>

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
<!-- 
            <q-item clickable>
              <q-item-section>Help &amp; Feedback</q-item-section>
            </q-item>
 -->
          </q-list>
        </q-menu>
      </q-btn>

        <q-toolbar-title style="min-height: 0;" class="no-margin no-padding  text-h6">
          <span style="min-height: 0;" class="page-title no-margin no-padding text-h6">
            Module Management Console
          </span>
        </q-toolbar-title>

        <div class="text-h5">{{ store.state.layout.layoutDetails.title }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" :width="200" bordered>
      <q-card>
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
        Bus traffic
      </div>
      </q-banner>

      <q-list>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>

      <q-list bordered >
        <q-item v-for="message in traffic" :key="message" clickable v-ripple>
            <q-item-label class="q-pa-none q-ma-none text-caption">{{ message.direction + " " + message.json.encoded + " " + message.json.mnemonic }}</q-item-label>
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
        <component v-bind:is="store.state.display_component"></component>
      </q-page>
    </q-page-container>
  </q-layout>


  <busEventsDialog v-model='showBusEventsDialog' />
  <cbusErrorsDialog v-model='showCbusErrorsDialog' />
  <jsonDialog v-model='showJsonDialog' />
  <layoutDialog v-model='showLayoutDialog' />
  <systemDialog v-model='showSystemDialog' />


</template>

<script>
import EssentialLink from "components/EssentialLink.vue";

const linksList = [
  {
    title: "Main",
    caption: "MERG Modules",
    icon: "mdi-timeline-outline",
    component: "NodePage",
  },
  {
    title: "Bus Events",
    caption: "Captured Events",
    icon: "mdi-gesture-double-tap",
    component: "events",
  },
  {
    title: "Cbus Errors",
    caption: "Cbus Errors",
    icon: "mdi-alert",
    component: "CbusErrors",
  }
];


import {defineComponent, ref, inject} from "vue";
import Home from "components/Home.vue"
import Layout from "components/Layout.vue"
import Nodes from "components/Nodes.vue"
import events from "components/Events.vue"
import settings from "components/Settings.vue"
import NodePage from "components/NodePage.vue"
import node from "components/Node.vue"
import JSON from "components/json.vue"
import CbusErrors from "components/CbusErrors.vue"
import Elements from "components/Elements.vue"
import system from "components/System.vue"
import busEventsDialog from "components/dialogs/BusEventsDialog";
import cbusErrorsDialog from "components/dialogs/CbusErrorsDialog";
import jsonDialog from "components/dialogs/JsonDialog";
import layoutDialog from "components/dialogs/LayoutDialog";
import systemDialog from "components/dialogs/SystemDialog";

export default defineComponent({
  components: {
    busEventsDialog, cbusErrorsDialog, jsonDialog, layoutDialog, systemDialog, EssentialLink, Home, Layout, NodePage, Nodes, JSON, events, settings, node, Elements, CbusErrors, system
  },

  setup() {
    const name = "MainLayout"
    const leftDrawerOpen = ref(false);
    const store = inject('store')
    const showBusEventsDialog = ref(false)
    const showCbusErrorsDialog = ref(false)
    const showJsonDialog = ref(false)
    const showLayoutDialog = ref(false)
    const showSystemDialog = ref(false)

    const traffic = store.state.nodeTraffic

    function clickCbusErrors () {
      console.log(name + ': clickCbusErrors')
      showCbusErrorsDialog.value = true
    }

    function clickBusEvents () {
      console.log(name + ': clickBusEvents')
      showBusEventsDialog.value = true
    }

    function clickJson () {
      console.log(name + ': clickJson')
      showJsonDialog.value = true
    }

    function clickLayout () {
      console.log(name + ': clickLayout')
      showLayoutDialog.value = true
    }

    function clickSystem () {
      console.log(name + ': clickSystem')
      showSystemDialog.value = true
    }

    return {
      store,
      essentialLinks: linksList, traffic,
      leftDrawerOpen,
      clickBusEvents,
      clickCbusErrors,
      clickJson,
      clickLayout,
      clickSystem,
      showBusEventsDialog,
      showCbusErrorsDialog,
      showJsonDialog,
      showLayoutDialog,
      showSystemDialog,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});





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
