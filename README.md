# ixon-vue3-builder-ts-proper (IXON Component Development Kit Vue Builder)

This builder can be used with the IXON Component Development Kit (CDK). It contains build targets for compiling Vue.js [Single File Components](https://v3.vuejs.org/guide/single-file-component.html) and wrap them into [webcomponents](https://developer.mozilla.org/en-US/docs/Web/Web_Components) (reusable custom elements) using [Vite](https://vitejs.dev/).

## But...

* This also respects your NODE_ENV variable, so you can debug your vue components locally. 
* It also includes a type checker for Typescript using `vue-tsc`