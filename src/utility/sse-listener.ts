import { ref } from 'vue';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import type { ProgressDTO } from 'components/models';
import { ensureConfigLoaded, getConfig } from 'src/utility/api-config';

export function useSseListener() {
  const progressUpdate = ref({} as ProgressDTO);
  const status = ref<'connected' | 'disconnected' | 'error' | 'connecting'>('disconnected');
  const controller = ref<AbortController | null>(null);
  const errorMessage = ref<string>('');

  const connectSse = async (processId: string) => {
    if (status.value === 'connected') {
      console.warn('Already connected to SSE');
      return;
    }

    status.value = 'connecting';
    errorMessage.value = '';

    await ensureConfigLoaded();
    const config = getConfig();

    const url = `${config.baseurl}/events/stream-progress/${processId}`;

    // Clean up previous connection
    if (controller.value) {
      controller.value.abort();
    }

    controller.value = new AbortController();

    try {
      await fetchEventSource(url, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        signal: controller.value.signal,
        openWhenHidden: true, // Keep connection when tab is hidden

        onopen(response: Response): Promise<void> {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            status.value = 'connected';
            console.log('SSE connection established');
            return Promise.resolve();
          } else {
            status.value = 'error';
            // throw new Error(`Failed to connect: ${response.status} ${response.statusText}`);
            return Promise.reject(
              new Error(`Failed to connect: ${response.status} ${response.statusText}`),
            );
          }
        },

        onmessage(msg:any) {
          if (!msg.data) return;

          try {
            progressUpdate.value = JSON.parse(msg.data);
          } catch (e) {
            console.error('Failed to parse progress data:', e);
            // Optionally keep the raw data for debugging
            console.warn('Raw message data:', msg.data);
          }
        },

        onclose() {
          if (status.value !== 'disconnected') {
            status.value = 'disconnected';
            console.log('SSE connection closed');
          }
        },

        onerror(err:any) {
          status.value = 'error';
          errorMessage.value = err instanceof Error ? err.message : String(err);
          console.error('SSE Error:', err);

          // Don't throw here unless you want to stop retries
          // throw err;
        },
      });
    } catch (err) {
      status.value = 'error';
      errorMessage.value = err instanceof Error ? err.message : 'Connection failed';
      console.error('Failed to establish SSE connection:', err);
    }
  };

  const disconnect = () => {
    if (controller.value) {
      controller.value.abort();
      controller.value = null;
    }
    status.value = 'disconnected';
    errorMessage.value = '';
  };

  return {
    progressUpdate,
    status,
    errorMessage,
    connectSse,
    disconnect,
  };
}
