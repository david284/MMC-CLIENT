<template>

  <q-dialog v-model='model' persistent>
    <q-card style="width: 600px; min-height: 100px;">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Send CBUS message
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

        <q-card-section>
          <div class="text-body">Enter the bytes to construct & send a CBUS/VLCB command</div>
        </q-card-section>

        <q-card class="q-pa-sm q-ma-none">

          <q-card-section>
            <div class="text-body">Enter either decimal numbers</div>
            <div class="text-body">Or hexidecimal number preceeded by '0x'</div>
            <div class="text-body">E.g. a NERD command to node 256, in hexidecimal would be</div>
            <div class="text-body">0x57 0x01 0x00</div>
          </q-card-section>

          <q-card-section>
            <div class="text-body">enter the opcode in the first field, which will then expose further fields to complete as required by that opcode</div>
          </q-card-section>

          <q-card class="row">

            <q-card-section class="q-pa-xs q-ma-none row">
              <q-input dense v-model="opCode" type="text" class="text-h6" style="width: 50px;" autofocus />
            </q-card-section>

            <q-card-section v-if="(dataLength > 0)" class="q-pa-xs q-ma-none row">
              <q-input dense v-model="data[0]" type="text" class="text-h6" style="width: 50px;"/>
            </q-card-section>

            <q-card-section v-if="(dataLength > 1)" class="q-pa-xs q-ma-none row">
              <q-input dense v-model="data[1]" type="text" class="text-h6" style="width: 50px;"/>
            </q-card-section>

            <q-card-section v-if="(dataLength > 2)" class="q-pa-xs q-ma-none row">
              <q-input dense v-model="data[2]" type="text" class="text-h6" style="width: 50px;"/>
            </q-card-section>

            <q-card-section v-if="(dataLength > 3)" class="q-pa-xs q-ma-none row">
              <q-input dense v-model="data[3]" type="text" class="text-h6" style="width: 50px;"/>
            </q-card-section>

            <q-card-section v-if="(dataLength > 4)" class="q-pa-xs q-ma-none row">
              <q-input dense v-model="data[4]" type="text" class="text-h6" style="width: 50px;"/>
            </q-card-section>

            <q-card-section v-if="(dataLength > 5)" class="q-pa-xs q-ma-none row">
              <q-input dense v-model="data[5]" type="text" class="text-h6" style="width: 50px;"/>
            </q-card-section>

            <q-card-section v-if="(dataLength > 6)" class="q-pa-xs q-ma-none row">
              <q-input dense v-model="data[6]" type="text" class="text-h6" style="width: 50px;"/>
            </q-card-section>

          </q-card>

        </q-card>


        <q-card-section>
          <q-card-actions align="right" class=" q-pa-none q-ma-none">
            <q-btn :disable="!sendEnabled" color="blue" label="Send" @click="clickSend()"/>
          </q-card-actions>
        </q-card-section>

    </q-card>
    
  </q-dialog>

 

</template>

<script setup>

//
//

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {decToHex} from "components/functions/utils.js"

const store = inject('store')
const $q = useQuasar()
const name = "SendCbusDialog"
const opCode = ref()
const dataLength = ref()
const data = ref([])
const commandString = ref()
const sendEnabled = ref(false)
let opCodeDecimal = undefined


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
    opCode.value = undefined
    dataLength.value = undefined
    data.value = ['0','0','0','0','0','0','0']
    commandString.value = undefined
  }
})


//
//
watch (opCode, () => {
  console.log(name + `: Watch opCode`)
  try{
    let processArray = opCode.value.toUpperCase().split('X')
    if (processArray.length > 1){
      opCodeDecimal = parseInt(processArray[1], 16)
    } else {
      opCodeDecimal = parseInt(processArray[0])
    }
    console.log(name + `: opcode ${opCodeDecimal}`)
    if (opCodeDecimal < 0x20){
      dataLength.value = 0
    } else if (opCodeDecimal < 0x40 ) {
      dataLength.value = 1
    } else if (opCodeDecimal < 0x60) {
        dataLength.value = 2
    } else if (opCodeDecimal < 0x80 ) {
        dataLength.value = 3
    } else if (opCodeDecimal < 0xA0 ) {
        dataLength.value = 4
    } else if (opCodeDecimal < 0xC0 ) {
        dataLength.value = 5
    } else if (opCodeDecimal < 0xE0) {
        dataLength.value = 6
    } else if (opCodeDecimal <= 0xFF ) {
        dataLength.value = 7
    }
    if (opCodeDecimal > 0 ) { sendEnabled.value = true}
    console.log(name + `: data length ${dataLength.value}`)
  } catch(err){
    console.log(name + `: Watch opCode ${err}`)    
  }
})



//
//
onUpdated(() =>{
//  console.log(name + ` OnUpdated`)
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickSend = () => {
  console.log(name + ': clickSend')
  commandString.value = decToHex(opCodeDecimal, 2)
  for (let i = 0; i< dataLength.value; i++){
    let processArray = data.value[i].toUpperCase().split('X')
    let value = 0
    if (processArray.length > 1){
      value = parseInt(processArray[1], 16)
    } else {
      value = parseInt(processArray[0])
    }
    commandString.value = commandString.value + decToHex(value, 2)
  }
  commandString.value = ':SB780N' + commandString.value + ';'
  console.log(name + ': clickSend: commandString ' + commandString.value)
  store.methods.send_cbus_message(commandString.value)
}



</script>

<style scoped>

</style>
