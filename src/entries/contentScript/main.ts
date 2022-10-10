import browser from "webextension-polyfill"
import panelContainer from "./panel.html?raw"
import panelContent from "./panel-content.html?raw"
import panelButton from "./panel-button.html?raw"

const storage = browser.storage.sync
const fillRepo = (base: string) => {
  const [_, owner, repo] = location.pathname.split("/")
  return base.replaceAll("{owner}", owner).replaceAll("{repo}", repo)
}
const htmlToElement = (html: string) => {
  const template = document.createElement("template")
  html = html.trim()
  template.innerHTML = html
  return template.content.firstChild!
}
const injectPanel = async () => {
  if (!location.pathname.match(/^\/[^/]+\/[^/]+$/)) return
  document.querySelector("[data-ghs-section]")?.remove()

  const clonePanel =
    document.querySelector("#local-panel > .list-style-none") ||
    document.querySelector(
      "div[data-target='get-repo.modal'] > .list-style-none"
    )
  if (!clonePanel) {
    // FIXME: There should be much better solution
    console.log("Panel not found, retrying in 100ms")
    setTimeout(injectPanel, 100)
    return
  }

  let snippets: SnippetData[]
  try {
    snippets = (await storage.get("snippets")).snippets?.data ?? []
  } catch (e) {
    return
  }
  const panelHtml = panelContainer
    .replaceAll(
      "{selector}",
      snippets
        .map((content, i) =>
          panelButton
            .replaceAll("{name}", content.name)
            .replaceAll("{isFirst}", i === 0 ? "true" : "false")
        )
        .join("")
    )
    .replaceAll(
      "{snippets}",
      snippets
        .map((content, i) =>
          panelContent
            .replaceAll(
              "{content}",
              fillRepo(content.content).replaceAll('"', "&quot;")
            )
            .replaceAll("{description}", content.description)
            .replace("{hidden}", i === 0 ? "" : "hidden")
        )
        .join("")
    )
    .replaceAll(
      /\{if-any-snippets\}([\s\S]*?)\{\/if-any-snippets\}/mg,
      (_m, p1) => {
        return snippets.length > 0
          ? p1.split("{else}")[0]
          : p1.split("{else}")[1]
      }
    )

  clonePanel.insertBefore(
    htmlToElement(panelHtml),
    clonePanel.firstElementChild!.nextSibling
  )
  const settingsButton = document.querySelector(
    "#ghs-settings"
  ) as HTMLAnchorElement
  settingsButton.onclick = () => {
    browser.runtime.sendMessage({ action: "openOptionsPage" })
  }
}
document.addEventListener("turbo:visit", injectPanel)
document.addEventListener("DOMContentLoaded", injectPanel)
injectPanel()
