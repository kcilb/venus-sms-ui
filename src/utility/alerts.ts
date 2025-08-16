import {useQuasar} from 'quasar';
import {Errors, Response} from 'components/models';
import {useCommonUtility} from "src/utility/common";


export function useAlerts() {
  const $q = useQuasar();
  const utility = useCommonUtility();

  function showAlert(resp: Response) {
    let filterCodes = ["ERR_BAD_REQUEST"]
    if (filterCodes.includes(resp.code)) {
      resp = utility.getError(resp)
    }
    $q.notify({
      actions: [{icon: 'close', color: 'white'}],
      timeout: 5000,
      icon: resp.code !== '0' ? 'error_outline' : 'task_alt',
      message: resp?.message,
      color: resp.code !== '0' ? 'negative' : 'positive',
      position: 'bottom'
    });
  }

  function showLoading() {
    $q.loadingBar.start();

    $q.loadingBar.setDefaults({
      color: 'yellow-7',
      size: '5px',
      position: 'top'
    });
    $q.loadingBar.increment(80);
    setTimeout(() => {
      $q.loadingBar.stop();
    }, 2000);
  }

  return {showLoading, showAlert};
}
