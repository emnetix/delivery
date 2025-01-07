// vite.config.ts
import { resolve } from "path";
import { loadEnv } from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1/node_modules/vite/dist/node/index.js";
import Vue from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/@vitejs+plugin-vue@5.1.4_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1__vue@3.4.32_typescript@5.5.3_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import VueJsx from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.0.1_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1__vue@3.4.32_typescript@5.5.3_/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import progress from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/vite-plugin-progress@0.0.7_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1_/node_modules/vite-plugin-progress/dist/index.mjs";
import EslintPlugin from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/vite-plugin-eslint@1.8.1_eslint@9.11.1_jiti@1.21.6__vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1_/node_modules/vite-plugin-eslint/dist/index.mjs";
import { ViteEjsPlugin } from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/vite-plugin-ejs@1.7.0_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1_/node_modules/vite-plugin-ejs/index.js";
import { viteMockServe } from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/vite-plugin-mock@2.9.6_mockjs@1.1.0_rollup@4.22.5_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1_/node_modules/vite-plugin-mock/dist/index.js";
import PurgeIcons from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/vite-plugin-purge-icons@0.10.0_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1_/node_modules/vite-plugin-purge-icons/dist/index.mjs";
import ServerUrlCopy from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/vite-plugin-url-copy@1.1.4_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1_/node_modules/vite-plugin-url-copy/dist/index.js";
import VueI18nPlugin from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/@intlify+unplugin-vue-i18n@4.0.0_rollup@4.22.5_vue-i18n@9.13.1_vue@3.4.32_typescript@5.5.3__/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import { createSvgIconsPlugin } from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/vite-plugin-svg-icons@2.0.1_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1_/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import { createStyleImportPlugin, ElementPlusResolve } from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/vite-plugin-style-import@2.0.0_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1_/node_modules/vite-plugin-style-import/dist/index.mjs";
import UnoCSS from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/unocss@0.61.9_postcss@8.4.47_rollup@4.22.5_vite@5.3.4_@types+node@20.16.10_less@4.2.0_terser@5.34.1_/node_modules/unocss/dist/vite.mjs";
import { visualizer } from "file:///home/frog/emnetix/apps/frontend/node_modules/.pnpm/rollup-plugin-visualizer@5.12.0_rollup@4.22.5/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "/home/frog/emnetix/apps/frontend";
var root = process.cwd();
function pathResolve(dir) {
  return resolve(root, ".", dir);
}
var vite_config_default = ({ command, mode }) => {
  let env = {};
  const isBuild = command === "build";
  if (!isBuild) {
    env = loadEnv(process.argv[3] === "--mode" ? process.argv[4] : process.argv[3], root);
  } else {
    env = loadEnv(mode, root);
  }
  return {
    base: env.VITE_BASE_PATH,
    plugins: [
      Vue({
        script: {
          // 开启defineModel
          defineModel: true
        }
      }),
      VueJsx(),
      ServerUrlCopy(),
      progress(),
      env.VITE_USE_ALL_ELEMENT_PLUS_STYLE === "false" ? createStyleImportPlugin({
        resolves: [ElementPlusResolve()],
        libs: [
          {
            libraryName: "element-plus",
            esModule: true,
            resolveStyle: (name) => {
              if (name === "click-outside") {
                return "";
              }
              return `element-plus/es/components/${name.replace(/^el-/, "")}/style/css`;
            }
          }
        ]
      }) : void 0,
      EslintPlugin({
        cache: false,
        failOnWarning: false,
        failOnError: false,
        include: ["src/**/*.vue", "src/**/*.ts", "src/**/*.tsx"]
        // 检查的文件
      }),
      VueI18nPlugin({
        runtimeOnly: true,
        compositionOnly: true,
        include: [resolve(__vite_injected_original_dirname, "src/locales/**")]
      }),
      createSvgIconsPlugin({
        iconDirs: [pathResolve("src/assets/svgs")],
        symbolId: "icon-[dir]-[name]",
        svgoOptions: true
      }),
      PurgeIcons(),
      env.VITE_USE_MOCK === "true" ? viteMockServe({
        ignore: /^\_/,
        mockPath: "mock",
        localEnabled: !isBuild,
        prodEnabled: !isBuild,
        injectCode: `
          import { setupProdMockServer } from '../mock/_createProductionServer'

          setupProdMockServer()
          `
      }) : void 0,
      ViteEjsPlugin({
        title: env.VITE_APP_TITLE
      }),
      UnoCSS()
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "./src/styles/variables.module.less";',
          javascriptEnabled: true
        }
      }
    },
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".less", ".css"],
      alias: [
        {
          find: "vue-i18n",
          replacement: "vue-i18n/dist/vue-i18n.cjs.js"
        },
        {
          find: /\@\//,
          replacement: `${pathResolve("src")}/`
        }
      ]
    },
    esbuild: {
      pure: env.VITE_DROP_CONSOLE === "true" ? ["console.log"] : void 0,
      drop: env.VITE_DROP_DEBUGGER === "true" ? ["debugger"] : void 0
    },
    build: {
      target: "es2015",
      outDir: env.VITE_OUT_DIR || "dist",
      sourcemap: env.VITE_SOURCEMAP === "true",
      // brotliSize: false,
      rollupOptions: {
        plugins: env.VITE_USE_BUNDLE_ANALYZER === "true" ? [visualizer()] : void 0,
        // 拆包
        output: {
          manualChunks: {
            "vue-chunks": ["vue", "vue-router", "pinia", "vue-i18n"],
            "element-plus": ["element-plus"],
            "wang-editor": ["@wangeditor/editor", "@wangeditor/editor-for-vue"],
            echarts: ["echarts", "echarts-wordcloud"]
          }
        }
      },
      cssCodeSplit: !(env.VITE_USE_CSS_SPLIT === "false"),
      cssTarget: ["chrome31"]
    },
    server: {
      port: 4e3,
      proxy: {
        // 选项写法
        "/api": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "")
        }
      },
      hmr: {
        overlay: false
      },
      host: "0.0.0.0"
    },
    optimizeDeps: {
      include: [
        "vue",
        "vue-router",
        "vue-types",
        "element-plus/es/locale/lang/zh-cn",
        "element-plus/es/locale/lang/en",
        "@iconify/iconify",
        "@vueuse/core",
        "axios",
        "qs",
        "echarts",
        "echarts-wordcloud",
        "qrcode",
        "@wangeditor/editor",
        "@wangeditor/editor-for-vue",
        "vue-json-pretty",
        "@zxcvbn-ts/core",
        "dayjs",
        "cropperjs"
      ]
    }
  };
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9mcm9nL2VtbmV0aXgvYXBwcy9mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvZnJvZy9lbW5ldGl4L2FwcHMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvZnJvZy9lbW5ldGl4L2FwcHMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCB7IGxvYWRFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHR5cGUgeyBVc2VyQ29uZmlnLCBDb25maWdFbnYgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IFZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgVnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnXG5pbXBvcnQgcHJvZ3Jlc3MgZnJvbSAndml0ZS1wbHVnaW4tcHJvZ3Jlc3MnXG5pbXBvcnQgRXNsaW50UGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWVzbGludCdcbmltcG9ydCB7IFZpdGVFanNQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1lanMnXG5pbXBvcnQgeyB2aXRlTW9ja1NlcnZlIH0gZnJvbSAndml0ZS1wbHVnaW4tbW9jaydcbmltcG9ydCBQdXJnZUljb25zIGZyb20gJ3ZpdGUtcGx1Z2luLXB1cmdlLWljb25zJ1xuaW1wb3J0IFNlcnZlclVybENvcHkgZnJvbSAndml0ZS1wbHVnaW4tdXJsLWNvcHknXG5pbXBvcnQgVnVlSTE4blBsdWdpbiBmcm9tICdAaW50bGlmeS91bnBsdWdpbi12dWUtaTE4bi92aXRlJ1xuaW1wb3J0IHsgY3JlYXRlU3ZnSWNvbnNQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1zdmctaWNvbnMnXG5pbXBvcnQgeyBjcmVhdGVTdHlsZUltcG9ydFBsdWdpbiwgRWxlbWVudFBsdXNSZXNvbHZlIH0gZnJvbSAndml0ZS1wbHVnaW4tc3R5bGUtaW1wb3J0J1xuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSdcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5jb25zdCByb290ID0gcHJvY2Vzcy5jd2QoKVxuXG5mdW5jdGlvbiBwYXRoUmVzb2x2ZShkaXI6IHN0cmluZykge1xuICByZXR1cm4gcmVzb2x2ZShyb290LCAnLicsIGRpcilcbn1cblxuZXhwb3J0IGRlZmF1bHQgKHsgY29tbWFuZCwgbW9kZSB9OiBDb25maWdFbnYpOiBVc2VyQ29uZmlnID0+IHtcbiAgbGV0IGVudiA9IHt9IGFzIGFueVxuICBjb25zdCBpc0J1aWxkID0gY29tbWFuZCA9PT0gJ2J1aWxkJ1xuICBpZiAoIWlzQnVpbGQpIHtcbiAgICBlbnYgPSBsb2FkRW52KHByb2Nlc3MuYXJndlszXSA9PT0gJy0tbW9kZScgPyBwcm9jZXNzLmFyZ3ZbNF0gOiBwcm9jZXNzLmFyZ3ZbM10sIHJvb3QpXG4gIH0gZWxzZSB7XG4gICAgZW52ID0gbG9hZEVudihtb2RlLCByb290KVxuICB9XG4gIHJldHVybiB7XG4gICAgYmFzZTogZW52LlZJVEVfQkFTRV9QQVRILFxuICAgIHBsdWdpbnM6IFtcbiAgICAgIFZ1ZSh7XG4gICAgICAgIHNjcmlwdDoge1xuICAgICAgICAgIC8vIFx1NUYwMFx1NTQyRmRlZmluZU1vZGVsXG4gICAgICAgICAgZGVmaW5lTW9kZWw6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBWdWVKc3goKSxcbiAgICAgIFNlcnZlclVybENvcHkoKSxcbiAgICAgIHByb2dyZXNzKCksXG4gICAgICBlbnYuVklURV9VU0VfQUxMX0VMRU1FTlRfUExVU19TVFlMRSA9PT0gJ2ZhbHNlJ1xuICAgICAgICA/IGNyZWF0ZVN0eWxlSW1wb3J0UGx1Z2luKHtcbiAgICAgICAgICAgIHJlc29sdmVzOiBbRWxlbWVudFBsdXNSZXNvbHZlKCldLFxuICAgICAgICAgICAgbGliczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGlicmFyeU5hbWU6ICdlbGVtZW50LXBsdXMnLFxuICAgICAgICAgICAgICAgIGVzTW9kdWxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlc29sdmVTdHlsZTogKG5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChuYW1lID09PSAnY2xpY2stb3V0c2lkZScpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYGVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzLyR7bmFtZS5yZXBsYWNlKC9eZWwtLywgJycpfS9zdHlsZS9jc3NgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSlcbiAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICBFc2xpbnRQbHVnaW4oe1xuICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgIGZhaWxPbldhcm5pbmc6IGZhbHNlLFxuICAgICAgICBmYWlsT25FcnJvcjogZmFsc2UsXG4gICAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoudnVlJywgJ3NyYy8qKi8qLnRzJywgJ3NyYy8qKi8qLnRzeCddIC8vIFx1NjhDMFx1NjdFNVx1NzY4NFx1NjU4N1x1NEVGNlxuICAgICAgfSksXG4gICAgICBWdWVJMThuUGx1Z2luKHtcbiAgICAgICAgcnVudGltZU9ubHk6IHRydWUsXG4gICAgICAgIGNvbXBvc2l0aW9uT25seTogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZTogW3Jlc29sdmUoX19kaXJuYW1lLCAnc3JjL2xvY2FsZXMvKionKV1cbiAgICAgIH0pLFxuICAgICAgY3JlYXRlU3ZnSWNvbnNQbHVnaW4oe1xuICAgICAgICBpY29uRGlyczogW3BhdGhSZXNvbHZlKCdzcmMvYXNzZXRzL3N2Z3MnKV0sXG4gICAgICAgIHN5bWJvbElkOiAnaWNvbi1bZGlyXS1bbmFtZV0nLFxuICAgICAgICBzdmdvT3B0aW9uczogdHJ1ZVxuICAgICAgfSksXG4gICAgICBQdXJnZUljb25zKCksXG4gICAgICBlbnYuVklURV9VU0VfTU9DSyA9PT0gJ3RydWUnXG4gICAgICAgID8gdml0ZU1vY2tTZXJ2ZSh7XG4gICAgICAgICAgICBpZ25vcmU6IC9eXFxfLyxcbiAgICAgICAgICAgIG1vY2tQYXRoOiAnbW9jaycsXG4gICAgICAgICAgICBsb2NhbEVuYWJsZWQ6ICFpc0J1aWxkLFxuICAgICAgICAgICAgcHJvZEVuYWJsZWQ6ICFpc0J1aWxkLFxuICAgICAgICAgICAgaW5qZWN0Q29kZTogYFxuICAgICAgICAgIGltcG9ydCB7IHNldHVwUHJvZE1vY2tTZXJ2ZXIgfSBmcm9tICcuLi9tb2NrL19jcmVhdGVQcm9kdWN0aW9uU2VydmVyJ1xuXG4gICAgICAgICAgc2V0dXBQcm9kTW9ja1NlcnZlcigpXG4gICAgICAgICAgYFxuICAgICAgICAgIH0pXG4gICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgVml0ZUVqc1BsdWdpbih7XG4gICAgICAgIHRpdGxlOiBlbnYuVklURV9BUFBfVElUTEVcbiAgICAgIH0pLFxuICAgICAgVW5vQ1NTKClcbiAgICBdLFxuXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogJ0BpbXBvcnQgXCIuL3NyYy9zdHlsZXMvdmFyaWFibGVzLm1vZHVsZS5sZXNzXCI7JyxcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBleHRlbnNpb25zOiBbJy5tanMnLCAnLmpzJywgJy50cycsICcuanN4JywgJy50c3gnLCAnLmpzb24nLCAnLmxlc3MnLCAnLmNzcyddLFxuICAgICAgYWxpYXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6ICd2dWUtaTE4bicsXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6ICd2dWUtaTE4bi9kaXN0L3Z1ZS1pMThuLmNqcy5qcydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6IC9cXEBcXC8vLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiBgJHtwYXRoUmVzb2x2ZSgnc3JjJyl9L2BcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0sXG4gICAgZXNidWlsZDoge1xuICAgICAgcHVyZTogZW52LlZJVEVfRFJPUF9DT05TT0xFID09PSAndHJ1ZScgPyBbJ2NvbnNvbGUubG9nJ10gOiB1bmRlZmluZWQsXG4gICAgICBkcm9wOiBlbnYuVklURV9EUk9QX0RFQlVHR0VSID09PSAndHJ1ZScgPyBbJ2RlYnVnZ2VyJ10gOiB1bmRlZmluZWRcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICB0YXJnZXQ6ICdlczIwMTUnLFxuICAgICAgb3V0RGlyOiBlbnYuVklURV9PVVRfRElSIHx8ICdkaXN0JyxcbiAgICAgIHNvdXJjZW1hcDogZW52LlZJVEVfU09VUkNFTUFQID09PSAndHJ1ZScsXG4gICAgICAvLyBicm90bGlTaXplOiBmYWxzZSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgcGx1Z2luczogZW52LlZJVEVfVVNFX0JVTkRMRV9BTkFMWVpFUiA9PT0gJ3RydWUnID8gW3Zpc3VhbGl6ZXIoKV0gOiB1bmRlZmluZWQsXG4gICAgICAgIC8vIFx1NjJDNlx1NTMwNVxuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICd2dWUtY2h1bmtzJzogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYScsICd2dWUtaTE4biddLFxuICAgICAgICAgICAgJ2VsZW1lbnQtcGx1cyc6IFsnZWxlbWVudC1wbHVzJ10sXG4gICAgICAgICAgICAnd2FuZy1lZGl0b3InOiBbJ0B3YW5nZWRpdG9yL2VkaXRvcicsICdAd2FuZ2VkaXRvci9lZGl0b3ItZm9yLXZ1ZSddLFxuICAgICAgICAgICAgZWNoYXJ0czogWydlY2hhcnRzJywgJ2VjaGFydHMtd29yZGNsb3VkJ11cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjc3NDb2RlU3BsaXQ6ICEoZW52LlZJVEVfVVNFX0NTU19TUExJVCA9PT0gJ2ZhbHNlJyksXG4gICAgICBjc3NUYXJnZXQ6IFsnY2hyb21lMzEnXVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiA0MDAwLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgLy8gXHU5MDA5XHU5ODc5XHU1MTk5XHU2Q0Q1XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODAwMCcsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJylcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGhtcjoge1xuICAgICAgICBvdmVybGF5OiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJ1xuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgICd2dWUnLFxuICAgICAgICAndnVlLXJvdXRlcicsXG4gICAgICAgICd2dWUtdHlwZXMnLFxuICAgICAgICAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL3poLWNuJyxcbiAgICAgICAgJ2VsZW1lbnQtcGx1cy9lcy9sb2NhbGUvbGFuZy9lbicsXG4gICAgICAgICdAaWNvbmlmeS9pY29uaWZ5JyxcbiAgICAgICAgJ0B2dWV1c2UvY29yZScsXG4gICAgICAgICdheGlvcycsXG4gICAgICAgICdxcycsXG4gICAgICAgICdlY2hhcnRzJyxcbiAgICAgICAgJ2VjaGFydHMtd29yZGNsb3VkJyxcbiAgICAgICAgJ3FyY29kZScsXG4gICAgICAgICdAd2FuZ2VkaXRvci9lZGl0b3InLFxuICAgICAgICAnQHdhbmdlZGl0b3IvZWRpdG9yLWZvci12dWUnLFxuICAgICAgICAndnVlLWpzb24tcHJldHR5JyxcbiAgICAgICAgJ0B6eGN2Ym4tdHMvY29yZScsXG4gICAgICAgICdkYXlqcycsXG4gICAgICAgICdjcm9wcGVyanMnXG4gICAgICBdXG4gICAgfVxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtSLFNBQVMsZUFBZTtBQUMxUyxTQUFTLGVBQWU7QUFFeEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGNBQWM7QUFDckIsT0FBTyxrQkFBa0I7QUFDekIsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyw0QkFBNEI7QUFDckMsU0FBUyx5QkFBeUIsMEJBQTBCO0FBQzVELE9BQU8sWUFBWTtBQUNuQixTQUFTLGtCQUFrQjtBQWYzQixJQUFNLG1DQUFtQztBQWtCekMsSUFBTSxPQUFPLFFBQVEsSUFBSTtBQUV6QixTQUFTLFlBQVksS0FBYTtBQUNoQyxTQUFPLFFBQVEsTUFBTSxLQUFLLEdBQUc7QUFDL0I7QUFFQSxJQUFPLHNCQUFRLENBQUMsRUFBRSxTQUFTLEtBQUssTUFBNkI7QUFDM0QsTUFBSSxNQUFNLENBQUM7QUFDWCxRQUFNLFVBQVUsWUFBWTtBQUM1QixNQUFJLENBQUMsU0FBUztBQUNaLFVBQU0sUUFBUSxRQUFRLEtBQUssQ0FBQyxNQUFNLFdBQVcsUUFBUSxLQUFLLENBQUMsSUFBSSxRQUFRLEtBQUss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
