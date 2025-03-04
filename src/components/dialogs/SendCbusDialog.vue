<template>

  <q-dialog v-model='model' persistent>
    <q-card style="width: 600px; min-height: 200px;">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Send CBUS message
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>


        <q-card-section class="q-py-none q-ma-xs row">
            <q-radio dense v-model="dataFormat" val='Hex' label="Hex" />
            <q-space/>
            <q-radio dense v-model="dataFormat" val='Decimal' label="Decimal" />
            <q-space/>
            <q-space/>
        </q-card-section>

        <q-card style="min-height: 280px;" class="q-pa-sm q-ma-sm">

          <q-card-section style="min-height: 80px;">
            <q-card-section class="q-pa-none q-ma-none">
              <div class="text-body">enter opcode</div>
            </q-card-section>
          </q-card-section>

          <q-card-section class="q-pa-none q-ma-none" style="width: 50px;">
            <q-input dense v-model="opCode" type="string" autofocus />
          </q-card-section>


        </q-card>


    </q-card>
  </q-dialog>

 

</template>

<script setup>

//
//

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'

const store = inject('store')
const $q = useQuasar()
const name = "SendCbusDialog"
const dataFormat = ref('Hex')
const opCode = ref()
const datalength = ref()


const props = defineProps({
  modelValue: { type: Boolean, required: true },
})

const emit = defineEmits(['update:modelValue'])

//
//
const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

//
//
watch (model, () => {
  if (model.value == true){
    dataFormat.value = 'Hex'
  }
})


//
//
watch (opCode, () => {
  console.log(name + `: Watch opCode`)
  let opCodeDecimal = undefined
  if (dataFormat.value == 'Hex'){
    opCodeDecimal = parseInt(opCode.value, 16)
    console.log(name + `: opcode ${opCodeDecimal}`)
  } else {
    opCodeDecimal = parseInt(opCode.value)
  }
  if (opCodeDecimal < 0x20){
    datalength.value = 0
  } else if (opCodeDecimal < 0x40 ) {
    datalength.value = 1
  } else if (opCodeDecimal < 0x60) {
      datalength.value = 2
  } else if (opCodeDecimal < 0x80 ) {
      datalength.value = 3
  } else if (opCodeDecimal < 0xA0 ) {
      datalength.value = 4
  } else if (opCodeDecimal < 0xC0 ) {
      datalength.value = 5
  } else if (opCodeDecimal < 0xE0) {
      datalength.value = 6
  } else if (opCodeDecimal <= 0xFF ) {
      datalength.value = 7
  }
  console.log(name + `: data length ${datalength.value}`)
})


//
//
onUpdated(() =>{
//  console.log(name + ` OnUpdated`)
  dataFormat.value = 'Hex'
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


</script>

<style scoped>

</style>
