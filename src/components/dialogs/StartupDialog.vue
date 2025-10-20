<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 800px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Startup
          </div>
          <template v-slot:action>
            <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps
                @click="clickInfo()" />
            <q-space/>
            <q-btn class="q-mx-xs q-my-none" size="sm" color="negative" label="Exit" @click="clickExit()" no-caps/>
          </template>
        </q-banner>

        <div class="q-pa-md row">

          <q-card inline class="q-pa-xs" flat style="width: 380px">
            <div class="text-h6">Select Layout</div>
            <q-card-section style="max-height: 60vh" class="scroll q-ma-xs q-pa-xs">
              <q-table
                class="startup-table"
                dense
                :rows="teRows"
                :columns="teColumns"
                row-key="name"
                virtual-scroll
                :rows-per-page-options="[0]"
                :virtual-scroll-sticky-size-start="0"
                hide-header
                hide-bottom
              >
                <template #body-cell="props">
                    <q-td key="layout" :props="props">
                      <q-btn flat color="primary" :label="props.value"
                      @click="clickSelectLayout(props.value)" />
                    </q-td>
                    <q-td >
                      <q-btn dense class="q-mx-xs q-my-none" outline color="primary" size="xs" label="Copy"
                      @click="clickCopyLayout(props.value)" no-caps />
                      <q-btn dense class="q-mx-xs q-my-none" outline color="negative" size="xs" label="Delete"
                      @click="clickDeleteLayout(props.value)" no-caps />
                    </q-td>
                </template>
              </q-table>
            </q-card-section>

            <q-card-section>
              <div class="text-h6">
                click to add a new layout &nbsp;
                <q-btn color="positive" label="Add" @click="clickAddNewLayout()"/>
              </div>
            </q-card-section>

          </q-card>

           <q-card flat inline class="q-pa-xs" style="width: 380px">

            <q-card-section class="q-pa-xs" style="height: 450px">

              <q-card-section>
                <div class="text-h6">
                  Selected layout
                </div>
                <div class="bg-light-blue-1 text-h6">
                  {{ layoutName }}
                </div>
              </q-card-section>

              <q-card-section  style="width: 350px; height: 300px">
                <div class="text-h6">
                  Connection details
                </div>
                <q-card flat style="height: 100px">
                  <div v-for="(n, i) in (connectionDetails)" :key = i>
                    {{ connectionDetails[i] }}
                  </div>
                </q-card>

                <div class="text-body">
                  The default 'Auto' setting will connect to the first CANUSB or CANUSB4 it finds<br/>
                  Please click INFO for details on the other options<br/>
                </div>
                <br/>
                <div class="text-h6">
                  <q-btn color="positive" label="Edit" @click="clickEditConnectionDetails()"/>
                    &nbsp; Edit connection details
                  </div>
              </q-card-section>
            </q-card-section>

            <q-card-section class="q-pa-xs">
              <q-card-actions align="center">
                <q-btn v-if="readyToProceed" color="primary" label="Proceed" @click="clickProceed()"/>
                <q-btn v-if="!readyToProceed" disabled color="primary" label="Proceed" @click="clickProceed()"/>
              </q-card-actions>
            </q-card-section>

          </q-card>

        </div>

      </q-card>

    </q-dialog>

    <addLayoutDialog v-model='showAddLayoutDialog' />

    <EditConnectionDetailsDialog v-model='showEditConnectionDetailsDialog' />

    <StartupInfoDialog v-model='showStartupInfoDialog' />

  <q-dialog v-model="showCopyLayout" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">copy layout: {{ selected_layout_name }}</div>
      </q-card-section>
      <q-card-section>
        <div>enter name for the new copy, followed by &lt;enter&gt;</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input dense v-model="newLayoutName" autofocus @keyup.enter="copyLayout(selected_layout_name, newLayoutName)"></q-input>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Close" v-close-popup></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import * as utils from "components/functions/utils.js"
