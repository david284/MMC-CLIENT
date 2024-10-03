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
          The file will be stored with it's original filename<br/>
          If the module name is currently unknown, the 'name' portion from the filename will be used<br/>
          The filename format is moduleName-moduleIdentity-moduleVersion.json
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

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Program" @click="clickProgram()" />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "ProgramNodeDialog"
const uploadFile = ref()

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
      store.methods.program_node(props.nodeNumber, uploadFile.value)
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
  console.log(name + ": clickProgram: node " + props.nodeNumber)
  await actionUpload()
}



</script>

<style scoped>

</style>
