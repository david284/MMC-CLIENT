<!-- Example ChildDialog -->
<template>

<q-dialog v-model='model'>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h4">Add new event to node {{ store.state.selected_node }}</div>
          <div class="q-gutter-sm">
            <q-radio v-model="eventType" val='long' label="Long event" />
            <q-radio v-model="eventType" val='short' label="Short event" />
          </div>
        </q-card-section>
        <div v-if="(eventType == 'long')">
          <q-card-section>
            <div class="text-h4">Node Number</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input dense v-model="newNodeNumber" autofocus />
          </q-card-section>
          <q-card-section>
            <div class="text-h6">Consumed events will need the number of the node that produces the event</div>
            <div class="text-h6">Events produced by this node will need the number of this node, as well as editing the event variables</div>
          </q-card-section>
          <q-card-section>
            <div class="text-h4">Event Number</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input dense v-model="newEventNumber" autofocus />
          </q-card-section>
        </div>
        <div v-if="(eventType == 'short')">
          <q-card-section>
            <div class="text-h4">Device Number</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input dense v-model="newEventNumber" autofocus />
          </q-card-section>
        </div>
        <div v-if="(eventType != null)">
          <q-card-section>
            <div class="text-h6">Once event is added, select edit for the event from the event list to modify event variables</div>
          </q-card-section>
        </div>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup @click="closeDialog()"/>
          <q-btn flat label="Add Event" v-close-popup @click="createEvent()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>



<!--   <q-dialog v-model='model'>
    <q-card
      style='max-width: 400px; width:100%; max-height: 300px; height:100%;'>
      <q-card-section class='row items-center no-wrap'>
        <div class="text-h6">Dialog example</div>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup @click="closeDialog()"/>
        <q-btn flat label="Add Event" v-close-popup @click="createEvent()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
 -->

</template>

<script>
import { computed, inject } from 'vue';

export default {
  data() {
        return {
          newEventNumber: null,
          newNodeNumber: null,
          eventType: null
        }
    },
  name: 'AddEventDialog',
  props: {
    modelValue: { type: Boolean, required: true }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const store = inject('store')
    const model = computed({
      get() { return props.modelValue },
      set(newValue) { emit('update:modelValue', newValue) }
    })
    return { model, store };
  },
  methods:{
    createEvent(){
      console.log("createEvent " + this.newNodeNumber + ' ' + this.newEventNumber)
      console.log("selected node " + this.store.state.selected_node)
      var eventIndex = this.getFreeEventIndex()
      if (this.eventType.value == 'short'){this.newNodeNumber = 0}
      var eventID = parseInt(this.newNodeNumber).toString(16).toUpperCase().padStart(4, 0)
                  + parseInt(this.newEventNumber).toString(16).toUpperCase().padStart(4, 0)
      console.log(`createEvent - index ` + eventIndex + ` eventID ` + eventID)
      this.store.methods.teach_event(this.store.state.selected_node, eventID, eventIndex, )
      // event list will be refreshed on acknowledge (WRACK, GRSP) from node
    },
    getFreeEventIndex(){
      // need to find first free event index - node parameter [4]
      var maxEventCount = this.store.state.nodes[this.store.state.selected_node].parameters[4]
      var eventIndex = null
      for (var i=1; i < maxEventCount; i++ ){
        console.log('i ' + i)
        if (this.store.state.nodes[store.state.selected_node].storedEvents[i]) {
          continue
        } else {
          eventIndex = i + 1
          break
        }        
      }
      return eventIndex
    }

  }
};
</script>

<style scoped>

</style>
