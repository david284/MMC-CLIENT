<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Module Descriptor
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>


      <div class=" row items-start q-gutter-md">
        <q-card class="q-pa-sm" style="min-width: 350px">
          <q-card-section>
            {{ moduleDescriptorName }}
            <div class="text-subtitle2" v-if="!moduleDescriptorValid">
              <p class="text-negative">Module Descriptor not found</p>
            </div>
          </q-card-section>
          <q-card-actions align="evenly" class="text-primary">
            <q-btn color="positive" :disabled="!moduleDescriptorValid" label="View" @click="clickView()" no-caps/>
            <q-btn color="positive" :disabled="!moduleDescriptorValid" label="Download" @click="clickDownload()" no-caps/>
            <q-btn color="positive" label="Upload" @click="clickUpload()" no-caps/>
          </q-card-actions>
        </q-card>
      </div>


      <q-dialog v-model="showModuleDescriptorViewDialog" persistent>
        <q-card style="min-width: 350px">

          <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
            <div class="text-h6">
              Module Descriptor Data
            </div>
            <template v-slot:action>
              <q-btn flat color="white" size="md" label="Close" v-close-popup/>
            </template>
          </q-banner>

          <q-card-section>
            <q-card-actions align="right" class="text-primary">
            </q-card-actions>
             <p>
              {{ JSON.stringify(store.state.nodeDescriptors[store.state.selected_node], null, "  ") }}
            </p>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn color="positive" label="Close" v-close-popup />
          </q-card-actions>

        </q-card>
      </q-dialog>


      <q-dialog v-model="showModuleDescriptorDownloadDialog" persistent>
        <q-card style="min-width: 350px">

          <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
            <div class="text-h6">
              Download  {{ moduleDescriptorFilename }}
            </div>
            <template v-slot:action>
              <q-btn flat color="white" size="md" label="Close" v-close-popup/>
            </template>
          </q-banner>

          <q-card-actions align="right" class="text-primary">
          <q-btn color="positive" label="Download" v-close-popup="2"  @click="actionDownload(moduleDescriptorFilename)" />
          </q-card-actions>

        </q-card>
      </q-dialog>


      <q-dialog v-model="showModuleDescriptorUploadDialog" persistent>
        <q-card style="min-width: 500px">

          <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
            <div class="text-h6">
              File upload
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
            // Only close top dialog - this gives time for underlying dialogs to update
            <q-btn color="positive" label="Upload" v-close-popup  @click="actionUpload()" />
          </q-card-actions>

        </q-card>
      </q-dialog>
    

    </q-card>
  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "ManageModuleDescriptorsDialog"
const showModuleDescriptorDownloadDialog = ref(false)
const showModuleDescriptorUploadDialog = ref(false)
const showModuleDescriptorViewDialog = ref(false)
const moduleDescriptorValid = ref(false)
const uploadFile = ref()


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


const moduleDescriptorFilename = computed(() => {
  return store.state.nodes[store.state.selected_node].moduleDescriptorFilename
})

/* don't know why this watch causes a crash at startup ?
watch(moduleDescriptorFilename, () => {
  console.log(`WATCH moduleDescriptorFilename`)
})
*/


const moduleDescriptorName = computed(() => {
  var name = ''
  if (store.state.nodes[store.state.selected_node].moduleDescriptorFilename){
    name = store.state.nodes[store.state.selected_node].moduleDescriptorFilename.split(".", 1)[0]
    checkFileLoad()
  }
  return name
})


onBeforeMount(() => {
})

onMounted(() => {
})




const checkFileLoad = () => {
  console.log(`checkFileLoad`)
  if (store.state.nodeDescriptors[store.state.selected_node]) {
    // descriptor exists
    moduleDescriptorValid.value = true
    console.log(name + `: WATCH moduleDescriptorFilename ` + moduleDescriptorValid.value)
  } else{
    console.log(name + `: checkFileLoad failed for node ` + store.state.selected_node)
  }
}


const actionDownload = () => {
    let text = JSON.stringify(store.state.nodeDescriptors[store.state.selected_node], null, "  ")
    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', store.state.nodes[store.state.selected_node].moduleDescriptorFilename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);     
  }


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
          console.log(name + `: actionUpload: result: ` + JSON.stringify(resultOBJ))
          store.methods.import_module_descriptor(resultOBJ)
        } catch(e){
          console.log(name + `: actionUpload: failed JSON parse`)
        }
      }
      uploadFile.value=null
    } else {
      console.log(name + `: actionUpload: uploadFile no value `)
    }
  }


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickDownload = () => {
  console.log(name + `: clickDownload`)
  showModuleDescriptorDownloadDialog.value = true
}


const clickUpload = () => {
  console.log(name + `: clickUpload`)
  showModuleDescriptorUploadDialog.value = true
}


const clickView = () => {
  console.log(name + `: clickView`)
  showModuleDescriptorViewDialog.value = true
}




</script>

<style scoped>

</style>
