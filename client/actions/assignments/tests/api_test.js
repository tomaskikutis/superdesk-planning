import assignmentsApi from '../api'
import sinon from 'sinon'
import moment from 'moment'
import {
    getTestActionStore,
    restoreSinonStub,
} from '../../../utils/testUtils'

describe('actions.assignments.api', () => {
    let store
    let services
    let data

    beforeEach(() => {
        store = getTestActionStore()
        services = store.services
        data = store.data

        sinon.stub(assignmentsApi, 'query').callsFake(() => (Promise.resolve({})))
        sinon.stub(assignmentsApi, 'receivedAssignments').callsFake(() => (Promise.resolve({})))
        sinon.stub(assignmentsApi, 'fetchAssignmentById').callsFake(() => (Promise.resolve({})))
        sinon.stub(assignmentsApi, 'save').callsFake(() => (Promise.resolve({})))
    })

    afterEach(() => {
        restoreSinonStub(assignmentsApi.query)
        restoreSinonStub(assignmentsApi.receivedAssignments)
        restoreSinonStub(assignmentsApi.fetchAssignmentById)
        restoreSinonStub(assignmentsApi.save)
    })

    describe('query', () => {
        beforeEach(() => {
            restoreSinonStub(assignmentsApi.query)
        })

        it('query with search filter by desk Asc by Created', (done) => {
            const source = '{"query":{"bool":'
                + '{"must":[{"term":{"assigned_to.desk":"desk1"}},'
                + '{"query_string":{"query":"test"}}]}}}'

            store.initialState.assignment = {
                ...store.initialState.assignment,
                filterBy: 'All',
                searchQuery: 'test',
                orderByField: 'Created',
                orderDirection: 'Asc',
                lastAssignmentLoadedPage: 2,
            }

            store.test(done, assignmentsApi.query())
            .then(() => {
                expect(services.api('assignments').query.callCount).toBe(1)
                const params = services.api('assignments').query.args[0][0]
                expect(params).toEqual({
                    page: 2,
                    sort: '[("_created", 1)]',
                    source: source,
                })

                done()
            })
        })

        it('query without search and filter by user Desc by Updated', (done) => {
            const source = '{"query":{"bool":{"must":[{"term":'
                + '{"assigned_to.user":"ident1"}}]}}}'

            store.initialState.assignment = {
                ...store.initialState.assignment,
                filterBy: 'User',
                searchQuery: null,
                orderByField: 'Updated',
                orderDirection: 'Desc',
                lastAssignmentLoadedPage: 3,
            }

            store.test(done, assignmentsApi.query())
            .then(() => {
                expect(services.api('assignments').query.callCount).toBe(1)
                const params = services.api('assignments').query.args[0][0]
                expect(params).toEqual({
                    page: 3,
                    sort: '[("_updated", -1)]',
                    source: source,
                })

                done()
            })
        })
    })

    describe('fetchByAssignmentId', () => {
        beforeEach(() => {
            restoreSinonStub(assignmentsApi.fetchAssignmentById)
        })

        it('fetches using assignment id', (done) => {
            store.test(done, () => {
                store.initialState.assignment.assignments = {}
                return store.dispatch(assignmentsApi.fetchAssignmentById('as1'))
            })
            .then((item) => {
                expect(item).toEqual(data.assignments[0])
                expect(services.api('assignments').getById.callCount).toBe(1)
                expect(services.api('assignments').getById.args[0]).toEqual(['as1'])

                expect(assignmentsApi.receivedAssignments.callCount).toBe(1)
                expect(assignmentsApi.receivedAssignments.args[0]).toEqual([[data.assignments[0]]])
                done()
            })
        })

        it('fetch assignment using force=true', (done) => {
            store.test(done, () => store.dispatch(assignmentsApi.fetchAssignmentById('as1', true)))
            .then((item) => {
                expect(item).toEqual(data.assignments[0])
                expect(services.api('assignments').getById.callCount).toBe(1)
                expect(services.api('assignments').getById.args[0]).toEqual(['as1'])

                expect(assignmentsApi.receivedAssignments.callCount).toBe(1)
                expect(assignmentsApi.receivedAssignments.args[0]).toEqual([[data.assignments[0]]])
                done()
            })
        })

        it('returns store instance when already loaded', (done) => {
            store.test(done, () => store.dispatch(assignmentsApi.fetchAssignmentById('as1')))
            .then((item) => {
                const storeItem = {
                    ...data.assignments[0],
                    planning: {
                        ...data.assignments[0].planning,
                        scheduled: moment(data.assignments[0].planning.scheduled),
                    },
                }
                expect(item).toEqual(storeItem)
                expect(services.api('assignments').getById.callCount).toBe(0)
                expect(assignmentsApi.receivedAssignments.callCount).toBe(0)

                done()
            })
        })

        it('returns Promise.reject on error', (done) => {
            services.api('assignments').getById = sinon.spy(() => (Promise.reject('Failed!')))
            store.test(done, () => {
                store.initialState.assignment.assignments = {}
                return store.dispatch(assignmentsApi.fetchAssignmentById('as1'))
            })
            .then(() => {}, (error) => {
                expect(services.api('assignments').getById.callCount).toBe(1)
                expect(services.api('assignments').getById.args[0]).toEqual(['as1'])

                expect(assignmentsApi.receivedAssignments.callCount).toBe(0)

                expect(error).toBe('Failed!')
                done()
            })
        })
    })
})