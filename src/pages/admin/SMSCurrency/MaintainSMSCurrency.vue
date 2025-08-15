<template>

  <q-card bordered flat style="background: none" class="q-ma-lg">
    <q-card class="col-12" flat>
      <q-toolbar class="q-pa-sm text-h6 bg-grey-4">
        CURRENCY
      </q-toolbar>
      <q-card-section>
        <q-form ref="currencyForm" @submit.prevent="onSaveCurrency">


          <div class="row justify-center q-col-gutter-md col-lg-12 col-md-12 col-sm-12">
            <div class="col-8">
              <div class="row justify-end q-mb-md">
                <q-btn no-caps color="primary">Configure Charges</q-btn>
              </div>
              <div class="row q-col-gutter-md col-lg-12 col-md-12 col-sm-12">
                <div class="col-md-6">
                  <q-select
                    outlined
                    :rules="[val => !!val || 'Currency is required']"
                    dropdown-icon="expand_more"
                    @update:model-value="onChangeCurrency"
                    map-options
                    option-label="crncyNm"
                    option-value="crncyId"
                    v-model="form.crncyId"
                    :options="assignableCurrencyList"
                    label="Currency"
                  />
                </div>

                <div class="col-md-6">
                  <q-select
                    outlined
                    :rules="[val => !!val || 'Status is required']"
                    dropdown-icon="expand_more"
                    v-model="form.status"
                    :options="['Active', 'Inactive']"
                    label="Status"
                  />
                </div>
              </div>

              <div class="row  q-gutter-sm justify-end">
                <q-btn size="13px"
                       :loading="adminStore.loading"
                       type="submit"
                       no-caps color="positive">
                  Save
                </q-btn>
                <q-btn no-caps size="13px" @click.prevent="router.go(-1)" color="red-5">
                  Close
                </q-btn>
              </div>
            </div>

          </div>


        </q-form>
      </q-card-section>
    </q-card>
  </q-card>
</template>

<script setup lang="ts">

import {computed, onMounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useAdminOfficesStore} from "stores/admin-office-store";
import {SmsAlertCurrency} from "components/models";
import {useCommonUtility} from "src/utility/common";
import {useAlerts} from "src/utility/alerts";


const router = useRouter();
const route = useRoute();
const adminStore = useAdminOfficesStore();
const utility = useCommonUtility();
const alerts = useAlerts();

onMounted(() => {
  findInstitutionCurrencies();
  findCurrencyByUUID(route.params.id);
})

const form = ref<SmsAlertCurrency>({
  smsAlertCrncyId: null,
  crncyId: null,
  crncyNm: null,
  crncyIso: null,
  status: 'Active',
  createdBy: 'TEST',
  createDt: null,
  modifiedBy: 'TEST',
  modifyDt: null,
  itemUuid: null
})

const assignableCurrencyList = computed(() => {
  return adminStore.assignableCurrencyList;
});

watch(
  () => form.value.crncyIso,
  (newValue) => {
    if (newValue) {
      form.value.crncyIso = newValue?.toUpperCase();
    }
  }
);

function onChangeCurrency(val: any) {
  let currency = assignableCurrencyList.value.filter(f => f.crncyId == val)!;
  form.value.crncyNm = currency[0].crncyNm;
}


async function findInstitutionCurrencies() {
  try {
    await adminStore.findInstitutionCurrencies();
    if (adminStore.response.code !== '00') {
      alerts.showAlert(adminStore.response);
      return;
    }
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

async function findCurrencyByUUID(uuid: string) {
  if (uuid == undefined)
    return;

  try {
    let request = {} as SmsAlertCurrency;
    request.itemUuid = uuid;
    await adminStore.findCurrencyByUUID(request);
    if (adminStore.response.code !== '00') {
      alerts.showAlert(adminStore.response);
      return;
    }
    populateForm(adminStore.currencyData)
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}


function populateForm(data: SmsAlertCurrency) {
  form.value = {
    ...data,
    createDt: null, modifyDt: null
  };
}


async function onSaveCurrency() {
  try {
    let request = {} as SmsAlertCurrency;
    request = form.value;
    await adminStore.maintainCurrency(request);
    if (adminStore.response.code !== '00') {
      alerts.showAlert(adminStore.response);
      return;
    }
    alerts.showAlert(adminStore.response);
    router.go(-1);
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

</script>


<style scoped>

</style>
