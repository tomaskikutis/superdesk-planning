import React from 'react';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import {gettext} from '../../utils';
import {SlideInPanel, Form} from '../UI';
import {Toggle} from '../index';

export class EditAgenda extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pristine: true,
            submitting: true,
            agendaEnabled: true,
            agendaName: '',
        };
    }

    componentWillMount() {
        const {agenda} = this.props;

        if (agenda) {
            this.setState({
                agendaEnabled: agenda.is_enabled,
                agendaName: agenda.name,
            });
        }
    }

    isPristine(newName, newEnabled) {
        if (!this.props.agenda)
            return !(this.state.agendaName || newName);

        return get(this.props, 'agenda.name') === newName &&
            get(this.props, 'agenda.is_enabled') === newEnabled;
    }

    onNameChange(event) {
        const newName = get(event, 'target.value');

        this.setState({
            pristine: this.isPristine(newName, this.state.agendaEnabled),
            agendaName: newName,
        });
    }

    onEnableChange(event) {
        const newEnabled = get(event, 'target.value');

        this.setState({
            pristine: this.isPristine(this.state.agendaName, newEnabled),
            agendaEnabled: newEnabled,
        });
    }

    onSave() {
        if (this.state.agendaName) {
            const agenda = {
                name: this.state.agendaName,
                is_enabled: this.state.agendaEnabled,
            };

            this.props.onSave({
                ...this.props.agenda,
                ...agenda,
            });

            // Close editor after save
            this.props.onClose();
        }
    }

    render() {
        let tools = [<a className="btn" key={1} onClick={this.props.onClose}>Cancel</a>];

        if (!this.state.pristine && this.state.agendaName) {
            tools.push(<a className="btn btn--primary" key={2}
                onClick={this.onSave.bind(this)}>Save</a>);
        }

        return (<SlideInPanel.Panel>
            <SlideInPanel.Header
                tools={tools} />
            <SlideInPanel.Content>
                <Form.Row label={gettext('Name')}
                    value={this.state.agendaName}
                    onChange={this.onNameChange.bind(this)} />
                <Form.Row label={gettext('Enabled')}
                    showValue={false}>
                    <Toggle value={this.state.agendaEnabled}
                        onChange={this.onEnableChange.bind(this)} />
                </Form.Row>
            </SlideInPanel.Content>
        </SlideInPanel.Panel>);
    }
}

EditAgenda.propTypes = {
    agenda: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
};
