import { ref } from 'vue';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { ProgressDTO } from 'components/models';
import { ensureConfigLoaded, getConfig } from 'src/utility/api-config';

const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log('[SSE]', ...args);
  }
};

function applyProgressPayload(current: ProgressDTO, parsed: ProgressDTO): ProgressDTO {
  return { ...current, ...parsed };
}

export function useSseListener() {
  const progressUpdate = ref({} as ProgressDTO);
  const status = ref<'connected' | 'disconnected' | 'error' | 'connecting'>('disconnected');
  const controller = ref<AbortController | null>(null);
  const errorMessage = ref<string>('');
  const connectedProcessId = ref<string | null>(null);
  const lastProcessId = ref<string | null>(null);

  const clearProgress = () => {
    progressUpdate.value = {} as ProgressDTO;
  };

  const disconnect = () => {
    if (controller.value) {
      controller.value.abort();
      controller.value = null;
    }
    connectedProcessId.value = null;
    status.value = 'disconnected';
    errorMessage.value = '';
  };

  const disconnectAndClear = () => {
    disconnect();
    clearProgress();
  };

  const retry = () => {
    if (lastProcessId.value) {
      void connectSse(lastProcessId.value);
    }
  };

  const connectSse = async (processId: string) => {
    if (!processId) {
      return;
    }

    lastProcessId.value = processId;

    if (status.value === 'connected' && connectedProcessId.value === processId) {
      devLog('Already connected for processId', processId);
      return;
    }

    if (controller.value) {
      controller.value.abort();
      controller.value = null;
    }

    status.value = 'connecting';
    errorMessage.value = '';
    clearProgress();

    await ensureConfigLoaded();
    const config = getConfig();

    const url = `${config.baseurl}/events/stream-progress/${encodeURIComponent(processId)}`;

    controller.value = new AbortController();
    connectedProcessId.value = processId;

    try {
      await fetchEventSource(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.value.signal,
        openWhenHidden: true,

        onopen(response: Response): Promise<void> {
          const ct = response.headers.get('content-type') ?? '';
          const isEventStream =
            response.ok && (ct.includes('text/event-stream') || ct.includes('event-stream'));

          if (isEventStream) {
            status.value = 'connected';
            devLog('connection open', response.status, ct);
            return Promise.resolve();
          }

          status.value = 'error';
          errorMessage.value = `HTTP ${response.status} ${response.statusText || ''}`.trim();
          return Promise.reject(new Error(errorMessage.value));
        },

        onmessage(msg: EventSourceMessage) {
          const eventName = msg.event || 'message';

          if (eventName === 'error' && msg.data) {
            try {
              const parsed = JSON.parse(msg.data) as ProgressDTO;
              progressUpdate.value = applyProgressPayload(progressUpdate.value, {
                ...parsed,
                status: parsed.status || 'FAILED',
              });
            } catch {
              progressUpdate.value = {
                ...progressUpdate.value,
                processId: lastProcessId.value ?? '',
                status: 'FAILED',
                metadata: {
                  message: msg.data,
                },
              } as ProgressDTO;
            }
            status.value = 'error';
            errorMessage.value =
              (progressUpdate.value.metadata?.errorMessage as string) ||
              (progressUpdate.value.metadata?.message as string) ||
              'Charge process reported an error';
            return;
          }

          if (eventName !== 'message' && eventName !== 'progress-update') {
            return;
          }

          if (!msg.data) {
            return;
          }

          try {
            const parsed = JSON.parse(msg.data) as ProgressDTO;
            progressUpdate.value = applyProgressPayload(progressUpdate.value, parsed);
            devLog('progress-update', parsed.status, parsed.percentage);
          } catch (e) {
            console.error('[SSE] Failed to parse progress data:', e);
            devLog('raw data:', msg.data);
          }
        },

        onclose() {
          if (status.value !== 'disconnected') {
            status.value = 'disconnected';
            devLog('connection closed');
          }
          connectedProcessId.value = null;
        },

        onerror(err: unknown) {
          if (controller.value?.signal.aborted) {
            status.value = 'disconnected';
            connectedProcessId.value = null;
            return;
          }
          status.value = 'error';
          errorMessage.value = err instanceof Error ? err.message : String(err);
          console.error('[SSE] Error:', err);
        },
      });
    } catch (err) {
      if (controller.value?.signal.aborted) {
        status.value = 'disconnected';
        connectedProcessId.value = null;
        return;
      }
      status.value = 'error';
      errorMessage.value = err instanceof Error ? err.message : 'Connection failed';
      connectedProcessId.value = null;
      console.error('[SSE] Failed to establish connection:', err);
    }
  };

  return {
    progressUpdate,
    status,
    errorMessage,
    connectedProcessId,
    lastProcessId,
    connectSse,
    disconnect,
    disconnectAndClear,
    clearProgress,
    retry,
  };
}

interface EventSourceMessage {
  event?: string;
  data?: string;
}
