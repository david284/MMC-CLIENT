<template>
  <q-dialog v-model="model" persistent>
    <q-card  style="min-width: 80vw;" class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Bus Traffic
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="start" @click="clickStart()"/>
            <q-btn flat color="white" size="md" label="end" @click="clickEnd()"/>
            <q-btn flat color="white" size="md" label="download" @click="clickDownload()"/>
            <q-btn flat color="white" size="md" label="refresh" @click="clickRefresh()"/>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>
        <q-card-section style="max-height: 90vh" class="scroll q-py-none no-margin">

          <q-virtual-scroll
            ref="virtualListRef"
            style="max-height: 85vh;"
            :items="heavyList"
            v-slot="{ item, index }"
          >
            <q-item
              :key="index"
              dense
            >
              <q-item-section>
                <q-item-label>
                  #{{index}} - {{ item.label }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-virtual-scroll>

        </q-card-section>
      </q-card>

    </q-card>
  </q-dialog>
</template>

<!--
--
--
--
-->

<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import {timeStampedLog} from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const name = "BusTrafficDialog"
const heavyList = ref([])
const virtualListRef = ref(null)
let rawFile = null

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
  //timeStampedLog(name + `: WATCH model`)
})


onBeforeMount(() => {
})

onMounted(() => {
})

//
//
store.eventBus.on('LOG_FILE', (fileName, logFile) => {
  if(model.value){
    if (fileName == "bustraffic.txt"){
      timeStampedLog(name + ": Updated BusTrafficDialog")
      rawFile = atob(logFile)
      let bustrafficArray = rawFile.split("\r")
      // split will return an empty line at the end, so ignore that
      for (let i = 0; i < bustrafficArray.length - 1; i++) {
        heavyList.value.push({ label: bustrafficArray[i] })
      }

      /*
      let caption = "Number of lines: " + bustrafficArray.length
      $q.notify({
        message: 'bustraffic.txt received - processing',
        caption: caption,
        timeout: 1000,
        type: 'warning',
        position: 'center'
      })
        */

    }
  }
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickDownload = () => {
  timeStampedLog(name + ": clickDownload")

  let element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(rawFile));
  element.setAttribute('download', "BusTrafficLog.txt");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  document.body.removeChild(element);

}

//
//
const clickEnd = () => {
  timeStampedLog(name + ": clickEnd")
  virtualListRef.value.scrollTo(heavyList.value.length)
}

//
//
const clickRefresh = () => {
  timeStampedLog(name + ": clickRefresh")
  store.methods.request_log_file("bustraffic.txt")
}

//
//
const clickStart = () => {
  timeStampedLog(name + ": clickStart")
  virtualListRef.value.scrollTo(0)
}


</script>

<style scoped>

</style>
