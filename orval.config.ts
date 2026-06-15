import { defineConfig } from 'orval';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default defineConfig({
    cheffy: {
        input: `${process.env.NEXT_PUBLIC_API_URL}/doc`,
        output: {
            mode: 'tags-split',
            target: 'src/services/api/generated/cheffy.ts',
            schemas: 'src/services/api/generated/model',
            client: 'react-query',
            httpClient: 'axios',
            override: {
                mutator: {
                    path: 'src/services/api/interceptor.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});
