const getDropdownValue = (dropdownKey, field) => {
	const { items } = field.dropdownSettings
	const matchingItem = items.find(item => item.key === dropdownKey)

	return (matchingItem || {}).name
}

const getTagValue = (tagKey, field) => {
	const { tags } = field.tagSettings
	const matchingTag = tags.find(tag => tag.key === tagKey)

	return (matchingTag || {}).tag
}

const getTagValues = (tagKeys = [], field) => tagKeys
	.map(tagKey => getTagValue(tagKey, field))
	.join(', ')

const htmlEscapeString = (string = '') => string
	.replace('£', '&#163;')
	.replace(/[^ -~]/g, ' ')

const parseAssignee = assignee => ({
	displayName: assignee.displayName,
	image: assignee.image,
	email: assignee.email,
})

class BoxParser {

	constructor(fields) {
		this.fields = fields
	}

	parseFields(box) {
		return {
			name: box.name,
			description: this.parseBoxField(box, 'Description'),
			cities: this.parseBoxField(box, 'City'),
			traction: this.parseBoxField(box, 'Traction'),
			teamDescription: this.parseBoxField(box, 'Team'),
			rank: this.parseBoxField(box, 'Team rating (1-5)'),
			raiseAmount: this.parseBoxField(box, 'Deal Size'),
			nextSteps: this.parseBoxField(box, 'Next step'),
			files: box.documents,
			hasFiles: !!box.documents && box.documents.length,
			assignees: box.assignedToSharingEntries.map(parseAssignee),
		}
	}

	parseBoxField(box, fieldName) {
		const field = this.findFieldByName(fieldName)
		if (!field || !box.fields) return null

		const fieldValue = box.fields[field.key]
		switch (field.type) {
		case 'TEXT_INPUT':
			return htmlEscapeString(fieldValue)
		case 'DROPDOWN':
			return getDropdownValue(fieldValue, field)
		case 'TAG':
			return getTagValues(fieldValue, field)
		default:
			return null
		}
	}

	findFieldByName(fieldName) {
		return this.fields.find(field => field.name === fieldName)
	}

}

export default BoxParser
