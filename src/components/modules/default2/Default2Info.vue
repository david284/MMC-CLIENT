<template>
  <div class=" row items-start q-gutter-md">
    <q-card class="q-pa-sm" style="max-width: 300px">
      <q-card-section>
        <div class="text-h6">Node Details</div>
        <div class="text-subtitle2">Details to help identify the Node</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="q-pa-xs"
          outlined
          v-model="nodeName"
          label="Node Name"
          maxlength="30"
          @change="update_node">
        </q-input>

<!--         <q-select
          class="q-pa-sm"
          outlined
          v-model="nodeColour"
          :options="store.state.colours"
          label="Node Colour"
          maxlength="30"
          @update:model-value="update_node">
        </q-select>
 -->
<!--         <q-select
          class="q-pa-sm"
          outlined
          use-input
          v-model="nodeGroup"
          :options="groupList"
          label="Node Group"
          maxlength="30"
          new-value-mode="add-unique"
          @update:model-value="update_node">
        </q-select>
 -->
      </q-card-section>
    </q-card>

    <q-card class="q-pa-sm" style="max-width: 300px">
      <q-card-section>
        <div class="text-h6">Node Information</div>
      </q-card-section>
      <q-card-section>
        <node-parameter Name="Node Number"
                        :Value="store.state.nodes[store.state.selected_node].nodeNumber">
        </node-parameter>
        <node-parameter Name="Events Currently Stored"
                        :Value="store.state.nodes[store.state.selected_node].eventCount">
        </node-parameter>
      </q-card-section>
    </q-card>
    <q-card class="q-pa-sm" style="max-width: 300px">
      <q-card-section>
        <div class="text-h6">Module Information</div>
      </q-card-section>
      <q-card-section>
        <node-parameter Name="Manufacturer"
                        :Value="store.state.nodes[store.state.selected_node].moduleManufacturerName">
        </node-parameter>
        <node-parameter Name="Module"
                        :Value="store.state.nodes[store.state.selected_node].moduleName">
        </node-parameter>
        <node-parameter Name="Module Identifier"
                        :Value="store.state.nodes[store.state.selected_node].moduleIdentifier">
        </node-parameter>
        <node-parameter Name="Producer"
                        :Value="store.state.nodes[store.state.selected_node].producer">
        </node-parameter>
        <node-parameter Name="Consumer"
                        :Value="store.state.nodes[store.state.selected_node].consumer">
        </node-parameter>
        <node-parameter Name="Consume own Events"
                        :Value="store.state.nodes[store.state.selected_node].coe">
        </node-parameter>
        <node-parameter Name="Node Variables"
                        :Value="store.state.nodes[store.state.selected_node].parameters[6]">
        </node-parameter>
        <node-parameter Name="Events Supported"
                        :Value="store.state.nodes[store.state.selected_node].parameters[4]">
        </node-parameter>
        <node-parameter Name="Event Variables"
                        :Value="store.state.nodes[store.state.selected_node].parameters[5]">
        </node-parameter>
        <node-parameter Name="Filename"
                        :Value="moduleDescriptorFilename">
        </node-parameter>
      </q-card-section>
    </q-card>
    <q-card class="q-pa-sm" style="max-width: 300px">
      <q-card-section>
        <div class="text-h6">Hardware Information</div>
      </q-card-section>
      <q-card-section>
        <node-parameter Name="CPU Name"
                        :Value="store.state.nodes[store.state.selected_node].cpuName">
        </node-parameter>
        <node-parameter Name="Interface"
                        :Value="store.state.nodes[store.state.selected_node].interfaceName">
        </node-parameter>
        <node-parameter Name="Firmware Version"
                        :Value="store.state.nodes[store.state.selected_node].parameters[7] +
							String.fromCharCode(store.state.nodes[store.state.selected_node].parameters[2])">
        </node-parameter>
        <node-parameter Name="Beta Version"
                        :Value="store.state.nodes[store.state.selected_node].parameters[20]">
        </node-parameter>
      </q-card-section>
    </q-card>
  </div>

  <div class=" row items-start q-gutter-md">
    <q-card class="q-pa-sm" style="max-width: 300px">
      <q-card-section>
        <div class="text-h6">Module Descriptor</div>
        {{ moduleDescriptorName }}
        <div class="text-subtitle2" v-if="!moduleDescriptorValid">
          <p class="text-negative">Module Descriptor not found</p>
        </div>
      </q-card-section>
      <q-card-actions align="evenly" class="text-primary">
        <q-btn color="positive" :disabled="!moduleDescriptorValid" label="View" @click="showModuleDescriptorViewDialog()" no-caps/>
        <q-btn color="positive" :disabled="!moduleDescriptorValid" label="Download" @click="showModuleDescriptorDownloadDialog()" no-caps/>
        <q-btn color="positive" label="Upload" @click="showModuleDescriptorUploadDialog()" no-caps/>
      </q-card-actions>
    </q-card>
  </div>

  <q-dialog v-model="ModuleDescriptorViewDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h4">Module Descriptor Data</div>
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
          </q-card-actions>
          <p>
            {{ JSON.stringify(store.state.nodeDescriptors[store.state.selected_node], null, "  ") }}
          </p>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="ModuleDescriptorDownloadDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Download {{ moduleDescriptorFilename }} </div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn flat label="Download" v-close-popup  @click="actionDownload(moduleDescriptorFilename)" />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <q-dialog v-model="ModuleDescriptorUploadDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">File upload </div>
          <div class="text-subtitle2">Select a file to upload for this type of module</div>
          <div class="text-subtitle2">The filename can be anything, as it will be stored as {{ moduleDescriptorFilename }}</div>
        </q-card-section>
        <q-file
          v-model="uploadFile"
          label="Pick one file"
          filled
          style="max-width: 300px"
        />
        <q-card-section>
          <div class="text-subtitle2">If this module descriptor already exists on the server, it will be overwritten  </div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Upload" v-close-popup  @click="actionUpload()" />
        </q-card-actions>
      </q-card>
    </q-dialog>




  <div class="q-pa-xs row">
    <p v-if="store.state.debug">
      Debug: Node JSON<br>
      <pre>
      {{ store.state.nodes[store.state.selected_node] }}
      </pre>
    </p>
  </div>


