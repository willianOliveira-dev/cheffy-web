
import { defineConfig } from 'orval';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default defineConfig({
    cheffy: {
        input: `${process.env.NEXT_PUBLIC_API_URL}/doc`,
        output: {
            mode: 'tags-split',
            target: 'api/generated/cheffy.ts',
            schemas: 'api/generated/model',
            client: 'react-query',
            httpClient: 'axios',
            override: {
                mutator: {
                    path: 'api/interceptor.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});