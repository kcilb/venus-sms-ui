<template>
  <q-page-container class="flex-center" style="min-height: 100vh; background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);">
    <q-page class="row flex-center no-wrap" style="width: 100%">

      <!-- Left side - Branding & Password Tips -->
      <div class="col-md-6 flex flex-center q-px-xl gt-sm">
        <div class="text-white" style="max-width: 500px">
          <div style="background: linear-gradient(135deg, #047464 0%, #148c74 100%);
                     border-radius: 5px 0px 5px 0px;"
               class="q-pa-md q-mb-md">
            <h3 class="text-h4 text-weight-medium q-mb-sm">PRIDEBANK / VENUS</h3>
            <p class="text-subtitle1 q-mb-none" style="opacity: 0.9;">Secure Password Update</p>
          </div>

          <!-- Password Requirements Card -->
          <div class="password-requirements q-mt-xl bg-white text-black q-pa-md rounded-borders shadow-2">
            <div class="text-h6 text-primary q-mb-md">
              <q-icon name="shield" size="24px" class="q-mr-sm" />
              Password Requirements
            </div>

            <div class="requirement-item row items-center q-mb-sm"
                 :class="{ 'text-positive': meetsLength }">
              <q-icon :name="meetsLength ? 'check_circle' : 'radio_button_unchecked'"
                      size="20px"
                      :color="meetsLength ? 'positive' : 'grey-5'"
                      class="q-mr-sm" />
              <span>At least 8 characters long</span>
            </div>

            <div class="requirement-item row items-center q-mb-sm"
                 :class="{ 'text-positive': meetsUpper }">
              <q-icon :name="meetsUpper ? 'check_circle' : 'radio_button_unchecked'"
                      size="20px"
                      :color="meetsUpper ? 'positive' : 'grey-5'"
                      class="q-mr-sm" />
              <span>At least one uppercase letter</span>
            </div>

            <div class="requirement-item row items-center q-mb-sm"
                 :class="{ 'text-positive': meetsLower }">
              <q-icon :name="meetsLower ? 'check_circle' : 'radio_button_unchecked'"
                      size="20px"
                      :color="meetsLower ? 'positive' : 'grey-5'"
                      class="q-mr-sm" />
              <span>At least one lowercase letter</span>
            </div>

            <div class="requirement-item row items-center q-mb-sm"
                 :class="{ 'text-positive': meetsNumber }">
              <q-icon :name="meetsNumber ? 'check_circle' : 'radio_button_unchecked'"
                      size="20px"
                      :color="meetsNumber ? 'positive' : 'grey-5'"
                      class="q-mr-sm" />
              <span>At least one number</span>
            </div>

            <div class="requirement-item row items-center q-mb-sm"
                 :class="{ 'text-positive': meetsSpecial }">
              <q-icon :name="meetsSpecial ? 'check_circle' : 'radio_button_unchecked'"
                      size="20px"
                      :color="meetsSpecial ? 'positive' : 'grey-5'"
                      class="q-mr-sm" />
              <span>At least one special character (!@#$%^&*)</span>
            </div>

            <q-separator spaced />

            <div class="row items-center q-mt-md text-caption text-grey-7">
              <q-icon name="info" size="18px" class="q-mr-sm" />
              <span>Passwords expire every 90 days for security</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Change Password Form -->
      <div class="col-12 col-md-4">
        <q-tab-panels
          style="background: none"
          v-model="panel"
          animated
          swipeable
          infinite
        >
          <q-tab-panel name="change">
            <q-card class="q-pa-md shadow-10 change-password-card" style="width: 390px; max-width: 90vw; border-radius: 15px">
              <!-- Card Header -->
              <q-card-section class="text-center">
                <q-icon name="password" size="48px" color="primary" class="q-mb-sm" />
                <div class="text-h5 text-weight-medium">
                  Change Password
                </div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Please choose a strong password you haven't used before
                </div>
              </q-card-section>

              <q-card-section>
                <q-form @submit="onChange" class="q-gutter-md">

                  <!-- Old Password -->
                  <q-input
                    v-model="changeState.oldPassword"
                    label="Current Password"
                    outlined
                    :type="isOldPwd ? 'password' : 'text'"
                    :rules="[val => !!val || 'Current password is required']"
                    lazy-rules
                    bg-color="white"
                    placeholder="Enter your current password"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock_outline" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isOldPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isOldPwd = !isOldPwd"
                        color="grey-6"
                      >
                        <q-tooltip>{{ isOldPwd ? 'Show password' : 'Hide password' }}</q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>

                  <!-- New Password with strength meter -->
                  <div>
                    <q-input
                      v-model="changeState.newPassword"
                      label="New Password"
                      outlined
                      :type="isNewPwd ? 'password' : 'text'"
                      :rules="[
                        val => !!val || 'New password is required',
                        val => validatePasswordStrength(val)
                      ]"
                      lazy-rules
                      bg-color="white"
                      placeholder="Enter new password"
                      @update:model-value="checkPasswordStrength"
                    >
                      <template v-slot:prepend>
                        <q-icon name="enhanced_encryption" color="primary" />
                      </template>
                      <template v-slot:append>
                        <q-icon
                          :name="isNewPwd ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isNewPwd = !isNewPwd"
                          color="grey-6"
                        >
                          <q-tooltip>{{ isNewPwd ? 'Show password' : 'Hide password' }}</q-tooltip>
                        </q-icon>
                      </template>
                      <template v-slot:after>
                        <q-icon
                          v-if="changeState.newPassword && changeState.newPassword.length > 0"
                          :name="passwordStrengthIcon"
                          :color="passwordStrengthColor"
                          size="24px"
                        />
                      </template>
                    </q-input>

                    <!-- Password strength meter -->
                    <div v-if="changeState.newPassword" class="q-mt-xs">
                      <q-linear-progress
                        :value="passwordStrengthScore / 4"
                        :color="passwordStrengthColor"
                        size="6px"
                        class="q-mb-xs"
                      />
                      <div class="row justify-between items-center">
                        <span class="text-caption" :class="'text-' + passwordStrengthColor">
                          Strength: {{ passwordStrengthLabel }}
                        </span>
                        <q-chip
                          v-if="!passwordsMatch && changeState.confirmPassword"
                          dense
                          size="sm"
                          color="negative"
                          text-color="white"
                          icon="error"
                        >
                          Passwords don't match
                        </q-chip>
                      </div>
                    </div>
                  </div>

                  <!-- Confirm Password -->
                  <q-input
                    v-model="changeState.confirmPassword"
                    label="Confirm New Password"
                    outlined
                    :type="isConfirmPwd ? 'password' : 'text'"
                    :rules="[
                      val => !!val || 'Please confirm your password',
                      val => val === changeState.newPassword || 'Passwords do not match'
                    ]"
                    lazy-rules
                    bg-color="white"
                    placeholder="Re-enter new password"
                  >
                    <template v-slot:prepend>
                      <q-icon name="password" color="primary" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isConfirmPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isConfirmPwd = !isConfirmPwd"
                        color="grey-6"
                      >
                        <q-tooltip>{{ isConfirmPwd ? 'Show password' : 'Hide password' }}</q-tooltip>
                      </q-icon>
                      <q-icon
                        v-if="changeState.confirmPassword"
                        :name="passwordsMatch ? 'check_circle' : 'error'"
                        :color="passwordsMatch ? 'positive' : 'negative'"
                        size="20px"
                        class="q-ml-sm"
                      />
                    </template>
                  </q-input>

                  <!-- Password History Warning -->
                  <div class="bg-warning/10 q-pa-sm rounded-borders text-caption text-warning" v-if="showHistoryWarning">
                    <q-icon name="history" size="18px" class="q-mr-sm" />
                    <span>You cannot reuse any of your last 5 passwords</span>
                  </div>

                  <!-- Action Buttons -->
                  <div class="row q-gutter-sm">
                    <q-btn
                      no-caps
                      label="Update Password"
                      :loading="authStore.loading"
                      type="submit"
                      class="col"
                      size="md"
                      style="background: linear-gradient(135deg, #047464 0%, #059580 100%);
                             color: white; height: 48px;"
                    >
                      <template v-slot:loading>
                        <q-spinner-facebook />
                        <span class="q-ml-sm">Updating...</span>
                      </template>
                    </q-btn>

                    <q-btn
                      no-caps
                      label="Cancel"
                      class="col-auto"
                      size="md"
                      outline
                      color="grey-7"
                      style="height: 48px; min-width: 100px;"
                      @click="cancelChange"
                    />
                  </div>

                  <div class="text-center text-caption">
                    <q-btn
                      flat
                      dense
                      no-caps
                      class="text-primary"
                      @click.prevent="router.push('/auth/login')"
                      size="sm"
                      icon="arrow_back"
                    >
                      Back to login
                    </q-btn>
                  </div>

                  <!-- Last Changed Info -->
                  <div class="text-caption text-grey-6 text-center q-mt-md">
                    <q-icon name="access_time" size="xs" class="q-mr-xs" />
                    Last password change: {{ lastPasswordChange || 'Never' }}
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- Success Dialog -->
      <q-dialog v-model="showSuccessDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="bg-positive text-white text-center">
            <q-icon name="check_circle" size="48px" />
          </q-card-section>

          <q-card-section class="text-center">
            <div class="text-h6 q-mb-sm">Password Updated!</div>
            <div class="text-caption text-grey-7">
              Your password has been successfully changed.
              You'll be redirected to login with your new password.
            </div>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn
              flat
              label="Continue to Login"
              color="positive"
              @click="redirectToLogin"
              no-caps
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import {useRouter} from "vue-router";
import {AuthRequest, ChangeRequest} from "components/models";
import {useAuthStore} from "stores/auth-store";
import {useCommonUtility} from "src/utility/common";
import {useAlerts} from "src/utility/alerts";

