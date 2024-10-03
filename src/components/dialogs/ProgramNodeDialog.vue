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



</script>

<style scoped>

</style>
