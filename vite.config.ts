import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import type { NitroConfig } from "nitropack";
import { build, copyPublicAssets, createNitro, prepare } from "nitropack";
import { dirname, resolve } from "pathe";
import type { Rollup } from "vite";
import { defineConfig, type PluginOption, type ResolvedConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

let ssrBundle: Rollup.OutputBundle;
let ssrEntryFile: string;

function isFullUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function nitroV2PluginWithAbsoluteRequest(
  nitroConfig?: NitroConfig,
): Array<PluginOption> {
  let resolvedConfig: ResolvedConfig;
  return [
    {
      name: "tanstack-nitro-v2-vite-plugin",
      generateBundle: {
        handler(_options, bundle) {
          if (this.environment.name !== "ssr") {
            return;
          }
          let entryFile: string | undefined;
          for (const file of Object.values(bundle)) {
            if (file.type === "chunk" && file.isEntry) {
              if (entryFile !== undefined) {
                this.error(
                  `Multiple entry points found for service "${this.environment.name}". Only one entry point is allowed.`,
                );
              }
              entryFile = file.fileName;
            }
          }
          if (entryFile === undefined) {
            this.error(
              `No entry point found for service "${this.environment.name}".`,
            );
          }
          ssrEntryFile = entryFile!;
          ssrBundle = bundle;
        },
      },
      configResolved(config) {
        resolvedConfig = config;
      },
      config(_, env) {
        if (env.command !== "build") {
          return;
        }
        return {
          environments: {
            ssr: {
              consumer: "server",
              build: {
                ssr: true,
                write: false,
                copyPublicDir: false,
                commonjsOptions: {
                  include: [/node_modules/],
                },
              },
            },
          },
          builder: {
            sharedPlugins: true,
            async buildApp(builder) {
              const client = builder.environments.client;
              const server = builder.environments.ssr;
              if (!client) {
                throw new Error("Client environment not found");
              }
              if (!server) {
                throw new Error("SSR environment not found");
              }
              await builder.build(client);
              await builder.build(server);
              const virtualEntry = "#tanstack/start/entry";
              const baseURL = !isFullUrl(resolvedConfig.base)
                ? resolvedConfig.base
                : undefined;
              const config: NitroConfig = {
                baseURL,
                publicAssets: [
                  {
                    dir: client.config.build.outDir,
                    maxAge: 31536000,
                    baseURL: "/",
                  },
                ],
                ...nitroConfig,
                esbuild: {
                  options: {
                    target: server.config.build.target || undefined,
                    ...nitroConfig?.esbuild?.options,
                  },
                },
                renderer: virtualEntry,
                rollupConfig: {
                  ...nitroConfig?.rollupConfig,
                  plugins: [virtualBundlePlugin(ssrBundle) as never],
                },
                virtual: {
                  ...nitroConfig?.virtual,
                  [virtualEntry]: `import { eventHandler } from 'h3'
import handler from '${ssrEntryFile}'
export default eventHandler((event) => {
  const req = event.req
  if (req instanceof Request) {
    return handler.fetch(req)
  }
  const headers = req.headers instanceof Headers ? req.headers : new Headers(req.headers)
  const proto = headers.get('x-forwarded-proto') ?? 'http'
  const host = headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000'
  const url = new URL(req.url ?? '/', \`\${proto}://\${host}\`)
  const method = req.method ?? 'GET'
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const request = new Request(url, {
    method,
    headers,
    body: hasBody ? req : undefined,
    duplex: hasBody ? 'half' : undefined
  })
  return handler.fetch(request)
})`,
                },
              };
              const nitro = await createNitro(config);
              await prepare(nitro);
              await copyPublicAssets(nitro);
              await build(nitro);
              await nitro.close();
            },
          },
        };
      },
    },
  ];
}

function virtualBundlePlugin(bundle: Rollup.OutputBundle): Rollup.Plugin {
  type VirtualModule = { code: string; map: string | null };
  let modules: Map<string, VirtualModule> | null = null;
  const getModules = () => {
    if (modules) {
      return modules;
    }
    modules = new Map();
    for (const [fileName, content] of Object.entries(bundle) as Array<
      [string, Rollup.OutputAsset | Rollup.OutputChunk]
    >) {
      if (content.type === "chunk") {
        const virtualModule: VirtualModule = {
          code: content.code,
          map: null,
        };
        const maybeMap = bundle[`${fileName}.map`];
        if (maybeMap && maybeMap.type === "asset") {
          virtualModule.map = maybeMap.source as string;
        }
        modules.set(fileName, virtualModule);
        modules.set(resolve(fileName), virtualModule);
      }
    }
    return modules;
  };
  return {
    name: "virtual-bundle",
    resolveId(id: string, importer?: string) {
      const currentModules = getModules();
      if (currentModules.has(id)) {
        return resolve(id);
      }
      if (importer) {
        const resolved = resolve(dirname(importer), id);
        if (currentModules.has(resolved)) {
          return resolved;
        }
      }
      return null;
    },
    load(id: string) {
      const currentModules = getModules();
      const module = currentModules.get(id);
      if (!module) {
        return null;
      }
      return module;
    },
  };
}

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    nitroV2PluginWithAbsoluteRequest(),
    viteReact(),
  ],
  ssr: {
    external: ["better-auth"],
  },
});

export default config;
