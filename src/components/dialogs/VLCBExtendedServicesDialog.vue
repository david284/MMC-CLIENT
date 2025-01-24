<template>
  <q-dialog v-model='model' persistent>

    <q-card style="min-width: 600px" class="q-pa-none q-ma-none">
      <q-card-section class="q-pa-none q-ma-none">
        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-margin q-py-none">
          <div class="text-h6">
            Extended service data for {{ store.state.nodes[nodeNumber].services[serviceIndex].ServiceName }}
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>
      </q-card-section>

      <q-card>
        <q-card-section class="no-margin q-pa-xs">

          <q-table
            class="vlcb-ESD-table"
            dense
            :rows=rows
            :columns="columns"
            row-key="esdIndex"
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="0"
            hide-bottom
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="esdIndex" :props="props">{{ props.row.esdIndex }}</q-td>
                <q-td key="esdValue" :props="props">{{ props.row.esdValue}}</q-td>
                <q-td key="esdName" :props="props">{{ props.row.esdName}}</q-td>
              </q-tr>
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
const name = "VLCBExtendedServicesDialog"
const rows = ref([])

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  nodeNumber:  { type: Number, required: true },
  serviceIndex:  { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })

// model changes when Dialog opened & closed
watch(model, () => {
  console.log(name + `: WATCH model`)
  update_rows()
})


const columns = [
  {name: 'esdIndex', field: 'esdIndex', required: true, label: 'Byte', align: 'left', sortable: true},
  {name: 'esdValue', field: 'esdValue', required: false, label: 'Value', align: 'left', sortable: true},
  {name: 'esdName', field: 'esdName', required: true, label: 'Name', align: 'left', sortable: true}
]



const update_rows = () => {
  try{
    const esData = store.state.nodes[props.nodeNumber].services[props.serviceIndex].ESD
    //console.log(name + `: update_rows: ` + JSON.stringify(esData))

    rows.value = []
    for (let key of Object.keys(esData).sort()) {
      console.log(name + `: update_rows: ` + key)
      let output = {}
      output['esdIndex'] = key
      output['esdValue'] = esData[key].value
      output['esdName'] = esData[key].name
      rows.value.push(output)
    }
  } catch(err){
    console.log(name + `: update_rows: ` + err)
  }
}


onBeforeMount(() => {
})

onMounted(() => {
})

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/



</script>

<style lang="sass">
.vlcb-ESD-table
  /* height or max-height is important */
  max-height: 200px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    /* otherwise you see the table scrolling underneath the header */
    background-color: $blue-grey-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
