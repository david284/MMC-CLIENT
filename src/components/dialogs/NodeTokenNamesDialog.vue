<template>

  <q-dialog v-model="model" persistent>
    <q-card style="min-width: 500px">

      <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
        <div class="text-h6">
          Edit {{ token }} names for :  {{ store.getters.node_name(nodeNumber) }}
        </div>
        <template v-slot:action>
          <q-btn flat color="white" size="md" label="Close" v-close-popup/>
        </template>
      </q-banner>

      <q-card class="q-pa-none q-ma-none">
        <q-card-section style="max-height: 75vh" class="scroll no-margin q-py-none-xs">

          <q-table
            flat bordered
            dense
            :rows="teRows"
            :columns="teColumns"
            row-key="tokenNumber"
            hide-bottom
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="0"
            >

            <template v-slot:body="props">
              <q-tr :props="props" class="q-my-none q-py-none">
                <q-td key="tokenNumber" :props="props">{{ props.row.tokenNumber }}</q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                  <q-popup-edit v-model="props.row.name" v-slot="scope" buttons
                    @save="(newName) => nameChanged(newName, props.row.tokenNumber)">
                    <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
                  </q-popup-edit>
                </q-td>

              </q-tr>
            </template>
          </q-table>

        </q-card-section>
      </q-card>

    </q-card>
  </q-dialog>

</template>

<script setup>

import {inject, onBeforeMount, onMounted, onUpdated, computed, watch, ref} from "vue";
import * as utils from "components/functions/utils.js"

const store = inject('store')
const className = "NodeTokenNamesDialog"


const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber: { type:Number, required: true },
  token: { string:Number, required: true },
  numberOfItems: { default: 0 }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

const teRows = ref([])

//
//
const teColumns = [
  {name: 'tokenNumber', field: 'tokenNumber', required: true, label: 'Number', align: 'left', sortable: true},
  {name: 'name', field: 'name', required: true, label: 'Name (click to edit)', align: 'left', sortable: true}
]

//
//
const update_table = async () => {
  teRows.value = []
  for (let i=1; i <=props.numberOfItems; i++){
    teRows.value.push({
      "tokenNumber" : i,
      "name" : store.getters.node_token_name(props.nodeNumber, props.token, i)
    })
  }
}

//
//
const nameChanged = (name, tokenNumber) => {
  utils.timeStampedLog(className + `: nameChanged: ${tokenNumber} ${name}`)
  store.setters.node_token_name(props.nodeNumber, props.token, tokenNumber, name)
  update_table()
}

//
//
onUpdated(() => {
  //utils.timeStampedLog(name + ": onUpdated")
  update_table()
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/


</script>

<style scoped>

</style>
