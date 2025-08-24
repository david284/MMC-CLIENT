<template>
  <q-dialog v-model="model">

    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 600px" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Logs
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card flat inline class="q-pa-xs q-ma-none">
        <div class="text-h6">Select an archived logs file to download - newest files at top</div>
        <div class="text-body">Archive directory: {{ archiveDirectory }}</div>
        <q-card-section style="max-height: 75vh" class="scroll no-margin q-pa-xs">

          <q-table
            :rows="teRows"
            :columns="teColumns"
            row-key="archive"
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="0"
            hide-header
            hide-bottom
          >
            <template #body-cell="props">
              <q-tr :props="props">
                <q-td key="archive" :props="props">{{ props.row.archive }} </q-td>
                <q-td key="time" :props="props">{{ props.row.time }} </q-td>
                <q-td >
                  <q-btn class="q-mx-xs q-my-none" outline color="primary" size="sm" label="Download"
                  @click="clickDownload(props.row.archive)"/>
                  <!--
                  <q-btn dense class="q-mx-xs q-my-none" outline color="negative" size="sm" label="Delete"
                  @click="clickDelete(props.value)" no-caps />
                  -->
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

    </q-card>

  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import * as utils from "components/functions/utils.js"

const store = inject('store')
const name = "LogsDialog"
const archiveList = ref()
const archiveDirectory = ref()
const teRows = ref([])


const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const teColumns = [
  {name: 'archive', field: 'archive', required: true, label: 'archive', align: 'left', sortable: true},
  {name: 'time', field: 'time', required: true, label: 'time', align: 'left', sortable: true},
]

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  //utils.timeStampedLog(name + `: WATCH model`)
  if(model.value){
    store.methods.request_archived_logs_list()
  }
})

store.eventBus.on('ARCHIVED_LOGS_LIST', (data) => {
  if(model.value){
    //utils.timeStampedLog(name + `: RECEIVED ARCHIVED_LOGS_LIST ${JSON.stringify(data)}`)
    archiveList.value = data.list
    archiveDirectory.value = data.directory
  }
})

// need to update when new layout added
watch(archiveList, () => {
  //console.log(name + `: WATCH backupList`)
  if(model.value){
    updateArchiveList()
  }
})

const updateArchiveList = () => {
  teRows.value = []
  archiveList.value.forEach(archiveFilename => {
    //utils.timeStampedLog(name + `: update ` + backup)
    let array = archiveFilename.split('_')
    let denseTimeStamp = array[1]
    teRows.value.push({"archive" : archiveFilename, "time" : utils.TimeStampToText(denseTimeStamp)})

  })
    // sort rows with newest first
    teRows.value.sort(function(a, b){return (a.archive < b.archive)? 1 : -1;});
}

store.eventBus.on('BINARY_FILE', async (data) => {
  if(model.value){
    try {
      utils.timeStampedLog(name + `: RECEIVED BINARY_FILE ${data.fileName} length ${data.data.length}`)

      // convert from base64 to string
      const bufferArray = atob(data.data)
      utils.timeStampedLog(name + `: RECEIVED BINARY_FILE buffer length: ${bufferArray.length}`)
      //utils.timeStampedLog(name + `: RECEIVED BINARY_FILE buffer: ${bufferArray}`)

      // convert from string to byte array
      let bytesArray = new Uint8Array(bufferArray.length);
      for (var i = 0; i < bufferArray.length; i++) {
        bytesArray[i] = bufferArray[i].charCodeAt(0)
      }
      utils.timeStampedLog(name + `: RECEIVED BINARY_FILE bytesArray length: ${bytesArray.length}`)
      //utils.timeStampedLog(name + `: RECEIVED BINARY_FILE buffer: ${bytesArray}`)

      const blob = new Blob([bytesArray]);
      utils.timeStampedLog(name + `: RECEIVED BINARY_FILE blob length: ${blob.size}`)

      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = URL.createObjectURL( blob )
      a.download = data.fileName;
      a.click();
      document.body.removeChild(a);
    }catch(err){
      utils.timeStampedLog(name + `: RECEIVED BINARY_FILE: ${err}`)
    }
  }
})



onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


//
//
const clickDownload = async(filename) => {
  try{
    utils.timeStampedLog(name + `: clickDownload ${filename}`)
    store.methods.request_binary_file(archiveDirectory.value, filename)
  } catch (err){
    timeStampedLog(name + `: clickDownload: ${err}`)
  }
}



</script>

<style scoped>

</style>
