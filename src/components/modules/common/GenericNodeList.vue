<template>
    <q-card style="max-height: 70vh" class="scroll q-ma-md">

        <q-card-section class="no-margin q-py-none-xs" style="width: 450px;">
          <div class="text-h6">{{ displayTitle }}</div>


          <q-table
            flat bordered
            dense
            :rows="teRows"
            :columns="teColumns"
            row-key="number"
            hide-header
            hide-bottom
            virtual-scroll
            :rows-per-page-options="[0]"
            :virtual-scroll-sticky-size-start="48"
            >

            <template v-slot:body="props">
              <q-tr :props="props" class="q-my-none q-py-none">
                <q-td key="number" :props="props">{{ props.row.number }}</q-td>
                <q-td key="name" :props="props">{{ props.row.name }}</q-td>
              </q-tr>
            </template>
          </q-table>


        </q-card-section>

  </q-card>
</template>

<script setup>
import {inject, ref, onBeforeMount, onMounted, onUpdated, computed, watch} from "vue";

const store = inject('store')
const name = "GenericNodeList"

const props = defineProps({
  nodeNumberList: {
    type: Object,
    required:true
  },
  displayTitle: {
    type: String,
    required: false
  }
})


const teRows = ref([])

const teColumns = [
  {name: 'number', field: 'number', required: true, label: 'Number', align: 'left', sortable: true},
  {name: 'name', field: 'name', required: true, label: 'Name', align: 'left', sortable: true},
]

const update_nodes_table = async () => {
//  console.log(name + `: update__nodes_table`)
  teRows.value = []
  props.nodeNumberList.forEach(nodeNumber => {
    var nodeName = store.getters.node_name(nodeNumber)
    teRows.value.push({"number" : nodeNumber, "name" : nodeName})
  })
}

onBeforeMount(() => {
//  console.log(name + `: onBeforeMount`)
})

onMounted(() => {
//  console.log(name + ': props: ' + JSON.stringify(props))
})

onUpdated(() => {
//  console.log(name + `: onUpdated`)
  update_nodes_table()
})

</script>

<style scoped>

</style>
