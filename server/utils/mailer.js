import Mailgun from 'mailgun-js'
import moment from 'moment'
import renderer from './renderer'

const renderHTML = (data) => new Promise((resolve, reject) => {
	console.log('Rendering HTML')

	renderer.render('summary_email', {
		prePartnerMeetingCompanies: data.prePartnerMeetingBoxes,
		hotCompanies: data.hotCompaniesBoxes,
		diff: data.diff,
	}, (err, html) => {
		if (err) {
			return reject(err)
		}

		console.log('Rendered HTML')
		return resolve(html)
	})
})

class Mailer {

	constructor(apiKey, domain) {
		this.domain = domain
		this.mailgun = Mailgun({
			apiKey,
			domain,
		})
	}

	emailBoxSummary(email, data) {
		return renderHTML(data)
		.then(html => new Promise((resolve, reject) => {
			const dateString = moment().format('DD/MM/YYYY')
			const emailData = {
				from: `Balderton Mailer <no-reply@${this.domain}>`,
				to: email,
				subject: `Hot Company Summary [ ${dateString} ]`,
				html,
			}

			console.log(`Sending email to ${email}`)
			this.mailgun.messages().send(emailData, (error, body) => {
				if (error) {
					return reject(error)
				}

				console.log('Sent email')
				return resolve(body.message)
			})
		}))
	}

}

export default Mailer
