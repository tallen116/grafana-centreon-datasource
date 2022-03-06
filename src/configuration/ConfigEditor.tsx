import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions, MySecureJsonData> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      httpUrl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onApiVersionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      apiVersion: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      apiUsername: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onApiPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        apiPassword: event.target.value,
      },
    });
  };

  onResetAPIPassword = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        apiPassword: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        apiPassword: '',
      },
    });
  };

  onResolutionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      resolution: parseFloat(event.target.value),
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="URL"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onUrlChange}
            value={jsonData.httpUrl || ''}
            placeholder="URL of Centreon central server"
          />
        </div>

        <div className="gf-form">
          <FormField
            label="API version"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onApiVersionChange}
            value={jsonData.apiVersion || ''}
            placeholder="URL of Centreon API endpoint"
          />
        </div>

        <div className="gf-form">
          <FormField
            label="API Username"
            labelWidth={6}
            inputWidth={20}
            onChange={this.onUsernameChange}
            value={jsonData.apiUsername || ''}
            placeholder="Username of Centreon API"
          />
        </div>

        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.apiPassword) as boolean}
              value={secureJsonData.apiPassword || ''}
              label="API Password"
              placeholder="Password of Centreon API"
              labelWidth={6}
              inputWidth={20}
              onReset={this.onResetAPIPassword}
              onChange={this.onApiPasswordChange}
            />
          </div>
        </div>
      </div>
    );
  }
}