import addLayoutDialog from "components/dialogs/AddLayoutDialog";
import EditConnectionDetailsDialog from "components/dialogs/EditConnectionDetailsDialog";
import StartupInfoDialog from "components/dialogs/StartupInfoDialog";

const $q = useQuasar()
const store = inject('store')
const name = "StartupDialog"
const layoutName = ref('<not selected>')
const teRows = ref([])
const showAddLayoutDialog = ref(false)
const showEditConnectionDetailsDialog = ref(false)
const showStartupInfoDialog = ref(false)
const readyToProceed = ref(false)
const layoutValid = ref(false)
const selected_layout_name = ref()
const connectionDetails = ref([])
const showCopyLayout = ref(false)
const newLayoutName = ref("")
const lastLayoutSelection = ref(Date.now())


const teColumns = [
  {name: 'layout', field: 'layout', required: true, label: 'Layout', sortable: true}
//  ,{name: 'actions', field: 'actions', required: true, label: 'Actions', align: 'right', sortable: false}
]

const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
//  utils.timeStampedLog(name + `: WATCH model`)
  if (model.value == true){
    updateLayoutList()
    newLayoutName.value=""
  }
})

const layout = computed(() => {
  return Object.values(store.state.layout)
})

// need to update when new layout added
watch(layout, () => {
//  utils.timeStampedLog(name + `: WATCH layout`)
  updateLayout()
})

const layoutList = computed(() => {
  return Object.values(store.state.layouts_list)
})

// need to update when new layout added
watch(layoutList, () => {
//  utils.timeStampedLog(name + `: WATCH layoutList`)
  updateLayoutList()
})


const updateLayout = () => {
//    utils.timeStampedLog(name + `: updateLayout: ` + JSON.stringify(teRows))
  try{
      layoutName.value = store.state.layout.layoutDetails.title
    } catch {}
  try{
    if (store.state.layout.connectionDetails == undefined){
      store.state.layout.connectionDetails={}
      store.state.layout.connectionDetails["mode"] = "Auto"
      store.state.layout.connectionDetails["serialPort"] = ""
      store.state.layout.connectionDetails["host"] = ""
      store.state.layout.connectionDetails["hostPort"] = ""
      store.state.layout.connectionDetails["FCU_Compatibility"] = false
      store.methods.update_layout()
    }
  } catch(error) {}
  connectionDetails.value = []
  connectionDetails.value.push("Mode: " + store.state.layout.connectionDetails.mode)
  if (store.state.layout.connectionDetails.mode == "SerialPort"){
    connectionDetails.value.push("serialPort: " + store.state.layout.connectionDetails.serialPort)
  }
  if (store.state.layout.connectionDetails.mode == "Network"){
    connectionDetails.value.push("Host: " + store.state.layout.connectionDetails.host)
    connectionDetails.value.push("Host Port: " + store.state.layout.connectionDetails.hostPort)
  }
  // only display 'FCU Compatibility' state if true
  // don't bother if set to false (default setting)
  if (store.state.layout.connectionDetails.FCU_Compatibility == true){
    connectionDetails.value.push("VLCB 'FCU compatibility mode': ON")
  }
  layoutValid.value = true
}


const updateLayoutList = () => {
  teRows.value = []
  layoutList.value.forEach(layout => {
//    utils.timeStampedLog(name + `: update ` + layout)
    teRows.value.push({"layout" : layout})
  })
//    utils.timeStampedLog(name + `: updateLayoutList: ` + JSON.stringify(teRows))
}

onBeforeMount(() => {
})

onMounted(() => {
})