</template>

<script setup>
  import {inject, onBeforeMount, onMounted, ref, watch, computed} from "vue"
  import { useQuasar } from 'quasar'
  import NodeParameter from "components/modules/common/NodeParameter"

  const store = inject('store')

  const ModuleDescriptorDownloadDialog = ref(false)
  const ModuleDescriptorUploadDialog = ref(false)
  const ModuleDescriptorViewDialog = ref(false)
  const nodeName = ref('')
  const nodeColour = ref('')
  const nodeGroup = ref('')
  const groupList = ref([])
  const $q = useQuasar()
  const uploadFile = ref(null)
  const moduleDescriptorValid = ref(false)

  const nodeDetails = computed(() => {
    //console.log(`Computed Events`)
    return Object.values(store.state.layout.nodeDetails)
  })

  watch(nodeDetails, () => {
    //console.log(`WATCH Node Details`)
    updateGroupList()
  })


  const moduleDescriptorFilename = computed(() => {
    return store.state.nodes[store.state.selected_node].moduleDescriptorFilename
  })


  const moduleDescriptorName = computed(() => {
    var name = ''
  
    if (store.state.nodes[store.state.selected_node].moduleDescriptorFilename){
      name = store.state.nodes[store.state.selected_node].moduleDescriptorFilename.split(".", 1)[0]
    }
    return name
  })


  watch(moduleDescriptorFilename, () => {
    //console.log(`WATCH moduleDescriptorFilename`)
    checkFileLoad()
  })

  const updateGroupList = () => {
    groupList.value = []
    nodeDetails.value.forEach(node => {
      if (!groupList.value.includes(node.group)) {
        groupList.value.push(node.group)
      }
    })
  }

  var loadFile_notification_raised = false;
  const checkFileLoad = () => {
    console.log(`checkFileLoad`)
    if (loadFile_notification_raised != true) {
      // module descriptor filename won't be created if there's no moduleName
      if( store.state.nodes[store.state.selected_node].moduleName == 'Unknown'){
        $q.notify({
          message: 'module name unknown',
          timeout: 0,
          type: 'warning',
          position: 'center',
          actions: [ { label: 'Dismiss' } ]
        })
        loadFile_notification_raised = true;
      } 
      else if ((moduleDescriptorFilename.value != undefined)  
        && (store.state.nodeDescriptors[store.state.selected_node] == undefined)) 
      {
        $q.notify({
          message: 'Failed to load module file ' + moduleDescriptorFilename.value,
          timeout: 0,
          type: 'warning',
          position: 'center',
          actions: [ { label: 'Dismiss' } ]
        })
        loadFile_notification_raised = true;
      }
      if (loadFile_notification_raised) { console.log(`LoadFile notification raised`) }
    }
    if (store.state.nodeDescriptors[store.state.selected_node]) {
      // descriptor exists
      moduleDescriptorValid.value = true
      console.log(`WATCH moduleDescriptorFilename ` + moduleDescriptorValid.value)
    }
  }
  

  onMounted( () => {
    checkFileLoad()
    store.methods.request_all_node_variables(store.state.selected_node, store.state.nodes[store.state.selected_node].parameters[6], 100, 1)
  })

  onBeforeMount(() => {
    // now done in nodes.vue when node edit clicked
    store.methods.request_service_discovery(store.state.selected_node)
//    store.methods.request_diagnostics(store.state.selected_node)
    //  store.methods.request_all_node_parameters(store.state.selected_node, 20, 100)
    if (store.state.selected_node in store.state.layout.nodeDetails) {
      //console.log(`Event Layout`)
      nodeName.value = store.state.layout.nodeDetails[store.state.selected_node].name
      nodeColour.value = store.state.layout.nodeDetails[store.state.selected_node].colour
      nodeGroup.value = store.state.layout.nodeDetails[store.state.selected_node].group
    } else {
      //console.log(`Event No Layout ${props.eventIdentifier}`)
      nodeName.value = store.state.selected_node.toString() + ' - ' + store.state.nodes[store.state.selected_node].module
      nodeColour.value = "black"
      nodeGroup.value = ""
    }
    updateGroupList()
  })

  const update_node = () => {
    console.log(`Node Details Update Node`)
    if (store.state.selected_node in store.state.layout.nodeDetails === false) {
      store.state.layout.nodeDetails[store.state.selected_node] = {}
    }
    store.state.layout.nodeDetails[store.state.selected_node].name = nodeName.value
    store.state.layout.nodeDetails[store.state.selected_node].colour = nodeColour.value
    store.state.layout.nodeDetails[store.state.selected_node].group = nodeGroup.value
    store.methods.update_layout()

  }

  const showModuleDescriptorViewDialog = () => {
    console.log(`showModuleDescriptorViewDialog`)
    ModuleDescriptorViewDialog.value = true
  }

  const showModuleDescriptorDownloadDialog = () => {
    console.log(`showModuleDescriptorDownloadDialog`)
    ModuleDescriptorDownloadDialog.value = true
  }

  const showModuleDescriptorUploadDialog = () => {
    console.log(`showModuleDescriptorUploadDialog`)
    ModuleDescriptorUploadDialog.value = true
  }

  const actionDownload = (filename) => {
    let text = JSON.stringify(store.state.nodeDescriptors[store.state.selected_node], null, "  ")
    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);     
  }

  const actionUpload = () => {
    var result = {}
    if (uploadFile.value){
      let reader = new FileReader();
      reader.readAsText(uploadFile.value)
      reader.onload = function() {
        try{
          result = JSON.parse(reader.result)
          result["moduleDescriptorName"] = moduleDescriptorName.value
          console.log(`actionUpload: ` + result.moduleDescriptorName)
          store.methods.import_module_descriptor(result)
        } catch(e){
          console.log(`actionUpload: failed JSON parse`)
        }
      }
      uploadFile.value=''
    } else {
      console.log(`actionUpload: uploadFile no value `)
    }
  }

</script>

<style scoped>

</style>
