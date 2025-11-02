import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
    {
      file: pkg.unpkg,
      format: 'iife',
      name: 'FullCalendarResourceAutoHide',
      sourcemap: true,
      globals: {
        '@fullcalendar/core': 'FullCalendar',
        '@fullcalendar/resource-timeline': 'FullCalendar',
      },
      extend: true,
    },
  ],
  external: ['@fullcalendar/core', '@fullcalendar/resource-timeline'],
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
    }),
  ],
};
