import pkg from "../package.json"

const sharedManifest = {
  content_scripts: [
    {
      js: ["src/entries/contentScript/main.ts"],
      matches: ["*://github.com/*"],
    },
  ],
  options_ui: {
    page: "src/entries/options/index.html",
    open_in_tab: false,
  },
  permissions: ["storage"],
}
const ManifestV2 = {
  ...sharedManifest,
  // options_ui: {
  //   ...sharedManifest.options_ui,
  //   chrome_style: false,
  // },
  permissions: [...sharedManifest.permissions, "*://github.com/*"],
}

const ManifestV3 = {
  ...sharedManifest,
  host_permissions: ["*://github.com/*"],
}

export function getManifest(manifestVersion: number) {
  const manifest = {
    author: pkg.author,
    description: pkg.description,
    name: pkg.displayName ?? pkg.name,
    version: pkg.version,
  }

  if (manifestVersion === 2) {
    return {
      ...manifest,
      ...ManifestV2,
      manifest_version: manifestVersion,
      icons: { 24: "icons/icon.svg" },      

      background: {
        scripts: ["src/entries/background.ts"],
      },
      browser_specific_settings: {
        gecko: {
          id: "ghs@sevenc7c.com",
        },
      },
    }
  }

  if (manifestVersion === 3) {
    return {
      ...manifest,
      ...ManifestV3,
      icons: { 128: "icons/128.png" },

      background: {
        service_worker: "src/entries/background.ts",
        type: "module",
      },
      manifest_version: manifestVersion,
    }
  }

  throw new Error(
    `Missing manifest definition for manifestVersion ${manifestVersion}`
  )
}
