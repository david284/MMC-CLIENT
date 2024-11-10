<template>
  <q-dialog v-model='model' persistent>
    <q-card style="min-width: 350px">
      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Download {{ moduleDescriptorFilename }}
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card style="min-width: 350px">

        <q-card-actions align="right" class="text-primary">
        <q-btn color="positive" label="Download" v-close-popup="2"  @click="actionDownload(moduleDescriptorFilename)" />
        </q-card-actions>

      </q-card>

    </q-card>
  </q-dialog>
</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "MDFDownloadDialog"


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  moduleDescriptorFilename: { type: String, required: true }
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

const actionDownload = (filename) => {
  console.log(name + `: actionDownload`)

//    let text = store.state.exported_MDF
    let text = "test"
    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
     
  }



</script>

<style scoped>

</style>
