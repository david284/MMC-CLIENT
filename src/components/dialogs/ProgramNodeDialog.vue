<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 750px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          &nbsp; {{ Title }}
        </div>
        <template v-slot:action>
          <q-btn class="q-mx-xs q-my-none" size="sm" color="info" label="INFO"  no-caps
            @click="clickInfo()" />
          <q-space/>
          <q-btn flat color="white" size="md" label="Close" @click="clickClose()"/>
        </template>
      </q-banner>



      <div class="q-pa-xs row">

        <q-card flat style="width: 370px">

          <q-card-section>
            <div class="text-h6">Select a file to upload</div>

            <q-file
              v-model="uploadFile"
              label="Pick one file"
              dense
              filled
              style="max-width: 300px"
            />
          </q-card-section>

          <q-card-section style="min-height: 120px" class="no-margin q-py-none">
            <div v-if="showFileInfo" class="text-body1">
              File module type: {{ store.state.moduleNames[fileModuleID].name }}
              <br/>
              File CPU type: {{ fileCpuType }}
              <br/>
              File version: {{ fileVersion }}
              <br/>
              load address {{ fileLoadAddress }}
              <br/>
              bootable {{ fileBootable }}
              <br/>
              <br/>
            </div>
          </q-card-section>

          <q-card-section class="no-margin q-py-none">
            FLASH memory is always programmed
          </q-card-section>
          <q-card-section style="max-width: 300px" class="no-margin q-py-none">
            <q-checkbox v-model="programCONFIG" label="Program configuration" />
            <q-checkbox :disable="programEEPROMCheckBoxDisabled" v-model="programEEPROM" label="Program EEPROM" />
            <q-checkbox :disable="cpuTypeCheckBoxDisabled" v-model="cpuTypeCheckIgnore" label="Ignore CPU type" />
            <q-checkbox :disable="bootModeCheckBoxDisabled" v-model="bootModeFlag" label="Program in Boot Mode" />
          </q-card-section>

        </q-card>

        <q-card flat class="q-pa-sm" style="width: 370px">
          <q-card-section v-if="(mode=='NORMAL')">
            <div class="text-h6">
              Node Module type: {{ store.state.nodes[nodeNumber].moduleName }}
              <br/>
              Node CPU type: {{ store.state.nodes[nodeNumber].cpuName }} ({{ store.state.nodes[nodeNumber].parameters[9] }})
            </div>
            <br/>
          </q-card-section>

          <q-card-section v-if="(mode=='BOOT')">
            <div class="text-h6">
              Program in boot mode
            </div>
            <div class="text-body1">
              Note that in this mode the cpu type can't be checked
            </div>
            <br/>
          </q-card-section>

          <div class="text-h6">
          Warnings:
          <br/>
          </div>
          <div class="text-body1">
            Disconnect all SLiM nodes to prevent corruption.
            <br/>
          </div>
          <div class="text-body1">
            Ensure there is mimimal or no traffic on the CAN bus before programming to avoid failure (issue with older bootloader firmware).
            <br/>
          </div>
          <div class="text-body1">
            In the event of a failure, and if the node is left in bootmode (both leds lit), then retry with the 'Program in Boot Mode' option checked.
          </div>
        </q-card>

      </div>

      <q-card-section class="row">
        <q-card-actions align="left" class="text-primary">
            <q-btn color="primary" label="Program" @click="clickProgram()" />
          </q-card-actions>
          <q-card align="center" flat class="text-h6" style="width: 370px">
            {{ FIRMWARE_STATUS }}
          </q-card>
        </q-card-section>

      <q-card-section class="bg-info text-h6 text-white">
        <div>
          Status: {{ progressText }}
        </div>
      </q-card-section>

    </q-card>
  </q-dialog>

  <ProgramNodeInfoDialog v-model='showInfoDialog'/>

</template>


<script setup>

//
//     * Flags
//     * 1 = Program CONFIG
//     * 2 = Program EEPROM
//     * 4 = Ignore CPUTYPE
//     * 8 = Program in Boot Mode
//

import {inject, onBeforeMount, onMounted, computed, onUpdated, watch, ref} from "vue";
import { useQuasar } from 'quasar'
import {timeStampedLog} from "components/functions/utils.js"
import {decToHex} from "components/functions/utils.js"
import ProgramNodeInfoDialog from "components/dialogs/ProgramNodeInfoDialog"

