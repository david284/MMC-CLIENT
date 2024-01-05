<template>

  <div class="q-pa-md q-mr-sm rounded-borders">
    <div class="text-h4 text-black">Layout</div>
  </div>

  <div class="q-pa-md row">

      <div class="q-pa-md q-mr-sm rounded-borders">
        <div class="text-h5 text-black">{{ store.state.layout.layoutDetails.title }}</div>
        <div class="text-h6 text-black">{{ store.state.layout.layoutDetails.subTitle }}</div>
      </div>

    <q-card inline class="q-pa-md" flat style="max-width: 500px">
      <div class="text-h6 text-black">Edit layout details</div>      
        <q-input
          label="Title"
          outlined
          v-model="store.state.layout.layoutDetails.title"
          @change="store.methods.update_layout()">
        </q-input>
        <q-input
          label="Sub Title"
          outlined
          v-model="store.state.layout.layoutDetails.subTitle"
          @change="store.methods.update_layout()">
        </q-input>
      </q-card>

      <q-card inline class="q-pa-xs" flat style="max-width: 500px">
      <q-card-section class="q-pa-xs">
        <div class="text-h6">List of Layouts</div>
        <q-table
          flat bordered
          dense
          :rows="teRows"
          :columns="teColumns"
          row-key="number"
          hide-header
          :pagination="{rowsPerPage: 10}"
        />
      </q-card-section>
    </q-card>


  </div>
</template>

<script setup>

import {computed, inject, onBeforeMount, ref, watch} from "vue";

const teRows = ref([])

const teColumns = [
  {name: 'layout', field: 'layout', required: true, label: 'Layout', align: 'left', sortable: true},
]


const store = inject('store')
const host = window.location.hostname


const layoutList = computed(() => {
  //console.log(`Computed Events`)
  return Object.values(store.state.layouts_list)
})


watch(layoutList, () => {
  console.log(`WATCH layoutList`)
  updateLayoutList()
})


const updateLayoutList = () => {
  teRows.value = []
  layoutList.value.forEach(layout => {
    console.log(`update ` + layout)
//    teRows.value.push({layout})
    teRows.value.push({"layout" : layout})
  })
}


onBeforeMount(() => {
  store.methods.request_layout_list()
})




</script>
