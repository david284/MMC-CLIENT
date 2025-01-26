<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Import
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-section>
          <div class="text-subtitle2">Select a file to import</div>
          <div class="text-subtitle2">
            The data used in the import includes node & event names
          </div>
        </q-card-section>

        <q-file
            v-model="importFile"
            label="Pick one file"
            filled
            style="max-width: 300px"
          />
          <q-card-section>
            <div class="text-subtitle2">
              By default, if there is any existing data for an element being imported, this is retained, and the imported data for that element is ignored
            </div>
            <div class="text-subtitle2">
              However, selecting "overwrite" will result in the import being used instead
            </div>
          </q-card-section>

          <q-card-section class="dense no-padding no-margin">
            <q-radio v-model="mode" val="retain" label="Retain any existing data" />
          </q-card-section>
          <q-card-section class="dense no-padding no-margin">
            <q-radio v-model="mode" val="overwrite" label="Overwrite existing data" />
          </q-card-section>

          <q-card-section>

          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <!-- // Only close top dialog - this gives time for underlying dialogs to update -->
            <q-btn color="positive" label="Import" v-close-popup  @click="clickImport()" />
          </q-card-actions>

    </q-card>
  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {importFCU} from "components/functions/ImportFunctions.js"
import {sleep} from "components/functions/utils.js"

const $q = useQuasar()
const convert = require('xml-js');
const store = inject('store')
const name = "ImportDialog"
const importFile = ref()
const mode = ref("retain")


const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

watch(model, () => {
  console.log(name + `: WATCH model`)
})


onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickImport = () => {
  console.log(name + `: clickImport ` + importFile.value.name)
  var jsonResult = null
  let reader = new FileReader();
  reader.readAsText(importFile.value)
  reader.onload = function() {
    try{
      jsonResult = convert.xml2js(reader.result, { compact: true })
      console.log(name + ': Import JSON ' + JSON.stringify(jsonResult, null, "  "))

      importFCU(jsonResult, store, mode.value)
      /*
      jsonResult.MergModuleDataSet.userNodes.forEach( node => {
        console.log(name + ': Import Node ' + node.nodeNum._text + ' ' + node.nodeName._text)
        let nodeNumber = parseInt(node.nodeNum._text)
        // not interested in node 0, so skip
        if (nodeNumber > 0){
          let nodeName = node.nodeName._text
          if (store.state.layout.nodeDetails[nodeNumber] == undefined){
            // node doesn't exist, so create it with name
            store.setters.node_name(nodeNumber, nodeName)
            console.log("new node " + nodeNumber + " " + nodeName)
          } else if (store.state.layout.nodeDetails[nodeNumber].name == undefined ){
            // node not named, so name it
            store.setters.node_name(nodeNumber, nodeName)
            console.log('node ' + nodeNumber + ' named')
          } else if (store.state.layout.nodeDetails[nodeNumber].name == nodeName) {
            console.log('node ' + nodeNumber + ' stored name matches import name')
            // do nothing
          } else {
            // stored name doesn't match import name
            console.log('node ' + nodeNumber + " stored name doesn't match import name")
            if (mode.value == "overwrite"){
              console.log('node ' + nodeNumber + " overwrite")
              store.setters.node_name(nodeNumber, nodeName)
            }
          }
        }
      })
        */
    } catch(e){
      console.log(name + `: clickImport: ` + e)
    }
  }
}


</script>

<style scoped>

</style>
