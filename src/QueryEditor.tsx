import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent, useState } from 'react';
import { LegacyForms, Field, InlineField, Input, AsyncSelect, Select, InlineFieldRow } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';
import { parseInt } from 'lodash';
import {
  SelectComponent,
  HostSelectComponent,
  ServiceSelectComponent,
  MetricSelectComponent,
} from './components/MetricQueryEditor';
import { SelectValue } from '@grafana/ui/components/Select/types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

const queryTypeOptions = [
  { value: 'metric', label: 'Metric' },
  { value: 'select_id', label: 'Select Id' },
];

export class QueryEditor extends PureComponent<Props> {
  onQueryTypeChange = (event: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    console.log('Props queryType: ' + query.queryType);
    console.log('Query Type: ' + JSON.stringify(event));
    onChange({ ...query, queryType: event.value });
    onRunQuery();
  };

  onHostIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, hostId: parseInt(event.target.value) });
    // executes the query
    onRunQuery();
  };

  onServiceIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, serviceId: parseInt(event.target.value) });
    // executes the query
    onRunQuery();
  };

  onMetricIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, metricId: parseInt(event.target.value) });
    // executes the query
    onRunQuery();
  };

  // https://developers.grafana.com/ui/latest/index.html?path=/docs/forms-select--basic-select-async
  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { hostId, serviceId, metricId, datasource, queryType } = query;

    return (
      <div>
        <InlineFieldRow>
          <InlineField label="Query Type">
            <Select options={queryTypeOptions} value={queryType} onChange={this.onQueryTypeChange} />
          </InlineField>
        </InlineFieldRow>
        {this.props.query.queryType === 'select_id' && (
          <InlineFieldRow style={{ width: '100%' }}>
            <InlineField label="Host ID">
              <Input value={hostId} onChange={this.onHostIdChange} label="Host ID" type="number" step="1" />
            </InlineField>
            <FormField
              width={4}
              value={serviceId}
              onChange={this.onServiceIdChange}
              label="Service ID"
              type="number"
              step="1"
            />
            <FormField
              width={4}
              value={metricId}
              onChange={this.onMetricIdChange}
              label="Metric ID"
              type="number"
              step="1"
            />
          </InlineFieldRow>
        )}
        {this.props.query.queryType === 'metric' && (
          <InlineFieldRow style={{ width: '100%' }}>
            <InlineField label="Host" grow>
              <HostSelectComponent {...this.props} />
            </InlineField>
          </InlineFieldRow>
        )}
        {this.props.query.queryType === 'metric' && this.props.query.hostId && (
          <InlineFieldRow>
            <InlineField label="Service" grow>
              <ServiceSelectComponent {...this.props} />
            </InlineField>
          </InlineFieldRow>
        )}
        {this.props.query.queryType === 'metric' && this.props.query.serviceId && (
          <InlineFieldRow>
            <InlineField label="Metric" grow>
              <MetricSelectComponent {...this.props} />
            </InlineField>
          </InlineFieldRow>
        )}
      </div>
    );
  }
}
