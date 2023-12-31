const $ = require('jquery')
const axios = require('axios')

var searched = ['']

function prettify(str) {
	return str.trim().replace(/\s+/g, ' ')
}

function wordSep(input) {
	let tokens = input.split(/([.,;!:，。；、<>【】\[\] ])/);
	let divElements = tokens.map(function (token) {
		if (token) {
			if (/[.,;!:，。；、<>【】\[\] ]/.test(token)) {
				return token;
			} else {
				return `<span class="sepWord">${prettify(token)}</span>`;
			}
		}
	});
	let resultString = divElements.join('');
	return resultString;
}

function prev() {
	if (searched.length != 0 && searched.length != 1) {
		searched.pop()
		buttonSearch(searched[searched.length - 1])
	}
	if (searched.length == 0 || searched.length == 1) {
		$("#prev").addClass("disabled")
	}
	else {
		$("#prev").removeClass("disabled")
	}
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
											second = second.replaceAll("（", `<div class="dim">`).replaceAll("）", "</div>")
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
								$(".dim").each((i, n) => {
									$(n).html($(n).text())
								})
							}
							else {
								$.error("ndef")
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
						$.error("ndef")
					}
				}
			)
			.catch(async (error) => {
				try {
					if (error.message == "ndef") {
						await gtranslate(_inputWord).then(response => {
							let result = `<div id="word">${wordSep(_inputWord)}</div><div id="def"><div clas="line">${wordSep(response)}</div><div id="additional">(Google translated)</div></div>`
							$("#result").html(result)
						})
					}
					else {
						$.error(error.message)
					}
				} catch (e) {
					let result = `<div id="word">${wordSep(_inputWord)}</div><div id="additional">${error.message} <span id="retry" title="Retry">↺</span></div>`
					$("#result").html(result)
				}
			})
			.finally(() => {
				$("#inputWord").removeAttr("disabled")
				$("#retry").on("click", (s) => {
					buttonSearch(_inputWord)
				})
				$(".sepWord").on("mouseover", (s) => {
					let nextword = $(s.currentTarget.outerHTML)
					nextword.find(".dim").remove()
					$(s.currentTarget).attr("title", `Search for "${nextword.text()}"`)
				})
				$(".sepWord").on("click", (s) => {
					let nextword = $(s.currentTarget.outerHTML)
					nextword.find(".dim").remove()
					buttonSearch(nextword.text())
				})
				if ($("#word").text().length > 20) {
					$("#word").addClass("long")
				}
			})
	}
	if (_inputWord != searched[searched.length - 1]) {
		if (searched[searched.length - 1]) {
			searched.push(_inputWord)
		}
		else {
			searched[searched.length - 1] = _inputWord
		}
	}
	if (searched.length == 0 || searched.length == 1) {
		$("#prev").addClass("disabled")
	}
	else {
		$("#prev").removeClass("disabled")
	}
	$("#inputWord").val("")
	$("#inputWord").focus()
}

async function gtranslate(input, to = "en") {
	let r
	await axios.get("https://translate.googleapis.com/translate_a/single", {
		params: {
			client: "gtx",
			dt: "t",
			sl: "auto",
			tl: to,
			q: input,
		}
	})
		.then(response => {
			let result = response.data[0][0][0]
			if (result == input && to == "en") {
				r = gtranslate(input, "zh")
			}
			else {
				r = result
			}
		})
	return r
}

prev()
$("#bg").css("background-image", `url("${process.env.APPDATA.replaceAll("\\", "/")
	}/Microsoft/Windows/Themes/TranscodedWallpaper")`)
