const { test } = require('ava')
const HasRoleDirective = require('./hasRole')

test('context.auth.hasRole is called when type is client', async (t) => {
  t.plan(3)
  const directiveArgs = {
    role: 'admin',
    type: 'client'
  }

  const directive = new HasRoleDirective({
    name: 'testHasRoleDirective',
    args: directiveArgs
  })

  const field = {
    resolve: (root, args, context, info) => {
      t.pass()
    }
  }

  directive.visitFieldDefinition(field)

  const root = {}
  const args = {}
  const context = {
    auth: {
      getToken: () => {
        return {
          hasRole: (role) => {
            t.pass()
            t.deepEqual(role, directiveArgs.role)
            return true
          }
        }
      }
    }
  }
  const info = {}

  await field.resolve(root, args, context, info)
})

test('context.auth.hasRealmRole is called when type is realm', async (t) => {
  t.plan(3)
  const directiveArgs = {
    role: 'admin',
    type: 'realm'
  }

  const directive = new HasRoleDirective({
    name: 'testHasRoleDirective',
    args: directiveArgs
  })

  const field = {
    resolve: (root, args, context, info) => {
      t.pass()
    }
  }

  directive.visitFieldDefinition(field)

  const root = {}
  const args = {}
  const context = {
    auth: {
      getToken: () => {
        return {
          hasRealmRole: (role) => {
            t.pass()
            t.deepEqual(role, directiveArgs.role)
            return true
          }
        }
      }
    }
  }
  const info = {}

  await field.resolve(root, args, context, info)
})

test('context.auth.hasRole is called when type is not specified, i.e. client type auth is used', async (t) => {
  t.plan(3)
  const directiveArgs = {
    role: 'admin' // notice no type arg here
  }

  const directive = new HasRoleDirective({
    name: 'testHasRoleDirective',
    args: directiveArgs
  })

  const field = {
    resolve: (root, args, context, info) => {
      return new Promise((resolve, reject) => {
        t.pass()
        return resolve()
      })
    }
  }

  directive.visitFieldDefinition(field)

  const root = {}
  const args = {}
  const context = {
    auth: {
      getToken: () => {
        return {
          hasRole: (role) => {
            t.pass()
            t.deepEqual(role, directiveArgs.role)
            return true
          }
        }
      }
    }
  }
  const info = {}

  await field.resolve(root, args, context, info)
})

test('field.resolve will throw an error when type is not one of [client, realm]', async (t) => {
  const directiveArgs = {
    role: 'admin',
    type: 'some random type'
  }

  const directive = new HasRoleDirective({
    name: 'testHasRoleDirective',
    args: directiveArgs
  })

  const field = {
    resolve: (root, args, context, info) => {
      return new Promise((resolve, reject) => {
        t.fail('the original resolver should never be called when an auth error is thrown')
        return reject(new Error('the original resolver should never be called when an auth error is thrown'))
      })
    }
  }

  directive.visitFieldDefinition(field)

  const root = {}
  const args = {}
  const context = {}
  const info = {}

  await t.throws(async () => {
    await field.resolve(root, args, context, info)
  }, 'type argument in hasRole directive must be one of client,realm')
})

test('if context.auth.getToken.hasRole() is false, then an error is returned and the original resolver will not execute', async (t) => {
  const directiveArgs = {
    role: 'admin',
    type: 'client'
  }

  const directive = new HasRoleDirective({
    name: 'testHasRoleDirective',
    args: directiveArgs
  })

  const field = {
    resolve: (root, args, context, info) => {
      return new Promise((resolve, reject) => {
        t.fail('the original resolver should never be called when an auth error is thrown')
        return reject(new Error('the original resolver should never be called when an auth error is thrown'))
      })
    },
    name: 'test'
  }

  directive.visitFieldDefinition(field)

  const root = {}
  const args = {}
  const context = {
    auth: {
      getToken: () => {
        return {
          hasRole: (role) => {
            t.deepEqual(role, directiveArgs.role)
            return false
          }
        }
      }
    }
  }
  const info = {}

  await t.throws(async () => {
    await field.resolve(root, args, context, info)
  }, `logged in user does not have sufficient permissions for ${field.name}: missing role ${directiveArgs.role}`)
})

test('if context.auth.getToken.hasRealmRole() is false, then an error is returned and the original resolver will not execute', async (t) => {
  const directiveArgs = {
    role: 'admin',
    type: 'realm'
  }

  const directive = new HasRoleDirective({
    name: 'testHasRoleDirective',
    args: directiveArgs
  })

  const field = {
    resolve: (root, args, context, info) => {
      return new Promise((resolve, reject) => {
        t.fail('the original resolver should never be called when an auth error is thrown')
        return reject(new Error('the original resolver should never be called when an auth error is thrown'))
      })
    },
    name: 'test'
  }

  directive.visitFieldDefinition(field)

  const root = {}
  const args = {}
  const context = {
    auth: {
      getToken: () => {
        return {
          hasRealmRole: (role) => {
            t.deepEqual(role, directiveArgs.role)
            return false
          }
        }
      }
    }
  }
  const info = {}

  await t.throws(async () => {
    await field.resolve(root, args, context, info)
  }, `logged in user does not have sufficient permissions for ${field.name}: missing role ${directiveArgs.role}`)
})
