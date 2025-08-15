<template>
  <q-page-container class="flex-center" style="min-height: 100vh">
    <q-page class="row flex-center no-wrap" style="width: 100%">

      <div class="col-md-6 flex flex-center q-px-xl gt-sm">
        <div class="text-white" style="max-width: 500px">
          <h3 style="background: linear-gradient(135deg, #1976d2 0%, #004ba0 100%);
border-radius: 5px 0px 5px 0px;"
              class="text-h4 text-weight-medium q-pa-md q-mb-md">Enterprise Treasury</h3>

          <div class="q-gutter-y-md">
            <div class="row items-start">
              <q-icon name="visibility" size="10" class="q-mr-sm q-mt-xs"/>
              <div>Real-time cash positions</div>
            </div>
            <div class="row items-start">
              <q-icon name="sync_alt" size="10" class="q-mr-sm q-mt-xs"/>
              <div>Automated payment workflows</div>
            </div>
            <div class="row items-start">
              <q-icon name="security" size="10" class="q-mr-sm q-mt-xs"/>
              <div>Secure transactions</div>
            </div>
          </div>

        </div>
      </div>

      <div class="col-12 col-md-4">

        <q-tab-panels
          style="background: none"
          v-model="panel"
          animated
          swipeable
          infinite
        >
          <q-tab-panel name="change">
            <q-card class="q-pa-md shadow-10" style="width: 390px; max-width: 90vw; border-radius: 15px">
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-medium">
                  Change Password
                </div>
                <span class="text-caption text-grey-7 q-mb-sm">Real-time treasury insights | Monitoring | Reporting | Automated reconciliations | End-of-day</span>
              </q-card-section>

              <q-card-section>
                <q-form @submit="onChange">

                  <q-input
                    v-model="changeState.oldPassword"
                    label="Old Password"
                    outlined
                    class="q-mb-sm"
                    :type="isPwd ? 'password' : 'text'"
                    :rules="[val => !!val || 'password is required']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock"/>
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>

                  <q-input
                    v-model="changeState.newPassword"
                    label="New Password"
                    outlined
                    class="q-mb-sm"
                    :type="isPwd ? 'password' : 'text'"
                    :rules="[val => !!val || 'password is required']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock"/>
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>

                  <q-input
                    v-model="changeState.confirmPassword"
                    label="Confirm Password"
                    outlined
                    class="q-mb-sm"
                    :type="isPwd ? 'password' : 'text'"
                    :rules="[val => !!val || 'password is required']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock"/>
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>

                  <q-btn
                    no-caps
                    label="Change"
                    :loading="authStore.loading"
                    type="submit"
                    class="full-width q-mb-sm"
                    size="md"
                    style="background: linear-gradient(135deg, #1976d2 0%, #004ba0 100%);
color: white"
                  />

                  <div class="text-right text-caption">
                    <q-chip style="background: none" class="text-primary" clickable
                            @click.prevent="router.push('/auth/login')">
                      Back to login
                    </q-chip>
                  </div>


                </q-form>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {useRouter} from "vue-router";
import {AuthRequest, ChangeRequest} from "components/models";
import {useAuthStore} from "stores/auth-store";
import {useCommonUtility} from "src/utils/common";
import {useAlerts} from "src/utils/alerts";

const router = useRouter()
const authStore = useAuthStore();
const utility = useCommonUtility();
const alerts = useAlerts();


const loading = ref(false);
const isPwd = ref(true);
const panel = ref('change')

const changeState = ref({
  oldPassword: null,
  newPassword: null,
  confirmPassword: null
});

function reset() {
  changeState.value.newPassword = null;
  changeState.value.oldPassword = null;
  changeState.value.confirmPassword = null;
  utility.removePassword();
}

async function onChange() {
  try {
    let request = {} as ChangeRequest;
    request.userName = utility.getAuthData().loginId;
    request.oldPassword = changeState.value.oldPassword;
    request.newPassword = changeState.value.newPassword;
    request.confirmPassword = changeState.value.confirmPassword;
    await authStore.change(request);
    if (authStore.response.code !== '00') {
      alerts.showAlert(authStore.response);
      return;
    }
    alerts.showAlert(authStore.response);
    reset();
    await router.replace('/auth/login');
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

</script>

<style scoped>
@media (max-width: 1023px) {
  .gt-sm {
    display: none;
  }

  /* Perfect centering for mobile */
  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
  }

  /* Better card appearance on small devices */
  .q-card {
    width: 100% !important;
  }
}

/* Smooth transitions */
.q-tab-panels {
  transition: all 0.3s ease;
}
</style>
