<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 450px; min-height: 500px;">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
             Backup node {{ store.getters.node_name(nodeNumber) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
        
        <q-card-section>
          <div></div>
          <div></div>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Node backup is starting...</div>
          <div class="text-h6">Please wait</div>
        </q-card-section>

      </q-card>
    </q-dialog>

    <EventVariablesLoadingDialog v-model='showEventVariablesLoadingDialog'
      :nodeNumber = nodeNumber
      @EventVariablesLoadingDialog="eventVariablesLoadingReturn = $event"
    />

    <NodeVariablesLoadingDialog v-model='showNodeVariablesLoadingDialog'
      :nodeNumber = nodeNumber
      @NodeVariablesLoadingDialog="nodeVariablesLoadingReturn = $event"
    />


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import {refreshEventIndexes} from "components/functions/EventFunctions.js"
import EventVariablesLoadingDialog from "components/dialogs/EventVariablesLoadingDialog"
import NodeVariablesLoadingDialog from "components/dialogs/NodeVariablesLoadingDialog"

const $q = useQuasar()
const store = inject('store')
const name = "NodeBackupDialog"
const eventVariablesLoadingReturn = ref('')
const nodeVariablesLoadingReturn = ref('')
const showEventVariablesLoadingDialog = ref(false)
const showNodeVariablesLoadingDialog = ref(false)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

watch(model, () => {
  //console.log(name + `: WATCH model`)
  if (model.value){
    // model is true when dialog made visible
    backupNode()
  }
})


//
// At this point we already have all the node parameters
// So read all the node variables
// and then read all the events & variables
//
const backupNode = async () => {
  console.log(name + `: backupNode ` + props.nodeNumber)
  var failure = false
  var result = ''

  // refresh event indexes in advance of needing it
  await refreshEventIndexes(store, props.nodeNumber)
  let startTime = Date.now()

  //
  // load node variables
  nodeVariablesLoadingReturn.value =''
  showNodeVariablesLoadingDialog.value = true
  // wait for variables to load
  for (let i = 0; i < 1000; i++){
    if (nodeVariablesLoadingReturn.value.length > 0) 
    {
      failure = false  // not failed it we exit early
      break
    }
    await sleep (10)
    var failure = true  // ensure it's marked as failure in case it times out
  }
  showNodeVariablesLoadingDialog.value = false
  if (failure) {
    console.log(name + `: backupNode ` + props.nodeNumber + ' failed to load Node variables')
    result = "Node variable load failed"
  }

  // wait until enough time elapsed for refresh indexes
  while ((Date.now() - startTime) < 2000) {
    await sleep(100)
  }


  if (failure == false){
    //
    // now load all event variables
    eventVariablesLoadingReturn.value =''
    showEventVariablesLoadingDialog.value = true
    // wait for variables to load
    for (let i = 0; i < 10000; i++){
      if (eventVariablesLoadingReturn.value.length > 0) 
      {
        failure = false  // not failed it we exit early
        break
      }
      await sleep (10)
      var failure = true  // ensure it's marked as failure in case it times out
    }
    showEventVariablesLoadingDialog.value = false
    
    if (failure) {
      console.log(name + `: backupNode ` + props.nodeNumber + ' failed to load Event variables')
      result = "Event variable load failed"
    } else {
      // now store backup if it was successfull
      store.methods.save_node_backup(props.nodeNumber, store.state.nodes[props.nodeNumber])
      result = "Backup completed"
    }
  }

  $q.notify({
    message: result,
    timeout: 0,
    type: 'info',
    position: 'center',
    actions: [ { label: 'Dismiss', handler: () => { model.value = false }} ]
  })

}



onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


</script>

<style scoped>

</style>
