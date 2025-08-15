<template>
  <q-page-container class="page-content flex-center">
    <q-page class="row flex-center no-wrap" style="width: 100%;">

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
          <q-tab-panel name="login">
            <q-card class="q-pa-md shadow-10" style="width: 390px; max-width: 90vw; border-radius: 15px">
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-medium">
                  Login
                </div>
                <span class="text-caption text-grey-7 q-mb-sm">Real-time treasury insights | Monitoring | Reporting | Automated reconciliations | End-of-day</span>
              </q-card-section>

              <q-card-section>
                <q-form @submit.prevent="onLogin">
                  <q-input
                    v-model="loginState.username"
                    @update:model-value="onChange"
                    label="Username"
                    outlined
                    class="q-mb-sm"
                    :rules="[val => !!val || 'username is required']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person"/>
                    </template>
                  </q-input>

                  <q-input
                    v-model="loginState.password"
                    label="Password"
                    outlined
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

                  <div class="row justify-end text-caption q-mb-sm">
                    <q-chip style="background: none" class="text-primary" clickable @click="panel = 'reset'">Forgot
                      Password?
                    </q-chip>
                  </div>

                  <!--              <div class="text-caption text-grey-6 q-mt-md text-center">-->
                  <!--                <q-icon name="lock" size="xs" />-->
                  <!--                ISO 27001 Certified | SOC 2 Compliant-->
                  <!--              </div>-->

                  <q-btn
                    no-caps
                    label="Login"
                    type="submit"
                    :loading="authStore.loading"
                    class="full-width q-mb-md"
                    size="md"
                    style="background: linear-gradient(135deg, #1976d2 0%, #004ba0 100%);
color: white"
                  />

                </q-form>
              </q-card-section>
            </q-card>
          </q-tab-panel>
          <q-tab-panel name="reset">
            <q-card class="q-pa-md shadow-10" style="width: 390px; max-width: 90vw; border-radius: 15px">
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-medium text-grey-9">
                  Reset Password
                </div>
                <span class="text-caption text-grey-7 q-mb-sm">
        Secure password reset for treasury accounts
      </span>
              </q-card-section>

              <q-card-section>
                <q-form @submit="onReset">
                  <q-input
                    @update:model-value="onChange"
                    v-model="resetState.username"
                    label="Username"
                    outlined
                    class="q-mb-sm"
                    :rules="[
            val => !!val || 'Username is required'
          ]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person"/>
                    </template>
                  </q-input>

                  <q-btn
                    label="Reset"
                    type="submit"
                    no-caps
                    class="full-width q-mb-md"
                    size="md"
                    style="color: white;
                    background: linear-gradient(135deg, #30b54e 0%, #218838 100%);"
                    :loading="authStore.loading"
                  />
                  <div class="text-center text-caption">
                    Remember your password?
                    <q-chip style="background: none" class="text-primary" clickable @click.prevent="panel = 'login'">
                      Back to login
                    </q-chip>
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <initializer-dialog @processStage="processStage" :message="message "/>


    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {AuthRequest, WorkflowRequest} from "components/models";
import {useAuthStore} from "stores/auth-store";
import {useAlerts} from "src/utils/alerts";
import {useCommonUtility} from "src/utils/common";
import InitializerDialog from "components/dialogs/InitializerDialog.vue";
import {useDialogStore} from "stores/dialog-store";

const router = useRouter()
const authStore = useAuthStore();
const utility = useCommonUtility();
const alerts = useAlerts();
const dialogStore = useDialogStore();

const isPwd = ref(true);
const panel = ref('login')


onMounted(() => {
  sessionStorage.clear();
})

const loginState = ref({
  remember: false,
  username: '',
  password: ''
});

const resetState = ref({
  username: ''
})


watch(panel, () => {
  if (panel.value == 'login')
    resetState.value.username = ''
  else {
    loginState.value.password = ''
    loginState.value.username = ''
  }
})

function onChange() {
  if (panel.value == 'login')
    loginState.value.username = loginState.value.username.toUpperCase();
  else
    resetState.value.username = resetState.value.username.toUpperCase();
}


async function onLogin() {
  try {
    let request = {} as AuthRequest;
    request.userName = loginState.value.username;
    request.password = loginState.value.password;
    await authStore.login(request);
    if (authStore.response.code !== '00') {
      alerts.showAlert(authStore.response);
      return;
    }
    console.log(authStore.apiResponse.data);
    utility.storeAuthData(authStore.apiResponse.data);
    dialogStore.initializer = !dialogStore.initializer;
    message.value = 'Setting up ...'


  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

const message = ref('');

function processStage() {
  let data = utility.getAuthData();

  dialogStore.initializer = !dialogStore.initializer;
  if (data.passwordChanged == 'N') {
    alerts.showAlert(authStore.response);
    router.replace('password-change');
    utility.storePasswordChangeFlag(data.passwordChanged);
  } else {
    utility.storePasswordChangeFlag("Y");
    router.push('/modules');
  }
}

async function onReset() {
  try {
    let request = {} as AuthRequest;
    request.userName = resetState.value.username;
    await authStore.reset(request);
    if (authStore.response.code !== '00') {
      alerts.showAlert(authStore.response);
      return;
    }
    alerts.showAlert(authStore.response);
    panel.value = 'login';
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
