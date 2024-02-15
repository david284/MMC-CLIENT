<template>

    <q-dialog v-model='model' persistent  full-width full-height>
      <q-card class="q-pa-none q-ma-none">

        <q-card-section class="q-pa-none q-ma-none">
          <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
            <div class="text-h6">
              Cbus Error Dialog
            </div>
            <template v-slot:action>
              <q-btn flat color="white" size="md" label="Close" v-close-popup/>
            </template>
          </q-banner>
        </q-card-section>

        <q-card>
          <q-card-section style="max-height: 75vh" class="scroll no-margin no-padding">
          <q-table
            title="Nodes"
            :rows=Object.values(store.state.cbus_errors)
            :columns="columns"
            :filter="filter"
            row-key="id"
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="48"
          >
            <template v-slot:top="">
              <div class="col-4 q-table__title text-h4">CBUS Errors</div>
              <q-space />
              <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-space />
              <q-btn color="negative" label="Clear Errors" @click="clear_cbus_errors" no-caps/>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="id" :props="props">{{ props.row.id }}</q-td>
                <q-td key="type" :props="props">{{ props.row.type }}</q-td>
                <q-td key="Error" :props="props">{{ props.row.Error }}</q-td>
                <q-td key="Message" :props="props">{{ props.row.Message }}</q-td>
                <q-td key="node" :props="props">{{ props.row.node }}</q-td>
                <q-td key="count" :props="props">{{ props.row.count }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      </q-card>
    </q-dialog>

</template>


<script setup>

/************************************************************************************
      usage
      <CbusErrorsDialog v-model='showCbusErrorsDialog' />
      
************************************************************************************ */ 


import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "CbusErrorsDialog"
//const tab = ref('nodes')
const filter = ref('')

const columns = [
  {name: 'id', field: 'id', required: true, label: 'Error Id', align: 'left', sortable: true},
  {name: 'Error', field: 'Error', required: true, label: 'Error', align: 'left', sortable: true},
  {name: 'Message', field: 'Message', required: true, label: 'Message', align: 'left', sortable: true},
  {name: 'node', field: 'node', required: true, label: 'Node', align: 'left', sortable: true},
  {name: 'count', field: 'count', required: true, label: 'Count', align: 'left', sortable: false}
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
})


onBeforeMount(() => {
})

onMounted(() => {
})


const clear_cbus_errors = () => {
  store.methods.clear_cbus_errors()
}


</script>

<style scoped>

</style>
