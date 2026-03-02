<template>
  <q-page-container class="page-content flex-center">
    <q-page class="row flex-center no-wrap" style="width: 100%;">

      <div class="col-md-6 flex flex-center q-px-xl gt-sm">
        <div class="text-white" style="max-width: 500px">
          <div class="welcome-header"
               style="background: linear-gradient(135deg, #047464 0%, #148c74 100%);
                      border-radius: 5px 0px 5px 0px;">
            <h3 class="text-h4 text-weight-medium q-pa-md q-mb-md">
              PRIDEBANK / VENUS
            </h3>
            <p class="text-subtitle1 q-px-md q-pb-md q-mt-none" style="opacity: 0.9;">
              Secure Banking Platform
            </p>
          </div>

          <div class="feature-list q-mt-xl">
            <div class="feature-item row items-center q-mb-md">
              <q-icon name="support_agent" size="24px" class="q-mr-sm"/>
              <span class="text-body1">24/7 SMS Notification delivery</span>
            </div>
            <div class="feature-item row items-center q-mb-md">
              <q-icon name="sync" size="24px" class="q-mr-sm"/>
              <span class="text-body1">Charge Processing</span>
            </div>
          </div>

          <div class="pride-logo q-mt-xl"></div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <q-tab-panels
          style="background: none"
          v-model="panel"
          animated
          swipeable
          infinite
          class="panel-transition"
        >
          <!-- Login Panel -->
          <q-tab-panel name="login">
            <q-card class="q-pa-md shadow-10 login-card" style="width: 390px; max-width: 90vw; border-radius: 15px">
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-medium">
                  Welcome Back
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Please enter your credentials to continue
                </div>
              </q-card-section>

              <q-card-section>
                <q-form @submit.prevent="onLogin" class="q-gutter-md">
                  <q-input
                    v-model="loginState.username"
                    @update:model-value="onChange"
                    label="Username"
                    outlined
                    class="q-mb-sm"
                    :rules="[val => !!val || 'Username is required']"
                    lazy-rules
                    autocomplete="username"
                    bg-color="white"
                    placeholder="Enter your username"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="primary"/>
                    </template>
                  </q-input>

                  <q-input
                    v-model="loginState.password"
                    label="Password"
                    outlined
                    :type="isPwd ? 'password' : 'text'"
                    :rules="[val => !!val || 'Password is required']"
                    lazy-rules
                    autocomplete="current-password"
                    bg-color="white"
                    placeholder="Enter your password"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" color="primary"/>
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                        color="grey-6"
                      >
                        <q-tooltip>{{ isPwd ? 'Show password' : 'Hide password' }}</q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>

                  <div class="row items-center justify-between q-mb-md">
                    <q-btn
                      flat
                      dense
                      no-caps
                      class="text-primary"
                      @click="panel = 'reset'"
                      size="sm"
                    >
                      Forgot Password?
                    </q-btn>
                  </div>

                  <q-btn
                    no-caps
                    label="Sign In"
                    type="submit"
                    :loading="authStore.loading"
                    class="full-width"
                    size="md"
                    style="background: linear-gradient(135deg, rgb(196,148,20) 0%, rgb(196,148,20) 100%);
                           color: white; height: 48px;"
                  >
                    <template v-slot:loading>
                      <q-spinner-facebook/>
                      <span class="q-ml-sm">Signing in...</span>
                    </template>
                  </q-btn>
                </q-form>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- Reset Password Panel -->
          <q-tab-panel name="reset">
            <q-card class="q-pa-md shadow-10 reset-card" style="width: 390px; max-width: 90vw; border-radius: 15px">
              <q-card-section class="text-center">
                <q-icon name="lock_reset" size="48px" color="primary" class="q-mb-sm"/>
                <div class="text-h5 text-weight-medium text-grey-9">
                  Reset Password
                </div>
                <div class="text-caption text-grey-7 q-mt-xs q-mb-sm">
                  Enter your username to receive reset instructions
                </div>
              </q-card-section>

              <q-card-section>
                <q-form @submit="onReset" class="q-gutter-md">
                  <q-input
                    @update:model-value="onChange"
                    v-model="resetState.username"
                    label="Username"
                    outlined
                    class="q-mb-md"
                    :rules="[val => !!val || 'Username is required']"
                    lazy-rules
                    bg-color="white"
                    placeholder="Enter your username"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="primary"/>
                    </template>
                  </q-input>

                  <q-btn
                    label="Send Reset Link"
                    type="submit"
                    no-caps
                    class="full-width q-mb-md"
                    size="md"
                    color="primary"
                    style="height: 48px;"
                    :loading="authStore.loading"
                  >
                    <template v-slot:loading>
                      <q-spinner-facebook/>
                      <span class="q-ml-sm">Processing...</span>
                    </template>
                  </q-btn>

                  <div class="text-center text-caption">
                    <span class="text-grey-7">Remember your password?</span>
                    <q-btn
                      flat
                      dense
                      no-caps
                      class="text-primary q-ml-xs"
                      @click.prevent="panel = 'login'"
                      size="sm"
                    >
                      Back to login
                    </q-btn>
                  </div>

                  <div class="reset-info text-caption text-grey-6 text-center q-mt-md">
                    <q-icon name="info" size="xs" class="q-mr-xs"/>
                    You'll receive an email with password reset instructions
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <initializer-dialog @processStage="processStage" :message="message"/>

      <!-- Floating help button -->
      <q-btn
        round
        color="primary"
        icon="help"
        size="md"
        class="floating-help-btn"
        @click="showHelp = true"
      >
        <q-tooltip>Need help?</q-tooltip>
      </q-btn>

      <!-- Help dialog -->
      <q-dialog v-model="showHelp">
        <q-card style="min-width: 300px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Help & Support</div>
            <q-space/>
            <q-btn icon="close" flat round dense v-close-popup/>
          </q-card-section>

          <q-card-section>
            <q-list>
              <q-item clickable v-ripple @click="contactSupport">
                <q-item-section avatar>
                  <q-icon name="support_agent" color="primary"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>Contact Support</q-item-label>
                  <q-item-label caption>24/7 available</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="showFAQ">
                <q-item-section avatar>
                  <q-icon name="help" color="primary"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>FAQ</q-item-label>
                  <q-item-label caption>Common questions</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator spaced/>

              <q-item>
                <q-item-section>
                  <q-item-label caption>Need immediate assistance?</q-item-label>
                  <q-item-label>Call: 1-800-PRIDE-BANK</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useAuthStore} from "stores/auth-store";
