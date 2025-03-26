// Este arquivo contém declarações de tipo global para módulos sem tipos adequados

declare module 'react' {
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type Key = string | number;

  export interface ReactNode {
    children?: ReactNode;
  }

  export type JSXElementConstructor<P> = ((props: P) => ReactElement | null);

  export interface CSSProperties {
    [key: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: string): import('react').ReactElement;
  export function jsxs(type: any, props: any, key?: string): import('react').ReactElement;
  export const Fragment: Symbol;
}

declare module 'react-hot-toast' {
  export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  
  export interface ToastOptions {
    position?: ToastPosition;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
    id?: string;
    icon?: React.ReactNode;
  }

  export type Toast = {
    id: string;
    type: 'success' | 'error' | 'loading' | 'blank' | 'custom';
    message: string | React.ReactNode;
    icon?: React.ReactNode;
    duration?: number;
    position?: ToastPosition;
    createdAt: number;
    visible: boolean;
    height?: number;
  };
  
  export function toast(message: string | React.ReactNode, options?: ToastOptions): string;
  export namespace toast {
    function success(message: string | React.ReactNode, options?: ToastOptions): string;
    function error(message: string | React.ReactNode, options?: ToastOptions): string;
    function loading(message: string | React.ReactNode, options?: ToastOptions): string;
    function custom(message: React.ReactNode, options?: ToastOptions): string;
    function dismiss(toastId?: string): void;
    function remove(toastId?: string): void;
  }
  
  export function useToaster(): {
    toasts: Toast[];
    handlers: {
      startPause: () => void;
      endPause: () => void;
      updateHeight: (toastId: string, height: number) => void;
      updateToast: (toast: Partial<Toast> & { id: string }) => void;
      startPause: () => void;
      endPause: () => void;
      calculateOffset: (toast: Toast, opts?: { reverseOrder?: boolean }) => number;
    };
  };
  
  export function Toaster(props: {
    position?: ToastPosition;
    toastOptions?: ToastOptions;
    reverseOrder?: boolean;
    gutter?: number;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    children?: (toast: Toast) => React.ReactNode;
  }): JSX.Element;
  
  export default toast;
} 