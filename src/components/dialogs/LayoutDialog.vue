<template>

    <q-dialog v-model='model' persistent>
      <q-card style="min-width: 900px">

        <q-banner inline-actions style="min-height: 0;" class="bg-primary text-white dense no-padding">
          <div class="text-h6">
            Manage Layout
          </div>
          <template v-slot:action>
            <q-btn flat color="white" size="md" label="Close" v-close-popup/>
          </template>
        </q-banner>

        <div class="q-pa-md q-mr-sm rounded-borders">
          <div class="text-h5 text-black">{{ store.state.layout.layoutDetails.title }}</div>
          <div class="text-h6 text-black">{{ store.state.layout.layoutDetails.subTitle }}</div>
        </div>

        <div class="q-pa-md row">

          <q-card class="q-pa-xs" style="max-width: 300px">
            <q-card-section class="q-pa-xs">
              <div class="text-h6">Change layout</div>
              <q-input
                class="q-pa-sm"
                outlined
                v-model="layoutName"
                label="layout name"
                maxlength="30"
                >
              </q-input>
              <p>Click on the list of layouts to select an existing layout, or enter a name for a new layout, then click change</p>
              <q-btn color="negative" label="change" @click="clickChangeLayout()" no-caps/>
            </q-card-section>
          </q-card>


          <q-card inline class="q-pa-xs" flat style="max-width: 500px">
            <q-card-section class="q-pa-xs">
              <div class="text-h6">List of Layouts</div>
              <q-table
                flat bordered
                dense
                :rows="teRows"
                :columns="teColumns"
                row-key="name"
                hide-header
                :pagination="{rowsPerPage: 10}"
              >
                <template #body-cell="props">
                  <q-td :props="props" >
                    <q-btn
                      flat
                      color="primary"
                      :label="props.value"
                      @click="clickLayouts(props.value)"
                    />
                  </q-td>
                </template>
              </q-table>          
            </q-card-section>
          </q-card>


          <q-card inline class="q-pa-md" flat style="max-width: 500px">
            <div class="text-h6 text-black">Edit layout details</div>      
            <q-input
              label="Sub Title"
              outlined
              v-model="store.state.layout.layoutDetails.subTitle"
              @change="store.methods.update_layout()">
            </q-input>
          </q-card>

        </div>

      </q-card>
    </q-dialog>

</template>


<script setup>

import {inject, onBeforeMount, onMounted, computed, watch, ref} from "vue";

const store = inject('store')
const name = "LayoutDialog"
const layoutName = ref('')
const teRows = ref([])

const teColumns = [
  {name: 'layout', field: 'layout', required: true, label: 'Layout', align: 'left', sortable: true},
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
  updateLayoutList()
})


const layoutList = computed(() => {
  return Object.values(store.state.layouts_list)
})

// need to update when new layout added
watch(layoutList, () => {
  console.log(name + `: WATCH layoutList`)
  updateLayoutList()
})


const updateLayoutList = () => {
  teRows.value = []
  layoutList.value.forEach(layout => {
    console.log(name + `: update ` + layout)
    teRows.value.push({"layout" : layout})
  })
}

/*/////////////////////////////////////////////////////////////////////////////

Click event handlers

/////////////////////////////////////////////////////////////////////////////*/

const clickChangeLayout = () => {
  console.log(name + `: Change layout`)
  store.methods.change_layout(layoutName.value)
  store.methods.request_layout_list()
  layoutName.value = ""
}

const clickLayouts = (row) => {
  console.log(name + ': clickLayouts on ', row)
  layoutName.value = row
}



onBeforeMount(() => {
})

onMounted(() => {
})




</script>

<style scoped>

</style>
