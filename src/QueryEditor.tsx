import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms, InlineField, Input, Select, InlineFieldRow, InlineSwitch } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';
import { parseInt } from 'lodash';
import { HostSelectComponent, ServiceSelectComponent, MetricSelectComponent } from './components/MetricQueryEditor';
import * as c from './constants';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

const queryTypeOptions = [
  { value: c.MODE_METRIC, label: 'Metric' },
  { value: c.MODE_ID, label: 'Select Id' },
];

const groupTypeOptions = [
  { value: c.CENTREON_GROUP_HOST, label: 'Group' },
  { value: c.CENTREON_GROUP_SERVICE, label: 'Host' },
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

  onHostRegexChange = (event: ChangeEvent<HTMLInputElement>) => {
    //console.log(event);
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, host_regex: event.target.checked });
    onRunQuery();
  };

  onServiceRegexChange = (event: ChangeEvent<HTMLInputElement>) => {
    //console.log(event);
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, service_regex: event.target.checked });
    onRunQuery();
  };

  onMetricRegexChange = (event: ChangeEvent<HTMLInputElement>) => {
    //console.log(event);
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, metric_regex: event.target.checked });
    onRunQuery();
  };

  // https://developers.grafana.com/ui/latest/index.html?path=/docs/forms-select--basic-select-async
  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { hostId, serviceId, metricId, datasource, queryType, host_regex, service_regex, metric_regex } = query;

    return (
      <div>
        <InlineFieldRow>
          <InlineField label="Query Type">
            <Select options={queryTypeOptions} value={queryType} onChange={this.onQueryTypeChange} />
          </InlineField>
        </InlineFieldRow>
        {this.props.query.queryType === c.MODE_ID && (
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
        {this.props.query.queryType === c.MODE_METRIC && (
          <InlineFieldRow style={{ width: '100%' }}>
            <InlineField label="Host" grow>
              <HostSelectComponent {...this.props} />
            </InlineField>
            <InlineField>
              <InlineField label="Regex">
                <InlineSwitch value={host_regex} onChange={this.onHostRegexChange} />
              </InlineField>
            </InlineField>
          </InlineFieldRow>
        )}
        {this.props.query.queryType === c.MODE_METRIC && this.props.query.hostId && (
          <InlineFieldRow>
            <InlineField label="Service" grow>
              <ServiceSelectComponent {...this.props} />
            </InlineField>
            <InlineField>
              <InlineField label="Regex">
                <InlineSwitch value={service_regex} onChange={this.onServiceRegexChange} />
              </InlineField>
            </InlineField>
          </InlineFieldRow>
        )}
        {this.props.query.queryType === c.MODE_METRIC && this.props.query.serviceId && (
          <InlineFieldRow>
            <InlineField label="Metric" grow>
              <MetricSelectComponent {...this.props} />
            </InlineField>
            <InlineField>
              <InlineField label="Regex">
                <InlineSwitch value={metric_regex} onChange={this.onMetricRegexChange} />
              </InlineField>
            </InlineField>
          </InlineFieldRow>
        )}
      </div>
    );
  }
}
