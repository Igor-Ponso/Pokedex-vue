import type { ToastOptions } from '@/types';
import { POSITION, TYPE, useToast, type PluginOptions } from 'vue-toastification';

// Wrapper centralizado para padronizar toasts na aplicação
export function useAppToast() {
  const toast = useToast();

  const base = (message: string, type: TYPE | undefined = TYPE.DEFAULT, opts: Partial<PluginOptions> = {}) => {
    return toast(message, { type, ...opts });
  };

  const success = (message: string, opts: Partial<PluginOptions> = {}) => toast.success(message, opts);
  const error = (message: string, opts: Partial<PluginOptions> = {}) => toast.error(message, opts);
  const info = (message: string, opts: Partial<PluginOptions> = {}) => toast.info(message, opts);
  const warning = (message: string, opts: Partial<PluginOptions> = {}) => toast.warning(message, opts);

  // Converte opções internas (UIState) para opções do plugin
  const show = (options: ToastOptions) => {
    const { message, type = 'info', duration = 3000, position = 'top-right' } = options;
    // Map de tipos para enum
    const typeMap: Record<string, TYPE> = {
      success: TYPE.SUCCESS,
      error: TYPE.ERROR,
      warning: TYPE.WARNING,
      info: TYPE.INFO,
      default: TYPE.DEFAULT,
    };
    const posMap: Record<string, POSITION> = {
      'top-right': POSITION.TOP_RIGHT,
      'top-center': POSITION.TOP_CENTER,
      'bottom-right': POSITION.BOTTOM_RIGHT,
      'bottom-center': POSITION.BOTTOM_CENTER,
    };
    toast(message, {
      type: typeMap[type] || TYPE.INFO,
      timeout: duration,
      position: posMap[position] || POSITION.TOP_RIGHT,
    });
  };

  return { base, success, error, info, warning, show };
}
