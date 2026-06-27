import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        // Build output and generated artifacts: never lint these.
        // (Next 16 removed `next lint`, which used to scope this implicitly.)
        ignores: [
            '.next/**',
            'out/**',
            'build/**',
            'next-env.d.ts',
            '**/nextImageExportOptimizer/**',
            '**/next-image-export-optimizer-hashes.json',
        ],
    },
    ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
];

export default eslintConfig;
