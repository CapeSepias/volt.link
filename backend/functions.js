const forbidden = {
  codes: `
undefined
null
error
public
auth
auth/google
auth/google/callback
auth/failure
logout
user.json
login
forbidden_codes
pull
exists
get
set
list
`
  .split('\n')
  .filter(Boolean),
  letters: ' /\\\'"´`(){}[]<>,;:?!¿¡=#+|~^°',
  special_letters: '.'
}

function quickcheckCode(code, { userEmail = '' }) {
  const forbidden_letters_splitted = forbidden.letters.split('')

  // Info: quickcheckCode is there to check a code without opening the file or checking it's permissions.

  // const username = (userEmail || '').split('@')[0]
  // (userEmail !== '' && admin_addresses.includes(userEmail))

  const code_split = code.split('')

  let allowed_to_edit = false

  if (
    code === ''
    || code.includes('/')
    || code.startsWith('volt')
    || forbidden.codes.includes(code)
    || forbidden_letters_splitted.filter(value => !code_split.includes(value)).length < forbidden_letters_splitted.length
  ) {
    allowed_to_edit = false
  } else {
    allowed_to_edit = true
  }

  return { allowed_to_edit }
}

function hasEditPermission(permissions, userEmail, strict = false) {
  const admin_addresses = (process.env.admin_addresses || '').split(',')

  const permissions_array_has_content = (
    typeof permissions === 'object'
    && permissions !== null
    && Array.isArray(permissions)
    && permissions.length > 0
  )

  return (
    typeof userEmail === 'string'
    && userEmail !== ''
    && (
      (
        strict !== true
        && admin_addresses.includes(userEmail)
      )
      || (
        strict !== true
        && !permissions_array_has_content
      )
      || (
        permissions_array_has_content
        && permissions
          .filter(p => !p.hasOwnProperty('role') || p.role !== 'viewer')
          .map(e => e.value)
          .includes(userEmail)
      )
    )
  )
}

function generateRandomCode(){
  return new Promise((resolve) => {
    const newCode = '!' + Math.random().toString(36).substr(2, 5)
    doesFileExist(newCode, async does_exist => {
      if (does_exist) {
        resolve(generateRandomCode())
      } else {
        resolve(newCode)
      }
    })
  })
}

function checkOrigin(origin){
  return (
    typeof origin === 'string'
    && (
      // allow from subdomains
      origin.endsWith('.volt.link')

      // allow for localhost
      || origin.endsWith('localhost:3000')
      || origin.endsWith('localhost:4000')
      || origin.endsWith('0.0.0.0:3000')
      || origin.endsWith('0.0.0.0:4000')
      || origin.endsWith('192.168.0.105:3000')
      || origin.endsWith('192.168.0.105:4000')
    )
  )
}

module.exports = {
  forbidden,
  quickcheckCode,
  hasEditPermission,
  generateRandomCode,
  checkOrigin,
}
