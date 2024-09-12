<template>
  <q-dialog v-model="model">

    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 800px" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            System backup  
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>


      <q-card v-if="(store.state.develop)" class="q-pa-md" flat>
        <q-btn color="positive" label="Backup" @click="clickBackup()" no-caps/>
        &emsp; backup system to user storage        
      </q-card>
      <q-card v-if="(store.state.develop)" class="q-pa-md" flat>
        {{ backupConfirmation }}
      </q-card>



    </q-card>

  </q-dialog>

</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "BackupDialog"
const backupConfirmation = ref("")

const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
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

const clickBackup = () => {
  backupConfirmation.value = ""
  var fileName = "backup_" + Date.now()
  console.log(name + `: clickBackup ` + fileName)
  var data = {
    fileName: fileName,
    layout: store.state.layout
  }
  store.methods.save_backup(data)
  backupConfirmation.value = "Backup saved to " + fileName
}




</script>

<style scoped>

</style>