const router = useRouter();
const authStore = useAuthStore();
const utility = useCommonUtility();
const alerts = useAlerts();

// Password visibility states
const isOldPwd = ref(true);
const isNewPwd = ref(true);
const isConfirmPwd = ref(true);
const panel = ref('change');
const showSuccessDialog = ref(false);
const showHistoryWarning = ref(false);

// Password strength tracking
const passwordStrengthScore = ref(0);
const passwordStrengthLabel = ref('');

const changeState = ref({
  oldPassword: null,
  newPassword: null,
  confirmPassword: null
});

// Password requirement checks
const meetsLength = computed(() => changeState.value.newPassword?.length >= 8);
const meetsUpper = computed(() => /[A-Z]/.test(changeState.value.newPassword || ''));
const meetsLower = computed(() => /[a-z]/.test(changeState.value.newPassword || ''));
const meetsNumber = computed(() => /[0-9]/.test(changeState.value.newPassword || ''));
const meetsSpecial = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(changeState.value.newPassword || ''));

const passwordsMatch = computed(() =>
  changeState.value.newPassword === changeState.value.confirmPassword
);

const passwordStrengthIcon = computed(() => {
  const score = passwordStrengthScore.value;
  if (score <= 1) return 'sentiment_very_dissatisfied';
  if (score <= 2) return 'sentiment_neutral';
  if (score <= 3) return 'sentiment_satisfied';
  return 'sentiment_very_satisfied';
});

