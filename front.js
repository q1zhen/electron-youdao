const $ = require('jquery')
const axios = require('axios')

function prettify(str) {
	return str.trim().replace(/\s+/g, ' ')
}

function wordSep(input) {
	let tokens = input.split(/([.,;!:，。；、<>（）【】\[\] ])/);
	let divElements = tokens.map(function (token) {
		if (token) {
			if (/[.,;!:，。；、<>（）【】\[\] ]/.test(token)) {
				return token;
			} else {
				return '<span class="sepWord">' + prettify(token) + '</span>';
			}
		}
	});
	let resultString = divElements.join('');
	return resultString;
}

async function buttonSearch(_input) {
	let _inputWord = prettify(_input)
	let inputWord = encodeURI(_inputWord)
	$("#result").html("")
	if (inputWord) {
		$("#inputWord").attr("disabled", "yes")
		const url = `https://youdao.com/w/${inputWord}`
		await axios.get(url)
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
							result += `<div id="word">${wordSep(prettify(word.text()))}</div>`
							if (phonetic.text()) {
								result += `<div id="phonetic">${prettify(phonetic.text())}</div>`
							}
							result += `<div id="def">`
							if (trans.text()) {
								trans.children().each((i, n) => {
									let line = $(n).text()
									let dotIndex = line.indexOf(".")
									if (dotIndex !== -1) {
										let first = prettify(line.substring(0, dotIndex))
										if (first.length <= 6) {
											let second = wordSep(line.substring(dotIndex + 1))
											second = second.replaceAll("（", `<div class="dim">（`).replaceAll("）", "）</div>")
											result += `<div class="line"><div class="pos">${first}.</div>${second}</div>`
										}
										else {
											result += `<div class="line">${wordSep(line)}</div>`
										}
									}
									else {
										result += `<div class="line">${wordSep(line)}</div>`
									}
								})
							}
							else {
								$.error("No definitions.")
							}
							if (additional.text()) {
								result += `<div id="additional">${wordSep(prettify(additional.text().replaceAll("[", "").replaceAll("]", "")))}</div>`
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
				let result = `<div id="word">${wordSep(_inputWord)}</div><div id="additional">${error.message} <span id="retry">↺</span></div>`
				$("#result").html(result)
			})
			.finally(() => {
				$("#inputWord").removeAttr("disabled")
				$("#retry").on("click", (s) => {
					buttonSearch(_inputWord)
				})
				$(".sepWord").on("click", (s) => {
					buttonSearch($(s.currentTarget).text())
				})
			})
	}
	$("#inputWord").val("")
	$("#inputWord").focus()
}

$("#bg").css("background-image", `url("${process.env.APPDATA.replaceAll("\\", "/")
	}/Microsoft/Windows/Themes/TranscodedWallpaper")`)
