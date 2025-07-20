<template>
  <q-dialog v-model="model" persistent>
    <q-card  style="min-width: 800px;" class="q-pa-none q-ma-none">

      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Bus Traffic
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>
        <q-card-section style="max-height: 85vh" class="scroll q-py-none no-margin">
          <q-list>
            <q-item
              v-for="message in logArray"
              :key="message"
              clickable
              dense
              v-ripple
              >
            <q-item-label dense class="q-pa-none q-my-none">{{ message}}</q-item-label>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

    </q-card>
  </q-dialog>
</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'

const $q = useQuasar()
const store = inject('store')
const name = "BusTrafficDialog"
const showMore = ref(false)
const logArray = ref()

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
//  console.log(name + `: WATCH model`)
})


onBeforeMount(() => {
})

onMounted(() => {
})

//
//
store.eventBus.on('LOG_FILE', (fileName, logFile) => {
  if (fileName == "bustraffic.txt"){
    let temp = atob(logFile)
    let temp2 = temp.split("\r")
    let caption = "lines: " + temp2.length
    $q.notify({
      message: 'bustraffic.txt received - processing',
      caption: caption,
      timeout: 1000,
      type: 'warning',
      position: 'center'
    })
    //
    // *********** commented out as taking far too long ***************
    //
    //logArray.value = temp2
    //
    //
  }
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickShowMore = () => {
  showMore.value = showMore.value ? false : true
}



</script>

<style scoped>

</style>
