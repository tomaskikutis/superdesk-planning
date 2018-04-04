import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import moment from 'moment';

import * as actions from '../../actions';
import * as selectors from '../../selectors';
import {ITEM_TYPE, TEMP_ID_PREFIX} from '../../constants';

import {SubNavBar, FiltersBar} from '../../components/Main';
import {ArchiveItem} from '../../components/Archive';

export const PlanningSubNavComponent = ({
    filtersOpen,
    toggleFilterPanel,
    addEvent,
    addPlanning,
    openAgendas,
    fullText,
    search,
    activeFilter,
    filter,
    enabledAgendas,
    disabledAgendas,
    selectAgenda,
    currentAgendaId,
    isViewFiltered,
    clearSearch,
    withArchiveItem,
    archiveItem,
    showFilters,
    createPlanningOnly,
}) => (
    <div>
        {withArchiveItem && <ArchiveItem item={archiveItem} />}
        <SubNavBar
            addEvent={addEvent}
            addPlanning={addPlanning}
            openAgendas={openAgendas}
            value={fullText}
            search={search}
            activeFilter={activeFilter}
            createPlanningOnly={createPlanningOnly} />
        <FiltersBar
            filterPanelOpen={filtersOpen}
            toggleFilterPanel={toggleFilterPanel}
            activeFilter={activeFilter}
            setFilter={filter}
            enabledAgendas={enabledAgendas}
            disabledAgendas={disabledAgendas}
            selectAgenda={selectAgenda}
            currentAgendaId={currentAgendaId}
            showFilters={showFilters}
            isViewFiltered={isViewFiltered}
            clearSearch={clearSearch}
        />
    </div>
);

PlanningSubNavComponent.propTypes = {
    filtersOpen: PropTypes.bool,
    toggleFilterPanel: PropTypes.func,
    addEvent: PropTypes.func,
    addPlanning: PropTypes.func,
    openAgendas: PropTypes.func,
    fullText: PropTypes.string,
    search: PropTypes.func.isRequired,
    activeFilter: PropTypes.string.isRequired,
    filter: PropTypes.func.isRequired,
    enabledAgendas: PropTypes.array,
    disabledAgendas: PropTypes.array,
    selectAgenda: PropTypes.func.isRequired,
    currentAgendaId: PropTypes.string.isRequired,
    isViewFiltered: PropTypes.bool,
    clearSearch: PropTypes.func,
    withArchiveItem: PropTypes.bool,
    showFilters: PropTypes.bool,
    createPlanningOnly: PropTypes.bool,
    archiveItem: PropTypes.object,
};

PlanningSubNavComponent.defaultProps = {showFilters: true};

const mapStateToProps = (state) => ({
    fullText: selectors.main.fullText(state),
    activeFilter: selectors.main.activeFilter(state),
    enabledAgendas: selectors.getEnabledAgendas(state),
    disabledAgendas: selectors.getDisabledAgendas(state),
    currentAgendaId: selectors.getCurrentAgendaId(state),
    isViewFiltered: selectors.main.isViewFiltered(state),
});

const mapDispatchToProps = (dispatch) => ({
    openAgendas: () => dispatch(actions.openAgenda()),
    search: (searchText) => dispatch(actions.main.search(searchText)),
    filter: (filterType) => dispatch(actions.main.filter(filterType)),
    selectAgenda: (agendaId) => dispatch(actions.selectAgenda(agendaId)),
    clearSearch: () => dispatch(actions.main.clearSearch()),
    addEvent: () => dispatch(actions.main.lockAndEdit({
        _tempId: TEMP_ID_PREFIX + moment().valueOf(),
        type: ITEM_TYPE.EVENT
    })),
    addPlanning: () => dispatch(actions.main.lockAndEdit({
        _tempId: TEMP_ID_PREFIX + moment().valueOf(),
        type: ITEM_TYPE.PLANNING
    }))
});

export const PlanningSubNav = connect(mapStateToProps, mapDispatchToProps)(PlanningSubNavComponent);
