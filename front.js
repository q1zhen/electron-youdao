const $ = require('jquery')
const axios = require('axios')

function prettify(str) {
	return str.trim().replace(/\s+/g, ' ')
}

function buttonSearch() {
	let inputWord = prettify($("#inputWord").val())
	$("#result").html("")
	const url = `https://youdao.com/w/${inputWord}`
	axios.get(url)
		.then(
			(response) => {
				let content = $(response.data)
				let exist = content.find(".wordbook-js")
				if (exist.text()) {
					let mainContent = content.find("#phrsListTab")
					if (mainContent.text()) {
						let word = exist.find(".keyword")
						let phonetic = exist.find(".baav")
						let trans = mainContent.find("ul")
						let additional = mainContent.find(".additional")
						let result = ""
						result += `<div id="word">${prettify(word.text())}</div>`
						if (phonetic.text()) {
							result += `<div id="phonetic">${prettify(phonetic.text())}</div>`
						}
						result += `<div id="def">`
						if (trans.text()) {
							trans.children().each((i, n) => {
								let line = $(n).text()
								let dotIndex = line.indexOf(".")
								if (dotIndex !== -1) {
									let first = line.substring(0, dotIndex)
									let second = line.substring(dotIndex + 1)
									second = second.replaceAll("（", `<div class="dim">（`).replaceAll("）", "）</div>")
									result += `<div class="line"><div class="pos">${first}.</div>${second}</div>`
								}
								else {
									result += `<div class="line">${line}</div>`
								}
							})
						}
						else {
							$.error("No definitions.")
						}
						if (additional.text()) {
							result += `<div id="additional">${prettify(additional.text())}</div>`
						}
						result += `</div>`
						$("#result").html(result)
					}
					else {
						$.error("No definitions.")
					}
				}
				else {
					$.error("No definitions.")
				}
			}
		)
		.catch((error) => {
			let result = `<div id="word">${inputWord}</div><div id="additional">${error.message}</div>`
			$("#result").html(result)
		})
		.finally(() => {
			$("#inputWord").val("")
			$("#inputWord").focus()
		})
}

