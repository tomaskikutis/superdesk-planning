const events = (state = [], action) => {
    switch (action.type) {
        case 'ADD_EVENT':
            var events = state.slice()
            var old = events.find((e) => e._id === action.event._id)
            // if it was present we update ...
            if (old) {
                let index = events.indexOf(old)
                // replace the old event by the new one
                events.splice(index, 1, action.event)
                return events
            }
            // ... if not we add
            events.push(action.event)
            // and we order by date
            return events.sort((a, b) => (a.dates.start > b.dates.start))
        case 'RECEIVE_EVENTS':
            return action.events
        case 'REQUEST_EVENTS':
            return state
        default:
            return state
    }
}

export default events
