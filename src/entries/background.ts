import browser from "webextension-polyfill"

browser.runtime.onMessage.addListener((message) => {
  switch (message.action) {
    case "openOptionsPage":
      openOptionsPage()
      break
    default:
      break
  }
})

const openOptionsPage = () => {
  browser.runtime.openOptionsPage()
}