//
//
const getNewLayoutName = (layout) => {
  try {
    let newList = layoutList.value.filter((A) => A.toUpperCase().includes(layout));
    utils.timeStampedLog(name + `: getNewLayoutName: newList: ${newList}`)
    if (newList.length == 1){
      return layout.toUpperCase() + " COPY 01"
    } else {
      // ok, lets see if there's copies already
      let newList2 = newList.filter((B) => B.includes("COPY"));
      utils.timeStampedLog(name + `: getNewLayoutName: newList2: ${newList2}`)
      if (newList2.length == 0){
        return layout.toUpperCase() + " COPY 01"
      } else {
        // array should be ordered, so we want the last entry
        let targetlayout = newList2[newList2.length-1]
        utils.timeStampedLog(name + `: getNewLayoutName: newlayout: ${targetlayout}`)
        // find last instance of 'COPY'
        let copyString = targetlayout.substring(targetlayout.lastIndexOf("COPY"), targetlayout.length)
        utils.timeStampedLog(name + `: getNewLayoutName: copyString: ${copyString}`)
        // extract number and increment
        let copyNumber = parseInt(copyString.replace(/[^0-9]/g, '')) + 1
        utils.timeStampedLog(name + `: getNewLayoutName: copyNumber: ${copyNumber}`)
        let newlayout = layout + " COPY " + copyNumber.toString().padStart(2,0)
        return newlayout
      }
    }
  } catch (err) {
    utils.timeStampedLog(name + `: getNewLayoutName: ${err}`)
    return ""
  }
}


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickAddNewLayout = async () => {
  utils.timeStampedLog(name + ': clickAddNewLayout')
  showAddLayoutDialog.value=true
}

const clickCopyLayout = async (layout) => {
  utils.timeStampedLog(name + ': clickCopyLayout')
  selected_layout_name.value = layout
  newLayoutName.value = getNewLayoutName(layout.toUpperCase())
  showCopyLayout.value = true
}

const copyLayout = async (sourceLayout, destinationLayout) => {
  utils.timeStampedLog(name + `: copyLayout ${sourceLayout} ${destinationLayout}`)
  if (destinationLayout.length > 0){
    store.methods.copy_layout(sourceLayout, destinationLayout)
  } else {
    $q.notify({
      message: 'no layout name entered',
      timeout: 1000,
      type: 'warning',
      position: 'center',
      actions: [ { label: 'Dismiss' } ]
    })
  }
  //
  showCopyLayout.value=false
}

const clickDeleteLayout = async (row) => {
  utils.timeStampedLog(name + ': clickDeleteLayout ', row)
  const result = $q.notify({
    message: 'Are you sure you want to delete layout ' + row,
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
        store.methods.delete_layout(row)
        await utils.sleep(50)     // allow a bit of a delay for the change
        store.methods.request_layout_list()
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

const clickEditConnectionDetails = async () => {
  utils.timeStampedLog(name + ': clickEditConnectionDetails')
  showEditConnectionDetailsDialog.value=true
}

const clickInfo = async () => {
  utils.timeStampedLog(name + ': clickInfo')
  showStartupInfoDialog.value = true
}

const clickExit = () => {
  utils.timeStampedLog(name + `: clickExit`)
  const result = $q.notify({
    message: 'Are you sure you want to close the application?',
    timeout: 0,
    position: 'center',
    color: 'primary',
    actions: [
      { label: 'YES', color: 'white', handler: async () => {
        store.methods.STOP_SERVER()
        await utils.sleep(50)     // allow a bit of a delay for the change
      } },
      { label: 'NO', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

const clickProceed = async () => {
  utils.timeStampedLog(name + ': clickProceed')
  if (store.state.layout != {} ){
    store.methods.start_connection(store.state.layout.connectionDetails)
    await utils.sleep(500)     // allow a bit of a delay for the change
    store.state.inStartup = false
    model.value = false
  }
}

//
// Added time delay between selections to avoid overwriting problems
//
const clickSelectLayout = async (row) => {
  let interval = Date.now() - lastLayoutSelection.value
  if (interval > 800){
    utils.timeStampedLog(name + ': clickLayouts on ', row)
    lastLayoutSelection.value = Date.now()
    store.methods.change_layout(row)
    readyToProceed.value = ref(true)
  }
}



</script>

<style lang="sass">
.startup-table
  /* height or max-height is important */
  max-height: 55vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    /* otherwise you see the table scrolling underneath the header */
    background-color: $blue-grey-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
