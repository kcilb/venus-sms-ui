<template>
  <q-dialog v-model="dialogStore.tiers" persistent transition-show="scale" transition-hide="scale">
    <q-card style="width: 810px; max-width: 90vw;">
      <q-card-section class="bg-primary">
        <div class="text-h6 text-white">Charge Tiers
          <q-chip>{{ currencyData.crncyIso }}</q-chip>
        </div>

      </q-card-section>
      <q-card-section class="q-mt-sm">
        <div class="col-12">
          <div class="row ">
            <div class="col-12 flex justify-end">
              <q-btn class="q-mr-sm" no-caps color="primary" @click="onClickAddTier">
                Add Tier
              </q-btn>
            </div>
          </div>
          <q-table
            :virtual-scroll-sticky-size-start="300"
            virtual-scroll
            flat
            :virtual-scroll-item-size="20"
            class="q-mt-md tb-height"
            :loading="adminStore.loading"
            :rows="changeTierList"
            :columns="columns"
            no-data-label="No Tiers found"
            row-key="name"
            :filter="filter"
            v-model:pagination="pagination"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="tb-header"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="minValue" :props="props">
                  <q-input style="width: 100px" type="number" :readonly="true" outlined dense filled
                           v-model="props.row.minValue"></q-input>
                </q-td>
                <q-td key="maxValue" :props="props">
                  <q-input style="width: 100px" type="number" :filled="isGenerated[props.rowIndex]"
                           :readonly="isGenerated[props.rowIndex]" outlined dense
                           v-model="props.row.maxValue"></q-input>
                </q-td>

                <q-td key="vendorCharge" :props="props">
                  <q-input type="number" outlined dense v-model="props.row.vendorCharge">

                  </q-input>
                </q-td>

                <q-td key="bankCharge" :props="props">
                  <q-input type="number" outlined dense v-model="props.row.bankCharge"></q-input>

                </q-td>

                <q-td key="exciseCharge" :props="props">
                  <q-input type="number" outlined dense v-model="props.row.exciseCharge">

                  </q-input>
                </q-td>

                <q-td key="action" :props="props">
                  <q-btn @click="onClickDelete(props.row)"
                         v-if="++props.rowIndex == changeTierList.length" glossy round
                         color="red-5"
                         outline
                  >
                    <q-icon size="17px" name="delete"></q-icon>
                  </q-btn>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data="{ icon, message, filter }">
              <div class="full-width row flex-center text-red-3 q-gutter-sm">
                <q-icon size="2em" name="info"/>
                <span>
            {{ message }}
          </span>
              </div>
            </template>
          </q-table>
          <q-separator></q-separator>

          <div class="q-mt-sm col-12 flex justify-end">
            <q-btn no-caps class="q-mr-sm" :loading="adminStore.loading" label="Save" color="positive"
                   @click="onClickSaveTier"/>
            <q-btn no-caps :disable="adminStore.loading" @click="onClose" label="Close" color="red-5"
                   v-close-popup/>
          </div>
        </div>
      </q-card-section>


    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import {useDialogStore} from "stores/dialog-store";
import {computed, ref, watch} from "vue";
import {useAdminOfficesStore} from "stores/admin-office-store";
import {useAlerts} from "src/utility/alerts";
import {ChargeTierRequest, ChargeTiers} from "components/models";
import moment from "moment";
import {useCommonUtility} from "src/utility/common";

const dialogStore = useDialogStore();
const adminStore = useAdminOfficesStore();
const alerts = useAlerts();
const utility = useCommonUtility();
const props = defineProps(['currencyData']);
const emit = defineEmits(['onClickClose'])

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
})

const filter = ref('');

const columns = ref([
  {name: 'minValue', align: 'left', label: 'Min', field: 'minValue'},
  {name: 'maxValue', align: 'left', label: 'Max', field: 'maxValue'},
  {name: 'vendorCharge', align: 'left', label: 'Vendor Charge', field: 'vendorCharge'},
  {name: 'bankCharge', align: 'left', label: 'Bank Charge', field: 'bankCharge'},
  {name: 'exciseCharge', align: 'left', label: 'Tax Charge', field: 'exciseCharge'},
  {name: 'action', align: 'left', label: '', field: 'action'}
])


const isGenerated = ref([]) as any;

