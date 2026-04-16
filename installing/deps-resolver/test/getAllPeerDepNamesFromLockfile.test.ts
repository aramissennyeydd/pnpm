import type { LockfileObject } from '@pnpm/lockfile.types'
import type { DepPath, ProjectId } from '@pnpm/types'

import { getAllPeerDepNamesFromLockfile } from '../lib/resolveDependencyTree.js'

function createLockfile (packages?: LockfileObject['packages']): LockfileObject {
  const importers: LockfileObject['importers'] = {}
  importers['.' as ProjectId] = { specifiers: {} }
  return {
    lockfileVersion: '9.0',
    importers,
    packages,
  }
}

test('returns empty set when lockfile has no packages', () => {
  const result = getAllPeerDepNamesFromLockfile(createLockfile())
  expect(result).toStrictEqual(new Set())
})

test('returns empty set when packages is empty', () => {
  const result = getAllPeerDepNamesFromLockfile(createLockfile({}))
  expect(result).toStrictEqual(new Set())
})

test('extracts peer dep names from peerDependencies', () => {
  const packages: LockfileObject['packages'] = {}
  packages['foo@1.0.0' as DepPath] = {
    resolution: { integrity: 'sha512-abc' },
    peerDependencies: {
      bar: '>=1.0.0',
      baz: '*',
    },
  }
  const result = getAllPeerDepNamesFromLockfile(createLockfile(packages))
  expect(result).toStrictEqual(new Set(['bar', 'baz']))
})

test('extracts peer dep names from peerDependenciesMeta', () => {
  const packages: LockfileObject['packages'] = {}
  packages['foo@1.0.0' as DepPath] = {
    resolution: { integrity: 'sha512-abc' },
    peerDependenciesMeta: {
      bar: { optional: true },
    },
  }
  const result = getAllPeerDepNamesFromLockfile(createLockfile(packages))
  expect(result).toStrictEqual(new Set(['bar']))
})

test('combines and deduplicates names from peerDependencies and peerDependenciesMeta across snapshots', () => {
  const packages: LockfileObject['packages'] = {}
  packages['foo@1.0.0' as DepPath] = {
    resolution: { integrity: 'sha512-abc' },
    peerDependencies: {
      bar: '>=1.0.0',
      baz: '*',
    },
    peerDependenciesMeta: {
      bar: { optional: true },
    },
  }
  packages['qux@2.0.0' as DepPath] = {
    resolution: { integrity: 'sha512-def' },
    peerDependencies: {
      baz: '>=2.0.0',
      quux: '*',
    },
  }
  const result = getAllPeerDepNamesFromLockfile(createLockfile(packages))
  expect(result).toStrictEqual(new Set(['bar', 'baz', 'quux']))
})

test('skips packages without peer dependencies', () => {
  const packages: LockfileObject['packages'] = {}
  packages['no-peers@1.0.0' as DepPath] = {
    resolution: { integrity: 'sha512-abc' },
    dependencies: {
      lodash: '4.17.21',
    },
  }
  packages['has-peers@1.0.0' as DepPath] = {
    resolution: { integrity: 'sha512-def' },
    peerDependencies: {
      react: '>=16',
    },
  }
  const result = getAllPeerDepNamesFromLockfile(createLockfile(packages))
  expect(result).toStrictEqual(new Set(['react']))
})