import {AuthRequest} from "components/models";
import {useAlerts} from "src/utility/alerts";
import {useCommonUtility} from "src/utility/common";
import InitializerDialog from "components/dialogs/InitializerDialog.vue";
import {useDialogStore} from "stores/dialog-store";
import {useQuasar} from "quasar";

const router = useRouter()
const authStore = useAuthStore();
const alerts = useAlerts();
const utility = useCommonUtility();
const dialogStore = useDialogStore();
const $q = useQuasar();

const isPwd = ref(true);
const panel = ref('login')
const showHelp = ref(false);

onMounted(() => {
  sessionStorage.clear();
  // Auto-focus username field
  setTimeout(() => {
    const usernameInput = document.querySelector('input[autocomplete="username"]');
    if (usernameInput) (usernameInput as HTMLElement).focus();
  }, 100);
});

const loginState = ref({
  remember: false,
  username: '',
  password: ''
});

const resetState = ref({
  username: ''
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
    request.username = loginState.value.username;
    request.password = loginState.value.password;
    await authStore.login(request);

    if (authStore.response.code !== '0') {
      alerts.showAlert(authStore.response);
      loginState.value.password = ''; // Clear password on error
      return;
    }

    if (loginState.value.remember) {
      // Implement remember me functionality
      localStorage.setItem('rememberedUser', loginState.value.username);
    }

    utility.storeAuthData(authStore.apiResponse.data);
    dialogStore.initializer = !dialogStore.initializer;
    message.value = 'Setting up your dashboard...';

  } catch (e) {
    alerts.showAlert(utility.getError(e));
    loginState.value.password = ''; // Clear password on error
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
    router.push('/admin');
  }
}

async function onReset() {
  try {
    let request = {} as AuthRequest;
    request.username = resetState.value.username;
    await authStore.reset(request);

    if (authStore.response.code !== '00') {
      alerts.showAlert(authStore.response);
      return;
    }

    alerts.showAlert({
      ...authStore.response,
      message: 'Password reset instructions have been sent to your email'
    });
    panel.value = 'login';
    resetState.value.username = '';
  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

function contactSupport() {
  showHelp.value = false;
  window.open('https://support.pridebank.com', '_blank');
}

function showFAQ() {
  showHelp.value = false;
  // Navigate to FAQ page or show dialog
  $q.dialog({
    title: 'Frequently Asked Questions',
    message: '1. How do I reset my password?\n2. Why am I locked out?\n3. How to enable two-factor authentication?',
    html: true
  });
}
</script>

<style scoped>
.welcome-header {
  transition: transform 0.3s ease;
}

.welcome-header:hover {
  transform: translateY(-2px);
}

.feature-list {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.feature-list:hover {
  opacity: 1;
}

.feature-item {
  transition: transform 0.2s ease;
}

.feature-item:hover {
  transform: translateX(5px);
}

.pride-logo {
  background: url('~assets/images/logo.png') no-repeat center center / contain;
  min-height: 150px;
  width: 100%;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.pride-logo:hover {
  transform: scale(1.02);
}

.login-card, .reset-card {
  transition: all 0.3s ease;
}

.login-card:hover, .reset-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.panel-transition {
  transition: all 0.3s ease;
}

.floating-help-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(4, 116, 100, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(4, 116, 100, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(4, 116, 100, 0);
  }
}

.security-badge {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.security-badge .q-chip {
  background: rgba(4, 116, 100, 0.1);
}

.reset-info {
  background: rgba(0, 0, 0, 0.02);
  padding: 8px;
  border-radius: 4px;
}

@media (max-width: 1023px) {
  .gt-sm {
    display: none;
  }

  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
  }

  .q-card {
    width: 100% !important;
    margin: 0 16px;
  }

  .floating-help-btn {
    bottom: 16px;
    right: 16px;
  }
}

/* Input field improvements */
:deep(.q-field__control) {
  border-radius: 8px;
}

:deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(0, 0, 0, 0.12);
}

:deep(.q-field--outlined:hover .q-field__control:before) {
  border-color: #047464;
}

/* Loading state improvements */
:deep(.q-btn__content) {
  gap: 8px;
}
</style>