const changeTierList = computed(() => {
  let i = 0;
  while (i < (adminStore.chargeTierList.length - 1)) {
    isGenerated.value[i] = true;
    i++;
  }
  return adminStore.chargeTierList;
});


watch(
  () => props.currencyData,
  (newValue) => {
    if (dialogStore.tiers) {
      findCurrencyChargeTier(newValue.smsAlertCrncyId)
    }
  }
);


function onClickAddTier() {
  let items = {} as any;
  let maxValue = 0 as any;
  let tierListLength = changeTierList.value.length

  let response = {
    code: '',
    message: ''
  };

  if (tierListLength >= 1) {
    if (changeTierList.value[tierListLength - 1].maxValue <=
      changeTierList.value[tierListLength - 1]?.minValue) {
      response.code = "404";
      response.message = "Max value must be greater than min value" +
        " at row : [" + (tierListLength) + "]";
      alerts.showAlert(response);
      return;
    }
    if (changeTierList.value[tierListLength - 1].maxValue == null ||
      changeTierList.value[tierListLength - 1].maxValue == 0) {
      response.code = "404";
      response.message = "Cannot proceed without max value";
      alerts.showAlert(response);
      return;
    }

    maxValue = changeTierList.value[tierListLength - 1].maxValue;
  }

  if (tierListLength >= 1) {
    isGenerated.value[tierListLength - 1] = true;
  } else {
    isGenerated.value[tierListLength] = false;
  }

  maxValue++
  items = {
    minValue: maxValue,
    maxValue: null, taxCharge: null,
    vendorCharge: null, bankCharge: null, action: ''
  }
  changeTierList.value.push(items);
}


async function findCurrencyChargeTier(smsAlertCrncyId: number) {
  try {
    let request = <ChargeTierRequest>{};
    request.smsAlertCrncyId = smsAlertCrncyId;
    await adminStore.findCurrencyChargeTier(request);
    if (adminStore.response.code != "0") {
      alerts.showAlert(adminStore.response)
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e))
  } finally {
  }
}


async function onClickSaveTier() {
  try {
    let tierListLength = changeTierList.value.length;
    let request = <ChargeTierRequest>({});
    let tiersList = <ChargeTiers[]>([]);
    let response = {
      code: '',
      message: ''
    };

    if (tierListLength != 0) {
      if (changeTierList.value[tierListLength - 1].maxValue <=
        changeTierList.value[tierListLength - 1].minValue) {
        response.code = "404";
        response.message = "Max value must be greater than min value" +
          " at row : [" + (tierListLength) + "]";
        alerts.showAlert(response);
        return;
      }
      if (changeTierList.value[tierListLength - 1].maxValue == null ||
        changeTierList.value[tierListLength - 1].maxValue == 0) {
        response.code = "404";
        response.message = "Cannot proceed without max value"
        alerts.showAlert(response);
        return;
      }

      changeTierList.value.forEach(element => {
        let tierData = <ChargeTiers>({});
        tierData.id = element.id;
        tierData.smsAlertCrncyId = props.currencyData.smsAlertCrncyId;
        tierData.minValue = element.minValue;
        tierData.maxValue = element.maxValue;
        tierData.exciseCharge = element.exciseCharge;
        tierData.vendorCharge = element.vendorCharge;
        tierData.bankCharge = element.bankCharge;
        tierData.modifiedDate = null;
        tierData.modifiedBy = 'TEST';
        tiersList.push(tierData);
      })
    }

    request.chargeTiers = tiersList;
    request.smsAlertCrncyId = props.currencyData.smsAlertCrncyId;

    await adminStore.maintainCurrencyChargeTiers(request);
    if (adminStore.response.code != "0") {
      alerts.showAlert(adminStore.response)
      return;
    }
    alerts.showAlert(adminStore.response)
    await onClickTiers();

  } catch (e) {
    console.log(e);
    alerts.showAlert(utility.getError(e))
  }

}

async function onClickTiers() {
  await findCurrencyChargeTier(props.currencyData.smsAlertCrncyId);
}

function onClickDelete(selectedItem: any) {
  adminStore.chargeTierList.pop();
  isGenerated.value[adminStore.chargeTierList.length - 1] = false;
}

function onClose() {
  adminStore.chargeTierList = [];
  emit('onClickClose')
}
</script>


<style scoped>

</style>
