<template>
  <div>
    <!--    <div class="q-pa-md q-gutter-sm">
          <q-btn color="negative" label="Check Nodes" @click="store.methods.query_all_nodes()" no-caps/>
        </div>-->
    <div>
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

      <p v-if="store.state.debug">
        {{ Object.values(store.state.cbus_errors) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue'

const store = inject('store')
const filter = ref('')

const columns = [
  {name: 'id', field: 'id', required: true, label: 'Error Id', align: 'left', sortable: true},
  {name: 'Error', field: 'Error', required: true, label: 'Error', align: 'left', sortable: true},
  {name: 'Message', field: 'Message', required: true, label: 'Message', align: 'left', sortable: true},
  {name: 'node', field: 'node', required: true, label: 'Node', align: 'left', sortable: true},
  {name: 'count', field: 'count', required: true, label: 'Count', align: 'left', sortable: false}
]

const clear_cbus_errors = () => {
  store.methods.clear_cbus_errors()
}
</script>

<style scoped>

</style>
