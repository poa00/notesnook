import {useMessageStore} from '../provider/stores';
import {eOpenLoginDialog, eOpenRecoveryKeyDialog} from '../utils/Events';
import {eSendEvent} from './EventManager';
import PremiumService from './PremiumService';
import {verifyUser} from '../views/Settings/functions';
import {MMKV} from '../utils/mmkv';

const recoveryKeyMessage = {
  visible: true,
  message: 'Keep your data safe if you lose password',
  actionText: 'Save your account recovery key',
  onPress: () => {
    verifyUser(
      null,
      () => {
        eSendEvent(eOpenRecoveryKeyDialog);
      },
      true,
      async () => {
        await MMKV.setItem('userHasSavedRecoveryKey', 'true');
        clearMessage();
      },
      'I have saved my key already'
    );
  },
  data: {},
  icon: 'key',
  type: 'normal'
};

export function setRecoveryKeyMessage() {
  useMessageStore.getState().setMessage(recoveryKeyMessage);
}

const loginMessage = {
  visible: true,
  message: 'You are not logged in',
  actionText: 'Login to encrypt and sync notes',
  onPress: () => {
    eSendEvent(eOpenLoginDialog);
  },
  data: {},
  icon: 'account-outline',
  type: 'normal'
};

export function setLoginMessage() {
  useMessageStore.getState().setMessage(loginMessage);
}

const emailMessage = {
  visible: true,
  message: 'Email not confirmed',
  actionText: 'Confirm now to get 7 more days of free trial',
  onPress: () => {
    PremiumService.showVerifyEmailDialog();
  },
  data: {},
  icon: 'email',
  type: 'normal'
};

export function setEmailVerifyMessage() {
  useMessageStore.getState().setMessage(emailMessage);
}

const noMessage = {
  visible: false,
  message: '',
  actionText: '',
  onPress: null,
  data: {},
  icon: 'account-outline'
};

export function clearMessage() {
  useMessageStore.getState().setMessage(noMessage);
}
