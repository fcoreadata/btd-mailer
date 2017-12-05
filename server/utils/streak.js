import 'isomorphic-fetch'

const STREAK_API_ROOT = 'www.streak.com/api/v1'

// Checks if the response status is a succesful one. If so
// it returns the response, otherwise it throws an error
const checkStatus = (response) => {
	if (response.status >= 200 && response.status < 300) {
		return response
	}
	const error = new Error(response.statusText)
	error.response = response
	throw error
}

const parseJSON = response => response.json()

const callAPIandParseJSON = path => fetch(path)
	.then(checkStatus)
	.then(parseJSON)

class Streak {

	constructor(apiKey) {
		this.apiKey = apiKey
	}

	appendToAuthenticatedRoot(path) {
		return `https://${this.apiKey}:@${STREAK_API_ROOT}${path}`
	}

	getPipeline(pipelineKey) {
		const path = this.appendToAuthenticatedRoot(`/pipelines/${pipelineKey}`)
		return callAPIandParseJSON(path)
	}

	getBox(boxKey) {
		const path = this.appendToAuthenticatedRoot(`/boxes/${boxKey}`)
		return callAPIandParseJSON(path)
	}

	getPipelineBoxes(pipelineKey) {
		const path =
			this.appendToAuthenticatedRoot(`/pipelines/${pipelineKey}/boxes`)
		return callAPIandParseJSON(path)
	}

	searchBoxes(pipelineKey, stageKey) {
		const path = this.appendToAuthenticatedRoot(
			`/search?query=*&pipelineKey=${pipelineKey}&stageKey=${stageKey}`
		)
		return callAPIandParseJSON(path)
	}

	getBoxFilesMetadata(boxKey) {
		const path = this.appendToAuthenticatedRoot(`/boxes/${boxKey}/files`)
		return callAPIandParseJSON(path)
	}

	getFullBoxData(boxKey) {
		let currentBox
		return this.getBox(boxKey)
		.then((box) => {
			currentBox = box
			return this.getBoxFilesMetadata(currentBox.boxKey)
		})
		.then((filesMetadata) => {
			currentBox.documents = filesMetadata.map(metadata => metadata.fileName)
			return currentBox
		})
	}

}

export default Streak
