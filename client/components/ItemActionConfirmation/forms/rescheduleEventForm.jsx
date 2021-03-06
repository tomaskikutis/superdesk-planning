import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {get, isEqual, cloneDeep, omit} from 'lodash';
import moment from 'moment';

import * as actions from '../../../actions';
import {validateItem} from '../../../validators';
import {getDateFormat, getTimeFormat} from '../../../selectors/config';
import * as selectors from '../../../selectors';
import {gettext, eventUtils, getDateTimeString, updateFormValues} from '../../../utils';
import {EVENTS, ITEM_TYPE, TIME_COMPARISON_GRANULARITY} from '../../../constants';

import {EventScheduleSummary, EventScheduleInput} from '../../Events';
import {RelatedPlannings} from '../../';
import {Row} from '../../UI/Preview';
import {TextAreaInput, Field} from '../../UI/Form';

import '../style.scss';

export class RescheduleEventComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            diff: null,
            reason: '',
            errors: {},
            multiDayChanged: false,
        };

        this.onReasonChange = this.onReasonChange.bind(this);
        this.onDatesChange = this.onDatesChange.bind(this);
        this.getPopupContainer = this.getPopupContainer.bind(this);

        this.dom = {popupContainer: null};
    }

    componentWillMount() {
        this.setState({diff: {dates: cloneDeep(this.props.initialValues.dates)}});
    }

    onReasonChange(field, reason) {
        this.setState({reason});
    }

    onDatesChange(field, val) {
        const diff = cloneDeep(get(this.state, 'diff') || {});
        const initialValues = this.props.initialValues;

        if (field === 'dates.recurring_rule' && !val) {
            delete diff.dates.recurring_rule;
        } else {
            updateFormValues(diff, field, val);
        }

        const errors = cloneDeep(this.state.errors);
        let errorMessages = [];

        this.props.onValidate(
            omit(diff, 'dates.recurring_rule'), // Omit recurring rules as we reschedule only single instance
            this.props.formProfiles,
            errors,
            errorMessages
        );

        const multiDayChanged = eventUtils.isEventSameDay(initialValues.dates.start, initialValues.dates.end) &&
            !eventUtils.isEventSameDay(diff.dates.start, diff.dates.end);

        this.setState({
            diff,
            errors,
            multiDayChanged,
        });

        if (eventUtils.eventsDatesSame(diff, initialValues, TIME_COMPARISON_GRANULARITY.MINUTE) ||
            (diff.dates.recurring_rule &&
            !diff.dates.recurring_rule.until && !diff.dates.recurring_rule.count) ||
            !isEqual(errorMessages, [])
        ) {
            this.props.disableSaveInModal();
        } else {
            this.props.enableSaveInModal();
        }
    }

    submit() {
        return this.props.onSubmit({
            ...this.props.initialValues,
            ...this.state.diff,
            reason: this.state.reason,
        }, get(this.props, 'modalProps'));
    }

    getPopupContainer() {
        return this.dom.popupContainer;
    }

    render() {
        const {initialValues, dateFormat, timeFormat, formProfiles, submitting} = this.props;
        let reasonLabel = gettext('Reason for rescheduling this event:');
        const numPlannings = get(initialValues, '_plannings.length');
        const afterUntil = moment.isMoment(get(initialValues, 'dates.recurring_rule.until')) &&
            moment.isMoment(get(this.state, 'diff.dates.start')) &&
            this.state.diff.dates.start.isAfter(initialValues.dates.recurring_rule.until);

        return (
            <div className="MetadataView">
                <Row
                    enabled={!!initialValues.slugline}
                    label={gettext('Slugline')}
                    value={initialValues.slugline || ''}
                    noPadding={true}
                    className="slugline"
                />

                <Row
                    label={gettext('Name')}
                    value={initialValues.name || ''}
                    noPadding={true}
                    className="strong"
                />

                <EventScheduleSummary
                    schedule={this.props.initialValues.dates}
                    timeFormat={timeFormat}
                    dateFormat={dateFormat}
                    noPadding={true}
                    forUpdating={true}
                />

                <Row
                    enabled={!!numPlannings}
                    label={gettext('Planning Items')}
                    value={numPlannings}
                    noPadding={true}
                />

                {numPlannings > 0 && (
                    <div>
                        <div className="sd-alert sd-alert--hollow sd-alert--alert sd-alert--flex-direction">
                            <strong>{gettext('This will mark as rescheduled the following planning items')}</strong>
                            <RelatedPlannings
                                plannings={initialValues._plannings}
                                openPlanningItem={false}
                                short={true} />
                        </div>
                    </div>
                )}

                {this.state.multiDayChanged && (
                    <div className="sd-alert sd-alert--hollow sd-alert--alert sd-alert--flex-direction">
                        <strong>{gettext(
                            'Event will be changed to a multi-day event!'
                        )}</strong>
                        <br />
                        {gettext('from {{from}} to {{to}}', {
                            from: getDateTimeString(this.state.diff.dates.start, dateFormat, timeFormat),
                            to: getDateTimeString(this.state.diff.dates.end, dateFormat, timeFormat),
                        })}
                    </div>
                )}

                {afterUntil &&
                <div className="sd-alert sd-alert--hollow sd-alert--orange2 sd-alert--flex-direction">
                    <strong>{gettext(
                        'This Event is scheduled to occur after the end date of its recurring cycle!'
                    )}</strong>
                </div>}

                <Field
                    component={EventScheduleInput}
                    field="dates"
                    item={this.state.diff}
                    diff={this.state.diff}
                    onChange={this.onDatesChange}
                    timeFormat={timeFormat}
                    dateFormat={dateFormat}
                    showRepeat={false}
                    showRepeatToggle={false}
                    showErrors={true}
                    errors={this.state.errors}
                    formProfile={formProfiles.events}
                    popupContainer={this.getPopupContainer}
                    showFirstEventLabel={false}
                />

                <Row label={reasonLabel}>
                    <TextAreaInput
                        value={this.state.reason}
                        onChange={this.onReasonChange}
                        disabled={submitting}
                    />
                </Row>

                <div ref={(node) => this.dom.popupContainer = node} />
            </div>
        );
    }
}

