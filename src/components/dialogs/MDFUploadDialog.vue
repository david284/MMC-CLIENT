<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            MDF upload
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

          <q-card-section>
            <div class="text-subtitle2">Current node:</div>
            <div class="text-subtitle2">
              Module name: {{ store.state.nodes[store.state.selected_node].moduleName }}<br/>
              Module identifier: {{ store.state.nodes[store.state.selected_node].moduleIdentifier }}<br/>
              Module version: {{ store.state.nodes[store.state.selected_node].moduleVersion }}<br/>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle2">If this module descriptor already exists on the server, it will be overwritten  </div>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <!-- // Only close top dialog - this gives time for underlying dialogs to update -->
            <q-btn color="positive" label="Upload" v-close-popup  @click="actionUpload()" />
          </q-card-actions>

    </q-card>
  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"

const $q = useQuasar()
const store = inject('store')
const name = "MDFUploadDialog"
const uploadFile = ref()


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: { type: Number, required: false }
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


const actionUpload = () => {
    var result = {}
    if (uploadFile.value){
      var fileName = uploadFile.value.name
      console.log(name + ': selected filename ' + fileName)
      let reader = new FileReader();
      reader.readAsText(uploadFile.value)
      reader.onload = function() {
        try{
          var resultOBJ = JSON.parse(reader.result)
          resultOBJ["moduleDescriptorFilename"] = fileName
          console.log(name + `: actionUpload: ` + resultOBJ.moduleDescriptorFilename)
//          console.log(name + `: actionUpload: result: ` + JSON.stringify(resultOBJ))
          store.methods.import_module_descriptor(props.nodeNumber, resultOBJ)
        } catch(e){
          $q.notify({
            message: 'Module Descriptor file upload has failed',
            caption: 'please check the file is valid JSON, and try again',
            timeout: 0,
            type: 'warning',
            position: 'center',
            actions: [ { label: 'Dismiss' } ]
          })
        }
      }
      uploadFile.value=null
    } else {
      console.log(name + `: actionUpload: uploadFile no value `)
    }
  }


</script>

<style scoped>

</style>