const $q = useQuasar()
const store = inject('store')
const name = "ProgramNodeDialog"
const uploadFile = ref(null)
const programCONFIG = ref(false)
const programEEPROM = ref(false)
const cpuTypeCheckIgnore = ref(false)
const bootModeFlag = ref(false)
const programEEPROMCheckBoxDisabled = ref(false)
const bootModeCheckBoxDisabled = ref(false)
const cpuTypeCheckBoxDisabled = ref(false)
const FIRMWARE_STATUS = ref()
const progressText = ref('')
const fileModuleID = ref(null)
const fileCpuType = ref(null)
const fileVersion = ref(null)
const fileLoadAddress = ref (null)
const fileBootable = ref (null)
const showInfoDialog = ref(false)
const showFileInfo = ref(false)
const Title = ref()
var flags = 0
var cpuType = undefined


//
//
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: { type: Number },
  mode: {type: String, default: "NORMAL" }
})

//
//
const emit = defineEmits(['update:modelValue'])

//
//
const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

//
//
watch(model, () => {
  //console.log(name + `: WATCH model: mode ` + props.mode)
  Title.value = "program node " + store.getters.node_name(props.nodeNumber)
  //
  clearAllSelections()
  //
  if (props.mode == "BOOT"){
    programEEPROM.value = true
    bootModeFlag.value = true
    cpuTypeCheckIgnore.value = true
    //
    programEEPROMCheckBoxDisabled.value = true
    bootModeCheckBoxDisabled.value = true
    cpuTypeCheckBoxDisabled.value = true
    Title.value = "program node in boot mode"
  }
})

//
//
watch(uploadFile, () => {
  if(uploadFile.value != null){
    timeStampedLog(name + `: WATCH uploadFile ${uploadFile.value.name}`)
    store.methods.request_firmware_info(uploadFile.value)
  }
})

//
//
watch (programCONFIG, () => {
  if (programCONFIG.value){
    $q.notify({
      message: "WARNING: Programming the CONFIG may break the bootloader",
      caption: "Proceed only if the firmware explicitly requires it, otherwise CANCEL",
      timeout: 0,
      position: 'center',
      color: 'primary',
      actions: [
        { label: 'PROCEED', color: 'white', handler: async () => {
        } },
        { label: 'CANCEL', color: 'white', handler: () => { programCONFIG.value = false } }
      ]
    })
  }
})

//
//
watch (cpuTypeCheckIgnore, () => {
  if (cpuTypeCheckIgnore.value){
  // always program EEPROM if different CPU
    programEEPROM.value = true
    programEEPROMCheckBoxDisabled.value = true
  } else {
    programEEPROM.value = false
    programEEPROMCheckBoxDisabled.value = false
  }
})

//
// don't process event if dialog not visible
store.eventBus.on('PROGRAM_NODE_PROGRESS', (text) => {
  if (model.value){
    timeStampedLog(name + ': PROGRAM_NODE_PROGRESS event: ' + text)
    progressText.value = text
    if (text.includes('FIRMWARE:')){
      const array = text.split('FIRMWARE:')
      FIRMWARE_STATUS.value = array[1]
    }
  }
})

//
//
const clearAllSelections = () => {
  timeStampedLog( name + `: clearFileSelected` )
  uploadFile.value = null
  showFileInfo.value = false
  //
  programCONFIG.value = false
  programEEPROM.value = false
  cpuTypeCheckIgnore.value = false
  bootModeFlag.value = false
  //
  programEEPROMCheckBoxDisabled.value = false
  cpuTypeCheckBoxDisabled.value = false
  bootModeCheckBoxDisabled.value = false
}

