interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

class ToastService {
  private toastComponent: any = null;
  
  /**
   * Registra o componente de toast para uso global
   */
  registerToastComponent(component: any) {
    this.toastComponent = component;
  }
  
  /**
   * Exibe uma notificação toast
   */
  show(options: ToastOptions) {
    if (!this.toastComponent) {
      console.warn('Toast component not registered. Please register it first.');
      return;
    }
    
    this.toastComponent.show(options);
  }
  
  /**
   * Exibe uma notificação de sucesso
   */
  success(message: string, options?: Omit<ToastOptions, 'type'>) {
    this.show({ message, type: 'success', ...options });
  }
  
  /**
   * Exibe uma notificação de erro
   */
  error(message: string, options?: Omit<ToastOptions, 'type'>) {
    this.show({ message, type: 'error', ...options });
  }
  
  /**
   * Exibe uma notificação de aviso
   */
  warning(message: string, options?: Omit<ToastOptions, 'type'>) {
    this.show({ message, type: 'warning', ...options });
  }
  
  /**
   * Exibe uma notificação informativa
   */
  info(message: string, options?: Omit<ToastOptions, 'type'>) {
    this.show({ message, type: 'info', ...options });
  }
}

export const toastService = new ToastService();