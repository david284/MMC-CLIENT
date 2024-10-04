<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 400px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          program Node {{ store.getters.node_name(nodeNumber) }}
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card-section>
        <div class="text-subtitle2">Select a file to upload</div>
        <div class="text-subtitle2">
          Node CPU type {{ store.state.nodes[nodeNumber].cpuName }} ({{ store.state.nodes[nodeNumber].parameters[9] }})
        </div>
      </q-card-section>


 
      <q-file
        v-model="uploadFile"
        label="Pick one file"
        filled
        style="max-width: 300px"
      />

<!--
      <q-card-actions align="right" class="text-primary">
        <q-btn color="positive" label="Upload" @click="actionUpload()" />
      </q-card-actions>
--> 


      <q-card-section class="no-margin q-py-none">
        <q-checkbox v-model="checked1" label="Program config" />
      </q-card-section>
      <q-card-section class="no-margin q-py-none">
        <q-checkbox v-model="checked2" label="Program EEPROM" />
      </q-card-section>
      <q-card-section class="no-margin q-py-none">
        <q-checkbox v-model="checked4" label="Program Ignore CPU type" />
      </q-card-section>

      <q-card-section class="no-margin q-py-none">
        space for progress bar
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Program" @click="clickProgram()" />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>


<script setup>

//
//     * Flags
//     * 1 = Program CONFIG
//     * 2 = Program EEPROM
//     * 4 = Ignore CPUTYPE
//

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "ProgramNodeDialog"
const uploadFile = ref()
const checked1 = ref(true)
const checked2 = ref(true)
const checked4 = ref(false)
var flags = 0
var cpuType = undefined

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: { type:Number, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

watch(model, () => {
//  console.log(name + `: WATCH model`)
})


onBeforeMount(() => {
})

onMounted(() => {
})


const actionUpload = async () => {
  var result = {}
  if (uploadFile.value){
    var fileName = uploadFile.value.name
    console.log(name + ': selected filename ' + fileName)
    let reader = new FileReader();
    reader.readAsText(uploadFile.value)
    reader.onload = function() {
      try{
        console.log(name + `: actionUpload: result: ` + reader.result)
      } catch(err){
        console.log(name + `: actionUpload: ` + err)
      }
      store.methods.program_node(props.nodeNumber, cpuType, flags, uploadFile.value)
    }
//    uploadFile.value=null
  } else {
    console.log(name + `: actionUpload: uploadFile no value `)
  }
}



/*/////////////////////////////////////////////////////////////////////////////

// Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickProgram = async () => {
  flags = checked1.value ? flags | 1 : flags & ~1
  flags = checked2.value ? flags | 2 : flags & ~2
  flags = checked4.value ? flags | 4 : flags & ~4
  cpuType = store.state.nodes[props.nodeNumber].parameters[9]
  console.log(name + ": clickProgram: node: " + props.nodeNumber + ' cpuType: '+ cpuType +' flags: ' + flags)
  await actionUpload()
}



</script>

<style scoped>

</style>