//
// don't process event if dialog not visible
store.eventBus.on('FIRMWARE_INFO', (data) => {
  if (model.value){
    //timeStampedLog( name + `: FIRMWARE_INFO event: ${JSON.stringify(data)}` )
    timeStampedLog( name + `: FIRMWARE_INFO event:` )
    let nodeCpuType = store.state.nodes[props.nodeNumber].parameters[9]
    let nodeModuleType = store.state.nodes[props.nodeNumber].parameters[3]
    fileModuleID.value = "A5" + decToHex(data.moduleID, 2)
    fileCpuType.value = data.targetCpuType
    fileVersion.value = data.versionNumber
    fileLoadAddress.value = data.loadAddress
    fileBootable.value = data.bootable
    if (data.betaNumber > 0){
      fileVersion.value += ' beta ' + data.betaNumber
    }
    showFileInfo.value = true
    // check matching CPU type
    if (nodeCpuType != undefined){
      //timeStampedLog( name + `: FIRMWARE_INFO event: node ${props.nodeNumber} cpuTypes ${fileCpuType.value} ${nodeCpuType}` )
      if (fileCpuType.value != nodeCpuType){
        cpuTypeCheckIgnore.value = true
        cpuTypeCheckBoxDisabled.value = true
        $q.notify({
          message: `WARNING: CPU types do not match` ,
          caption: "PROCEED accepts the mismatch, and forces EEPROM to be programmed, CANCEL clears all selections",
          timeout: 0,
          position: 'center',
          color: 'primary',
          actions: [
            { label: 'PROCEED', color: 'white', handler: async () => {
              timeStampedLog( name + `: FIRMWARE_INFO event: PROCEED` )
            } },
            { label: 'CANCEL', color: 'white', handler: () => {
              timeStampedLog( name + `: FIRMWARE_INFO event: CANCEL` )
              clearAllSelections()
            } }
          ]
        })
      }
    }
    // check matching module type
    if (nodeModuleType != undefined){
      //timeStampedLog( name + `: FIRMWARE_INFO event: node ${props.nodeNumber} module Types ${data.moduleID} ${nodeModuleType}` )
      if (data.moduleID != nodeModuleType){
        programEEPROM.value = true
        programEEPROMCheckBoxDisabled.value = true
        $q.notify({
          message: `WARNING: Module types do not match` ,
          caption: "PROCEED accepts the mismatch, and forces EEPROM to be programmed, CANCEL clears all selections",
          timeout: 0,
          position: 'center',
          color: 'primary',
          actions: [
            { label: 'PROCEED', color: 'white', handler: async () => {
              timeStampedLog( name + `: FIRMWARE_INFO event: PROCEED` )
            } },
            { label: 'CANCEL', color: 'white', handler: () => {
              timeStampedLog( name + `: FIRMWARE_INFO event: CANCEL` )
              clearAllSelections()
            } }
          ]
        })
      }
    }
  }
})


onBeforeMount(() => {
  timeStampedLog( name + `: onBeforeMount node ${props.nodeNumber}` )
})

onMounted(() => {
  timeStampedLog( name + `: onMounted node ${props.nodeNumber}` )
})

onUpdated(() =>{
  timeStampedLog( name + `: onUpdated node ${props.nodeNumber}` )
})


/*/////////////////////////////////////////////////////////////////////////////

// Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickInfo = () => {
  console.log(name + `: clickInfo`)
  showInfoDialog.value = true
}

//
//
const clickProgram = async () => {
  flags = programCONFIG.value ? flags | 1 : flags & ~1   // program CONFIG
  flags = programEEPROM.value ? flags | 2 : flags & ~2   // program EEPROM
  flags = cpuTypeCheckIgnore.value ? flags | 4 : flags & ~4   // ignore CPUTYPE
  flags = bootModeFlag.value ? flags | 8 : flags & ~8   // program in BOOTMODE
  cpuType = store.state.nodes[props.nodeNumber].parameters[9]
  console.log(name + ": clickProgram: node: " + props.nodeNumber + ' cpuType: '+ cpuType +' flags: ' + flags)
  FIRMWARE_STATUS.value = ''
  if (uploadFile.value){
    store.methods.program_node(props.nodeNumber, cpuType, flags, uploadFile.value)
  } else {
    console.log(name + `: clickProgram: uploadFile no value `)
  }
}

//
//
const clickClose = async () => {
  console.log(name + ': clickClose: flags: ' + flags)
  if (flags & 2){
    // re-programmed EEPROM, so refresh node list
    store.methods.query_all_nodes()
  } else {
    // parameters probably changed due to programming, so reload
    store.methods.request_all_node_parameters(props.nodeNumber, 20, 100)
  }
  model.value = false   // close the dialog
}

</script>

<style scoped>

</style>
