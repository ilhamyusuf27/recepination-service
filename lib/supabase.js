const { createClient } = require('@supabase/supabase-js')
const AppError = require('../utils/AppError')

let client

const getSupabase = () => {
  if (!process.env.SUPABASE_ENDPOINT || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError('File storage is not configured', 503)
  }
  if (!client) {
    client = createClient(process.env.SUPABASE_ENDPOINT, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  }
  return client
}

module.exports = getSupabase