const passwordStrengthColor = computed(() => {
  const score = passwordStrengthScore.value;
  if (score <= 1) return 'negative';
  if (score <= 2) return 'warning';
  if (score <= 3) return 'info';
  return 'positive';
});

const lastPasswordChange = computed(() => {
  // This would come from user data
  return 'January 15, 2026';
});

function checkPasswordStrength() {
  const password = changeState.value.newPassword || '';
  let score = 0;

  if (meetsLength.value) score++;
  if (meetsUpper.value) score++;
  if (meetsLower.value) score++;
  if (meetsNumber.value) score++;
  if (meetsSpecial.value) score++;

  passwordStrengthScore.value = score;

  if (score <= 1) passwordStrengthLabel.value = 'Weak';
  else if (score <= 2) passwordStrengthLabel.value = 'Fair';
  else if (score <= 3) passwordStrengthLabel.value = 'Good';
  else if (score <= 4) passwordStrengthLabel.value = 'Strong';
  else passwordStrengthLabel.value = 'Very Strong';

  // Show history warning for common passwords (example)
  showHistoryWarning.value = password.toLowerCase().includes('password') ||
    password.includes('123456');
}

function validatePasswordStrength(val: string): boolean | string {
  if (!val) return true;

  const missingRequirements = [];
  if (val.length < 8) missingRequirements.push('8 characters');
  if (!/[A-Z]/.test(val)) missingRequirements.push('uppercase letter');
  if (!/[a-z]/.test(val)) missingRequirements.push('lowercase letter');
  if (!/[0-9]/.test(val)) missingRequirements.push('number');
  if (!/[!@#$%^&*]/.test(val)) missingRequirements.push('special character');

  if (missingRequirements.length > 0) {
    return `Password must contain: ${missingRequirements.join(', ')}`;
  }

  return true;
}

function reset() {
  changeState.value = {
    newPassword: null,
    oldPassword: null,
    confirmPassword: null
  };
  isOldPwd.value = true;
  isNewPwd.value = true;
  isConfirmPwd.value = true;
  passwordStrengthScore.value = 0;
  utility.removePassword();
}

async function onChange() {
  try {
    let request = {} as ChangeRequest;
    request.userName = utility.getAuthData()?.loginId;
    request.oldPassword = changeState.value.oldPassword;
    request.newPassword = changeState.value.newPassword;
    request.confirmPassword = changeState.value.confirmPassword;

    await authStore.change(request);

    if (authStore.response.code !== '00') {
      alerts.showAlert(authStore.response);
      return;
    }

    // Show success dialog instead of immediate redirect
    showSuccessDialog.value = true;
    reset();

  } catch (e) {
    alerts.showAlert(utility.getError(e));
  }
}

function cancelChange() {
  reset();
  router.push('/auth/login');
}

function redirectToLogin() {
  showSuccessDialog.value = false;
  router.replace('/auth/login');
}

// Watch for password confirmation
watch(() => changeState.value.confirmPassword, () => {
  if (changeState.value.confirmPassword && !passwordsMatch.value) {
    // You could add additional validation feedback here
  }
});
</script>

<style scoped>
.change-password-card {
  transition: all 0.3s ease;
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.change-password-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
}

.password-requirements {
  animation: fadeIn 0.6s ease;
  border-left: 4px solid #047464;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.requirement-item {
  transition: all 0.2s ease;
}

.requirement-item:hover {
  transform: translateX(5px);
}

.rounded-borders {
  border-radius: 8px;
}

/* Mobile responsiveness */
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
}

/* Input field enhancements */
:deep(.q-field__control) {
  border-radius: 8px;
}

:deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(0, 0, 0, 0.12);
}

:deep(.q-field--outlined:hover .q-field__control:before) {
  border-color: #047464;
}

:deep(.q-field--error .q-field__control:before) {
  border-color: #c10015 !important;
}

/* Loading state improvements */
:deep(.q-btn__content) {
  gap: 8px;
}

/* Success dialog animation */
:deep(.q-dialog__inner) {
  animation: dialogPop 0.3s ease;
}

@keyframes dialogPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
