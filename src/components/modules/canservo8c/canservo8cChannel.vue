<template>
  <div class=" row items-start q-gutter-md">
    <q-card class=" q-pa-xs row">
      <q-card-section class=" q-pa-xs row">
        <div class="text-subtitle1">Channel {{ Channel }}</div>
      </q-card-section>
      <div class="row items-start q-gutter-xs">
      <q-card-section>
        <node-variable-slider
          :nodeVariableIndex="BaseNode"
          :nodeNumber="store.state.selected_node"
          Title="On Position"
          Description="Set On Position"
          :learn=true
          Badge="On Pos"
          :BadgeMulti=1
          BadgeUnit="">
        </node-variable-slider>
      </q-card-section>
      <q-card-section>
        <node-variable-slider
          :nodeVariableIndex="BaseNode+1"
          :nodeNumber="store.state.selected_node"
          Title="Off Position"
          Description="Set Off Position"
          :learn=true
          Badge="Off Pos"
          :BadgeMulti=1
          BadgeUnit="">
        </node-variable-slider>
      </q-card-section>
      <q-card-section>
        <node-variable-slider
          :nodeVariableIndex="BaseNode+2"
          :nodeNumber="store.state.selected_node"
          Title="On Speed"
          Description="Set Speed to On Position"
          :learn=true
          Badge="On Speed"
          :BadgeMulti=1
          BadgeUnit="">
        </node-variable-slider>
      </q-card-section>
      <q-card-section>
        <node-variable-slider
          :nodeVariableIndex="BaseNode+3"
          :nodeNumber="store.state.selected_node"
          Title="Off Speed"
          Description="Set Speed to Off Position"
          :learn=true
          Badge="Off Speed"
          :BadgeMulti=1
          BadgeUnit="">
        </node-variable-slider>
      </q-card-section>
      </div>
    </q-card>
<!--    <NodeVariable :node-variable-index="BaseNode"
                  :node-number=store.state.selected_node>
    </NodeVariable>-->
  </div>
</template>

<script setup>
import NodeVariableNumber from "components/modules/common/NodeVariableNumber"
import NodeVariableSlider from "components/modules/common/NodeVariableSlider"
import NodeVariableBit from "components/modules/common/NodeVariableBit"
import {inject, onBeforeMount, ref, computed, watch} from "vue"

const props = defineProps({
  "NodeNumber": {
    type: Number,
    required: true
  },
  "Channel": {
    type: Number,
    required: true
  },
  "Title": {
    type: String,
    default: ""
  },
  "Description": {
    type: String,
    default: ""
  },
  "Badge": {
    type: String,
    default: ''
  },
  "BadgeMulti": {
    type: Number,
    default: 1
  },
  "BadgeUnit": {
    type: String,
    default: ""
  }
})

const store = inject('store')
const BaseNode = (props.Channel * 4) + 1


/*onBeforeMount(() => {
  store.methods.request_all_node_variables(store.state.selected_node, store.state.nodes[store.state.selected_node].parameters[6], 100, 1)
})*/

</script>

<style scoped>

</style>
