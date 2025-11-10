// Declarations to help TypeScript with Vue 3 script-setup macros used in the project
declare function defineProps<T>(): T
declare function defineEmits<T>(): T
declare function withDefaults<Props, Defaults>(props: Props, defaults: Defaults): Props & Defaults

// Provide minimal typed helpers for runtime macros used by some tooling
declare module 'vue' {
  // keep existing exports intact
}

export {}
// Type declarations to help TypeScript understand Vue script-setup compiler macros
// These are developer-time helpers only and are transformed/handled by the Vue compiler at build time.

declare function withDefaults<P extends Record<string, any>>(props: P, defaults: Partial<P>): P

declare function defineProps<T>(): T

declare function defineEmits<E = Record<string, any>>(): any

declare function defineExpose<E = any>(exposed?: E): void

declare function useSlots(): any

declare function useAttrs(): Record<string, any>

export {}
