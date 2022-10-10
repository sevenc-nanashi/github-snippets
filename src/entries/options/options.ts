import browser from "webextension-polyfill"
import "./style.css"
let snippets: SnippetData[] = []
const snippetTable = document.querySelector("#snippet-table")!
const snippetRow = document.querySelector("#snippet-row-template")!
const storage = browser.storage.sync
const updateSnippetTable = () => {
  document.querySelectorAll(".snippet-row").forEach((row) => row.remove())
  snippets = snippets.filter(
    (snippet, i, ary) => snippet.name !== "" || i === ary.length - 1
  )
  snippets.forEach((snippet) => {
    const row = snippetRow.cloneNode(true) as HTMLTemplateElement
    ;(
      row.content.querySelector("td:nth-of-type(1) input") as HTMLInputElement
    ).value = snippet.name
    ;(
      row.content.querySelector("td:nth-of-type(2) input")! as HTMLInputElement
    ).value = snippet.content
    ;(
      row.content.querySelector("td:nth-of-type(3) input")! as HTMLInputElement
    ).value = snippet.description
    const deleteButton = row.content.querySelector(
      "td:nth-of-type(4) button"
    )! as HTMLInputElement
    deleteButton.onclick = () => {
      snippets = snippets.filter((s) => s.name !== snippet.name)
      updateSnippetTable()
    }
    row.content.querySelectorAll("input").forEach((input) => {
      input.onchange = () => {
        // @ts-ignore
        snippet[input.getAttribute("data-field")!] = input.value
      }
      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
        }
        return 1
      }
    })
    snippetTable!.appendChild(row.content)
  })
  ;(
    document.querySelector("#no-snippets") as HTMLTableRowElement
  ).style.display = snippets.length === 0 ? "table-row" : "none"
}
;(async () => {
  snippets =
    (await storage.get("snippets").catch(() => ({ snippets: { data: [] } })))
      .snippets.data ?? []
  updateSnippetTable()
})()
;(document.querySelector("#add-snippet") as HTMLButtonElement).onclick = () => {
  snippets.push({
    name: "",
    content: "",
    description: "",
  })
  updateSnippetTable()
}
;(document.querySelector("#save-snippet") as HTMLButtonElement).onclick =
  async () => {
    snippets = snippets.filter(
      (snippet) =>
        snippet.name !== "" &&
        snippet.content !== "" &&
        snippet.description !== ""
    )
    updateSnippetTable()
    await storage.set({ snippets: { data: snippets } })
    document.querySelector("#save-snippet-status")!.animate(
      {
        opacity: [1, 0],
      },
      {
        duration: 1000,
        fill: "forwards",
      }
    )
  }

const presets = [
  {
    name: "vim-plug",
    content: "Plug '{owner}/{repo}'",
    description: "Add this repository as a plugin with vim-plug.",
  },
  {
    name: "dein.vim",
    content: "call dein#add('{owner}/{repo}')",
    description: "Add this repository as a plugin with dein.vim.",
  },
  {
    name: "Gemfile",
    content: 'gem "", github: "{owner}/{repo}"',
    description: "Add this repository as a gem with bundler.",
  },
  {
    name: "Cargo.toml",
    content: '{repo} = {{ git = "https://github.com/{owner}/{repo}" }}',
    description: "Add this repository as a dependency with cargo.",
  },
  {
    name: "requirements.txt",
    content: "git+https://github.com/{owner}/{repo}.git",
    description: "Add this repository as a dependency with pip.",
  },
  {
    name: "npm",
    content: "npm i https://github.com/{owner}/{repo}.git",
    description: "Add this repository as a dependency with npm.",
  },
  {
    name: "yarn",
    content: "yarn add https://github.com/{owner}/{repo}.git",
    description: "Add this repository as a dependency with yarn.",
  },
  {
    name: "pnpm",
    content: "pnpm add https://github.com/{owner}/{repo}.git",
    description: "Add this repository as a dependency with pnpm.",
  },
]

const presetContainer = document.querySelector(
  "#preset-container"
) as HTMLDivElement
presets.forEach((preset) => {
  const addButton = document.createElement("button")
  addButton.innerText = preset.name
  addButton.className = "browser-style"
  addButton.onclick = () => {
    snippets.push(preset)
    updateSnippetTable()
  }
  presetContainer.appendChild(addButton)
})
