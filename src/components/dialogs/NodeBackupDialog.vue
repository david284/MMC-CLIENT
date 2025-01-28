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
        

      </q-card>
    </q-dialog>


    <NodeVariablesLoadingDialog v-model='showNodeVariablesLoadingDialog'
      :nodeNumber = nodeNumber
      @NodeVariablesLoadingDialog="nodeVariablesLoadingReturn = $event"
    />


</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import NodeVariablesLoadingDialog from "components/dialogs/NodeVariablesLoadingDialog"

const $q = useQuasar()
const store = inject('store')
const name = "NodeBackupDialog"
const nodeVariablesLoadingReturn = ref('')
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
    console.log(name + `: WATCH model is true`)
    backupNode()
  }
})


//
// At this point we already have all the node parameters
// So read all the node variables
// and then read all the events & variables
//
const backupNode = async () => {
  console.log(name + `: clickBackupNode ` + props.nodeNumber)
  // load node variables
  nodeVariablesLoadingReturn.value =''
  showNodeVariablesLoadingDialog.value = true
  // wait for variables to load
  for (let i = 0; i < 10000; i++){
     if (nodeVariablesLoadingReturn.value.length > 0) break
     await sleep (10)
  }
  showNodeVariablesLoadingDialog.value = false
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
