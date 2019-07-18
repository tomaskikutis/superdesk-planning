/* eslint-disable react/no-multi-comp */

import {IFormGroup, IBaseRestApiResponse, IGenericListPageComponent} from 'superdesk-api';
import {superdeskApi} from '../../superdeskApi';

import React from 'react';
import PropTypes from 'prop-types';
import {Modal} from '../../components/Modal/index';

interface IProps {
    handleHide(): void;
}

interface IEventTemplate extends IBaseRestApiResponse {
    template_name: string;
}

export class ManageEventTemplatesModal extends React.PureComponent<IProps> {
    static propTypes:  any;

    render() {
        const {handleHide} = this.props;

        const {getGenericListPageComponent, ListItemColumn, ListItem} = superdeskApi.components;
        const {getFormFieldPreviewComponent, FormFieldType} = superdeskApi.forms;

        const EventTemplatesComponent = getGenericListPageComponent<IEventTemplate>('events_template');

        const {gettext} = superdeskApi.localization;

        const nameField = {
            label: gettext('Template name'),
            type: FormFieldType.textSingleLine,
            field: 'template_name',
            required: true,
        };

        const formConfig: IFormGroup = {
            direction: 'vertical',
            type: 'inline',
            form: [
                nameField,
            ],
        };

        const renderRow = (
            key: string,
            item: IEventTemplate,
            page: IGenericListPageComponent<IEventTemplate>
        ) => (
            <ListItem
                key={key}
            >
                <ListItemColumn ellipsisAndGrow noBorder>
                    {getFormFieldPreviewComponent(item, nameField)}
                </ListItemColumn>
                <ListItemColumn noBorder>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <button onClick={() => page.startEditing(item._id)}>
                            <i className="icon-pencil" />
                        </button>
                        <button onClick={() => page.deleteItem(item)}>
                            <i className="icon-trash" />
                        </button>
                    </div>
                </ListItemColumn>
            </ListItem>
        );

        return (
            <Modal xLarge={true} show={true} onHide={handleHide}>
                <Modal.Header>
                    <a className="close" onClick={handleHide}>
                        <i className="icon-close-small" />
                    </a>
                    <h3 className="modal__heading">{gettext('Manage Event Templates')}</h3>
                </Modal.Header>
                <Modal.Body noPadding={true}>
                    <EventTemplatesComponent
                        renderRow={renderRow}
                        formConfig={formConfig}
                        defaultSortOption={{field: nameField.field, direction: 'ascending'}}
                        fieldForSearch={nameField}
                        disallowCreatingNewItem
                        disallowFiltering
                    />
                </Modal.Body>
            </Modal>
        );
    }
}

ManageEventTemplatesModal.propTypes = {
    handleHide: PropTypes.func,
};
