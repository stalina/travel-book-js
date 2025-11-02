// Déclarations des macros Vue pour le compilateur TypeScript (résolution des erreurs 'Cannot find name defineEmits')
// Ces helpers sont transformés par le plugin Vue au build; on les déclare ici pour l'éditeur.
declare function defineEmits<EE extends string[]>(emits: EE): (...args: any[]) => void
declare const defineEmits: any
declare const defineProps: any
// Vous pouvez étendre pour defineProps si nécessaire plus tard.