RescheduleEventComponent.propTypes = {
    initialValues: PropTypes.object.isRequired,
    onSubmit: PropTypes.func,
    enableSaveInModal: PropTypes.func,
    disableSaveInModal: PropTypes.func,
    dateFormat: PropTypes.string.isRequired,
    timeFormat: PropTypes.string.isRequired,

    // If `onHide` is defined, then `ModalWithForm` component will call it
    // eslint-disable-next-line react/no-unused-prop-types
    onHide: PropTypes.func,

    onValidate: PropTypes.func,
    formProfiles: PropTypes.object,

    submitting: PropTypes.bool,
    modalProps: PropTypes.object,
};


const mapStateToProps = (state) => ({
    timeFormat: getTimeFormat(state),
    dateFormat: getDateFormat(state),
    formProfiles: selectors.forms.profiles(state),
});

const mapDispatchToProps = (dispatch) => ({
    onSubmit: (event, modalProps) => {
        const promise = dispatch(actions.events.ui.rescheduleEvent(event));

        if (get(modalProps, 'onCloseModal')) {
            promise.then((updatedEvent) => modalProps.onCloseModal(updatedEvent));
        }

        return promise;
    },

    onHide: (event, modalProps) => {
        const promise = event.lock_action === EVENTS.ITEM_ACTIONS.RESCHEDULE_EVENT.lock_action ?
            dispatch(actions.events.api.unlock(event)) :
            Promise.resolve(event);

        if (get(modalProps, 'onCloseModal')) {
            promise.then((updatedEvent) => modalProps.onCloseModal(updatedEvent));
        }

        return promise;
    },

    onValidate: (item, profile, errors, errorMessages) => dispatch(validateItem({
        profileName: ITEM_TYPE.EVENT,
        diff: item,
        formProfiles: profile,
        errors: errors,
        messages: errorMessages,
        fields: ['dates'],
    })),
});

export const RescheduleEventForm = connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(RescheduleEventComponent);
