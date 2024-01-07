<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <span class="page-title">{{ store.state.layout.layoutDetails.title }}</span>
        </q-toolbar-title>
        <div>Module Management Console</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" bordered>
      <q-list>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
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
</template>

<script>
import EssentialLink from "components/EssentialLink.vue";

const linksList = [
  {
    title: "Layout",
    caption: "Layout Page",
    icon: "home",
    component: "Layout",
  },
  {
    title: "Nodes",
    caption: "MERG Modules",
    icon: "mdi-timeline-outline",
    component: "Nodes",
  },
  {
    title: "Events",
    caption: "Captured Events",
    icon: "mdi-gesture-double-tap",
    component: "events",
  },
  {
    title: "Settings",
    caption: "MMC Settings",
    icon: "mdi-cog-outline",
    component: "settings",
  },
  {
    title: "JSON",
    caption: "Store Details",
    icon: "mdi-database",
    component: "JSON",
  },
  {
    title: "Cbus Errors",
    caption: "Cbus Errors",
    icon: "mdi-alert",
    component: "CbusErrors",
  },
  {
    title: "System",
    caption: "System",
    icon: "mdi-cog-outline",
    component: "system",
  }
];

import {defineComponent, ref, inject} from "vue";
import Home from "components/Home.vue"
import Layout from "components/Layout.vue"
import Nodes from "components/Nodes.vue"
import events from "components/Events.vue"
import settings from "components/Settings.vue"
import node from "components/Node.vue"
import JSON from "components/json.vue"
import CbusErrors from "components/CbusErrors.vue"
import Elements from "components/Elements.vue"
import system from "components/System.vue"

export default defineComponent({
  name: "MainLayout",
  components: {
    EssentialLink, Home, Layout, Nodes, JSON, events, settings, node, Elements, CbusErrors, system
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const store = inject('store')

    return {
      store,
      essentialLinks: linksList,
      leftDrawerOpen,
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
