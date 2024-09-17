<template>
  <q-dialog v-model="model">

    <!-- min-width: has no effect on q-dialog -->
    <q-card  style="min-width: 800px" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            System backups for layout: {{ store.state.layout.layoutDetails.title }} 
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

      <q-card inline class="q-pa-xs" flat style="max-width: 500px">
            <q-card-section class="q-pa-xs">
              <div class="text-h6">List of Backups</div>
              <q-table
                flat bordered
                dense
                :rows="teRows"
                :columns="teColumns"
                row-key="name"
                hide-header
                :pagination="{rowsPerPage: 10}"
              >
                <template #body-cell="props">
                  <q-td :props="props" >
                    <q-btn
                      flat
                      color="primary"
                      :label="props.value"
                      @click="clickBackupList(props.value)"
                    />
                  </q-td>
                </template>
              </q-table>          
            </q-card-section>
          </q-card>




    </q-card>

  </q-dialog>

</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "BackupDialog"
const backupConfirmation = ref("")
const teRows = ref([])

const teColumns = [
  {name: 'backup', field: 'backup', required: true, label: 'backup', align: 'left', sortable: true},
]

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
  store.methods.request_backups_list(store.state.layout.layoutDetails.title)
})

const backupList = computed(() => {
  return store.state.backups_list
})

// need to update when new layout added
watch(backupList, () => {
  console.log(name + `: WATCH backupList`)
  updateBackupList()
})

const updateBackupList = () => {
  teRows.value = []
  backupList.value.forEach(backup => {
    console.log(name + `: update ` + backup)
    teRows.value.push({"backup" : backup})
  })
}

onBeforeMount(() => {
})

onMounted(() => {
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickBackup = () => {
  backupConfirmation.value = ""
  //create timestamp for filename
  var date = new Date()
  var timestamp = date.getFullYear()  + '-' +
    date.getMonth() + '-' +
    date.getDate()  + '_' +
    date.getHours()  + '-' +
    date.getMinutes()  + '-' +
    date.getSeconds()
  var fileName = "backup_" + timestamp
  console.log(name + `: clickBackup ` + fileName)
  var data = {
    fileName: fileName,
    layout: store.state.layout
  }
  store.methods.save_backup(data)
  backupConfirmation.value = "Backup saved to " + fileName
  store.methods.request_backups_list(store.state.layout.layoutDetails.title)
}

const clickBackupList = (row) => {
  console.log(name + ': clickBackupList on ', row)
}



</script>

<style scoped>

</style>
