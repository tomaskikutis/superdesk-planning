import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Row, DateInput, TimeInput, Field} from '..';
import './style.scss';
import Button from '../../Button';
import {gettext} from '../../../../utils';

export const DateTimeInput = ({
    field,
    label,
    value,
    onChange,
    required,
    invalid,
    timeFormat,
    dateFormat,
    readOnly,
    canClear,
    item,
    diff,
    errors,
    showErrors,
    ...props
}) => (
    <Row flex={true} noPadding={!!invalid} className={{
        'date-time-input__row': true,
        'date-time-input__row--required': required,
        'date-time-input__row--invalid': invalid,
    }}>
        <Field
            row={false}
            component={DateInput}
            field={`${field}.date`}
            value={value}
            item={item}
            diff={diff}
            readOnly={readOnly}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
            noMargin={!invalid}
            dateFormat={dateFormat}
            label={label}
            required={required}
        />

        <Field
            row={false}
            component={TimeInput}
            field={`${field}.time`}
            value={value}
            item={item}
            diff={diff}
            readOnly={readOnly}
            onChange={onChange}
            errors={errors}
            showErrors={showErrors}
            noMargin={!invalid}
            timeFormat={timeFormat}
        />
        {canClear && <Button
            onClick={() => onChange(field, null)}
            icon="icon-close-small"
            size="small"
            iconOnly={true}
            title={gettext('Clear date and time')}
            className="btn--icon-only-circle"
        />}
    </Row>
);

DateTimeInput.propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(moment),
    ]),
    onChange: PropTypes.func.isRequired,
    timeFormat: PropTypes.string.isRequired,
    dateFormat: PropTypes.string.isRequired,

    hint: PropTypes.string,
    required: PropTypes.bool,
    invalid: PropTypes.bool,
    readOnly: PropTypes.bool,
    boxed: PropTypes.bool,
    noMargin: PropTypes.bool,
    canClear: PropTypes.bool,

    item: PropTypes.object,
    diff: PropTypes.object,
    errors: PropTypes.object,
    showErrors: PropTypes.bool,
};

DateTimeInput.defaultProps = {
    required: false,
    invalid: false,
    readOnly: false,
    boxed: false,
    noMargin: false,
    canClear: false,
    showErrors: false,
};