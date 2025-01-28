<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 450px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Advanced functions for node {{ store.getters.node_name(nodeNumber) }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
        
        <q-card-actions align="left" v-if="(store.state.nodes[nodeNumber].VLCB == false)">
          <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Backup Node"
          @click="clickBackupNode()"/>
        </q-card-actions>

        <q-card-actions align="left" v-if="(store.state.nodes[nodeNumber].VLCB == false)">
          <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="CAN ID Enumeration"
          @click="clickCanIdEnumeration()"/>
        </q-card-actions>

        <q-card-actions align="left">
          <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Manage Module Descriptor"
          @click="clickMDF()"/>
        </q-card-actions>

        <q-card-actions align="left">
          <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="program Node"
          @click="clickProgramNode()"/>
        </q-card-actions>

        <q-card-actions align="left">
          <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="reset Node"
          @click="clickResetNode()"/>
        </q-card-actions>

        <q-card-actions align="left">
          <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Restore Node"
          @click="clickRestoreNode()"/>
        </q-card-actions>

        <q-card-actions align="left" v-if="(store.state.nodes[nodeNumber].VLCB == false)">
          <q-btn dense class="q-mx-xs q-my-none" color="light-blue-2" text-color="black" size="md" label="Set CANID"
          @click="clickSetCAN_ID()"/>
        </q-card-actions>

      </q-card>
    </q-dialog>

    <MDFDialog v-model='showMDFDialog'
      :nodeNumber = nodeNumber
    />

    <programNodeDialog v-model='showProgramNodeDialog'
      :nodeNumber = nodeNumber
    />

    <RestoreNodeDialog  v-model='showRestoreNodeDialog'
        :nodeNumber = nodeNumber
      />

    <setCanIdDialog v-model='showSetCanIdDialog'
      :nodeNumber = nodeNumber
    />

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";
import { date, useQuasar, scroll } from 'quasar'
import {sleep} from "components/functions/utils.js"
import MDFDialog from "components/dialogs/MDFDialog"
import programNodeDialog from "components/dialogs/programNodeDialog"
import RestoreNodeDialog from "components/dialogs/RestoreNodeDialog"
import setCanIdDialog from "components/dialogs/setCanIdDialog"

const $q = useQuasar()
const store = inject('store')
const name = "AdvancedNodeDialog"
const showMDFDialog = ref(false)
const showProgramNodeDialog = ref(false)
const showRestoreNodeDialog = ref(false)
const showSetCanIdDialog = ref(false)

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: {type: Number }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get() { return props.modelValue },
  set(newValue) { emit('update:modelValue', newValue) }
})


onBeforeMount(() => {
})

onMounted(() => {
})


/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

//
//
const clickBackupNode = () => {
  console.log(name + `: clickBackupNode ` + props.nodeNumber)
}

//
//
const clickCanIdEnumeration = () => {
  console.log(name + `: clickCanIdEnumeration ` + props.nodeNumber)
  store.methods.node_can_id_enum(props.nodeNumber)
}

const clickMDF = () => {
  console.log(name + `: clickMDF`)
  store.methods.request_matching_mdf_list(props.nodeNumber, "USER")
  store.methods.request_matching_mdf_list(props.nodeNumber, "SYSTEM")
  showMDFDialog.value = true
}

const clickProgramNode = () => {
  console.log(name + `: clickProgramNode ` + props.nodeNumber)
  showProgramNodeDialog.value = true
}

const clickResetNode = () => {
  console.log(name + `: clickResetNode ` + props.nodeNumber)
  store.methods.reset_node(props.nodeNumber)
}

const clickRestoreNode = () => {
  console.log(name + `: clickRestoreNode ` + props.nodeNumber)
  showRestoreNodeDialog.value = true
}

const clickSetCAN_ID = () => {
  console.log(name + `: clickSetCAN_ID ` + props.nodeNumber)
  showSetCanIdDialog.value = true
}



</script>

<style scoped>

</style>
