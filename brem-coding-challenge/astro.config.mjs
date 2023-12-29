import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({output:'server',

    optimizeDeps: {
      include: ['@node-rs/argon2', '@node-rs/bcrypt'],
    },
  }
  
);
