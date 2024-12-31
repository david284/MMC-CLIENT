<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 450px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Advanced functions
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <q-card-actions align="left">
          <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Node 0 parameters"
          @click="clickNodeZeroParameters()"  v-close-popup/>
        </q-card-actions>


      </q-card>
    </q-dialog>

    <nodeParametersDialog v-model='showNodeParametersDialog'
        :nodeNumber = 0
      />

      <NodeParametersLoadingDialog v-model='showNodeParametersLoadingDialog'
        :nodeNumber = 0
         @NodeParametersLoadingDialog="nodeParametersLoadingReturn = $event"
      />


</template>


<script setup>


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import {sleep} from "components/functions/utils.js"
import nodeParametersDialog from "components/dialogs/NodeParametersDialog"
import NodeParametersLoadingDialog from "components/dialogs/NodeParametersLoadingDialog"
import { date, useQuasar, scroll } from 'quasar'

const $q = useQuasar()

const store = inject('store')
const name = "NodesViewAdvancedDialog"
const showNodeParametersDialog = ref(false)
const showNodeParametersLoadingDialog = ref(false)
const nodeParametersLoadingReturn = ref('')

const props = defineProps({
  modelValue: { type: Boolean, required: true }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})

const checkNodeParameters = async (nodeNumber) => {
  //console.log(name + ': checkNodeParameters: node ' + nodeNumber)
  nodeParametersLoadingReturn.value=''
  showNodeParametersLoadingDialog.value = true
  // wait for parameters to load
  for (let i = 0; i < 1000; i++){
     if (nodeParametersLoadingReturn.value.length > 0) break
     await sleep (10)
  }
  showNodeParametersLoadingDialog.value = false
  var result = (store.state.nodes[nodeNumber].parameters[9] != undefined)? true : false
  if (result == false){
    $q.notify({
      message: 'Reading Node Parameters has failed',
      caption: 'please check connections to node',
      timeout: 5000,
      type: 'warning',
      position: 'center',
      actions: [ { label: 'Dismiss' } ]
    })
  }
  return result
}



/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


const clickNodeZeroParameters = async () => {
  console.log(name + `: clickNodeZeroParameters`)
  // clear out parameters to force them to be reloaded
  if (store.state.nodes[0] == undefined){ store.state.nodes[0] = {} }
  store.state.nodes[0].parameters = {}
  if (await checkNodeParameters(0)){
    //console.log(name + `: clickParameters: checkNodeParameters true`)
//    await select_node_row(0)
    //console.log(name + `: clickParameters: node ` + nodeNumber)
    showNodeParametersDialog.value = true
  }
}

</script>

<style scoped>

</style>
