import {defineConfig, globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
export default defineConfig([...nextVitals, {files:['**/*.{ts,tsx}'],rules: {'@next/next/no-img-element':'off', 'react-hooks/set-state-in-effect':'off', 'react-hooks/exhaustive-deps':'warn'}}, globalIgnores(['.next/**','next-env.d.ts','node_modules/**'])]);
