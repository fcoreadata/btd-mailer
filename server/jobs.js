import { createReadStream, createWriteStream } from 'fs'
import path from 'path'
import csv from 'fast-csv'

import * as config from './config'

// Helper modules
import Streak from './utils/streak'
import BoxParser from './utils/boxParser'
import Mailer from './utils/mailer'

function readCSVDataFromFile(fileName) {
	return new Promise((resolve, reject) => {
		const accumulator = []
		createReadStream(fileName)
			.pipe(csv())
			.on('data', data => accumulator.push(data))
			.on('error', error => reject(error))
			.on('end', () => resolve(accumulator))
	})
}

function writeDataToFile(data, fileName) {
	return new Promise((resolve, reject) => {
		csv
			.writeToStream(createWriteStream(fileName), data)
			.on('error', error => reject(error))
			.on('finish', () => resolve())
	})
}

export function sendBoxSummary(updateDiff) {
	const streak = new Streak(config.STREAK_API_KEY)
	let boxParser
	const diff = {
		valid: false,
	}

	return Promise.resolve()
	.then(() => {
		if (updateDiff) {
			console.log('Fetching previous company names')
			return readCSVDataFromFile(path.join(__dirname, '../data.csv'))
		}
	})
	.then((previousCompanyNames) => {
		if (previousCompanyNames && previousCompanyNames[0]) {
			diff.valid = true
			diff.prev = previousCompanyNames[0]
		}
	})
	.then(() => {
		console.log('Fetching default Streak Pipeline')
		return streak.getPipeline(config.STREAK_PIPELINE_KEY)
	})
	.then((pipeline) => {
		console.log('Searching for Streak Boxes')
		boxParser = new BoxParser(pipeline.fields)
		return Promise.all([
			streak.searchBoxes(
				config.STREAK_PIPELINE_KEY,
				config.STREAK_HOT_COMPANIES_STAGE_KEY
			),
			streak.searchBoxes(
				config.STREAK_PIPELINE_KEY,
				config.STREAK_PRE_PARTNER_STAGE_KEY
			),
		])
	})
	.then(([hotCompaniesResults, prePartnerResults]) => {
		const hotCompaniesBoxes = hotCompaniesResults.results.boxes
		const prePartnerBoxes = prePartnerResults.results.boxes
		
		if (diff.valid) {
			diff.next = hotCompaniesBoxes.map(box => box.name)
			diff.additions = diff.next.filter(name => !diff.prev.includes(name))
			diff.deletions = diff.prev.filter(name => !diff.next.includes(name))

			console.log('Saving company names')
			return writeDataToFile([diff.next], path.join(__dirname, '../data.csv'))
				.then(() => [...hotCompaniesBoxes, ...prePartnerBoxes])
		}

		return [...hotCompaniesBoxes, ...prePartnerBoxes]
	})
	.then((boxes) => {
		console.log('Fetching Streak boxes')
		const boxPromises = boxes.map((box, index) => {
			console.log(`Fetching ${index + 1}/${boxes.length}`)
			return streak.getFullBoxData(box.boxKey)
			.then((boxWithData) => {
				console.log(`Fetched ${index + 1}/${boxes.length}`)
				const parsedBox = boxParser.parseFields(boxWithData)
				console.log(`Parsed box ${index + 1}/${boxes.length}`)
				return Promise.resolve({
					...boxWithData,
					...parsedBox,
				})
			})
		})
		return Promise.all(boxPromises)
	})
	.then((parsedBoxes) => {
		console.log('Sending Box Summary email')
		const mailer = new Mailer(
			config.MAILGUN_API_KEY,
			config.MAILGUN_DOMAIN_NAME
		)
		return mailer.emailBoxSummary(config.EMAIL, {
			prePartnerMeetingBoxes: parsedBoxes
				.filter(box => box.stageKey === config.STREAK_PRE_PARTNER_STAGE_KEY),
			hotCompaniesBoxes: parsedBoxes
				.filter(box => box.stageKey === config.STREAK_HOT_COMPANIES_STAGE_KEY),
			diff,
		})
	})
}

export default sendBoxSummary
