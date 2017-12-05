import dotenv from 'dotenv'

dotenv.config()

export const STREAK_API_KEY = process.env.STREAK_API_KEY
export const STREAK_PIPELINE_KEY = process.env.STREAK_PIPELINE_KEY
export const STREAK_HOT_COMPANIES_STAGE_KEY =
	process.env.STREAK_HOT_COMPANIES_STAGE_KEY
export const STREAK_PRE_PARTNER_STAGE_KEY =
	process.env.STREAK_PRE_PARTNER_STAGE_KEY
export const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY
export const MAILGUN_DOMAIN_NAME = process.env.MAILGUN_DOMAIN_NAME
export const EMAIL = process.env.EMAIL
