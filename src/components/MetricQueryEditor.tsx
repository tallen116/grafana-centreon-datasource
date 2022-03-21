import { AsyncSelect, Select, Input } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import React, { useState, useEffect, useCallback } from 'react';
import { defaultQuery } from '../types';
import defaults from 'lodash/defaults';
import { parseInt } from 'lodash';

const PLACEHOLDER_TEXT = 'Choose...';

const selectOptions = [
  { label: 'Test1', value: 1 },
  { label: 'Rest1', value: 2, desription: 'this is a description' },
  {
    label: 'Option with stuff',
    value: 3,
    description: 'very descriptive state',
    imgUrl: 'https://placekitten.com/40/40',
  },
];

export const SelectComponent = props => {
  const query = defaults(props, defaultQuery);
  const { datasource } = query;

  const [value, setValue] = useState<SelectableValue<number>>();

  return (
    <Select
      options={selectOptions}
      value={value}
      onChange={v => {
        setValue(v);
      }}
    />
  );
};

export const HostSelectComponent = props => {
  const query = defaults(props, defaultQuery);
  const { datasource, onRunQuery } = query;

  const [hostValue, setHostValue] = useState({
    label: props.query.host.name,
    value: props.query.host.id,
    description: '',
  });
  const [inputValue, setInputValue] = useState('');

  const loadAsyncHosts = () => {
    console.log('Host Value: ' + inputValue);
    return datasource.getHosts(inputValue || '').then(response => {
      return parseHosts(response);
    });
  };

  const onInputChange = (inputValue, { action }) => {
    if (action === 'input-change') {
      setInputValue(inputValue);
    }
  };

  const onChange = value => {
    setInputValue('');
    setHostValue(value);

    console.log('Host onChange value');
    console.log(value);

    const host = props.query.host;

    props.onChange({
      ...props.query,
      hostId: parseInt(value.value),
      hostSelection: value,
      serviceSelection: null,
      metricSelection: undefined,
      serviceId: null,
      metricId: undefined,
      isPrestine: false,
      host: {
        name: value.label,
        id: parseInt(value.value),
      },
    });
    props.onRunQuery();
  };

  const onRegexChange = value => {
    console.log('host onregex change');
    console.log(value.target.value);

    const host = props.query.host;

    props.onChange({
      ...props.query,
      host: {
        name: value.target.value,
        id: -1,
      },
    });
  };

  // Return basic input if regex is enabled
  if (props.query.host_regex) {
    return <Input value={props.query.host.name || ''} onChange={onRegexChange} placeholder=".*" />;
  } else {
    return (
      <AsyncSelect
        loadOptions={loadAsyncHosts}
        defaultOptions
        value={hostValue}
        onChange={onChange}
        onInputChange={onInputChange}
        inputValue={inputValue}
      />
    );
  }
};

export const ServiceSelectComponent = props => {
  const query = defaults(props, defaultQuery);
  const { datasource, onRunQuery } = query;

  const [serviceValue, setServiceValue] = useState<SelectableValue<string>>();
  const [inputValue, setInputValue] = useState('');

  let listItems: SelectableValue[] = [];

  //Promise<SelectableValue<T>[]>
  const loadAsyncHosts = () => {
    console.log('Service Value: ' + inputValue);
    return datasource.getServiceByHosts(props.query.hostId, inputValue).then(response => {
      return parseServices(response);
    });
  };

  const loadSelectItems = useCallback(() => {
    console.log(props);
    return datasource.getServiceByHosts(props.query.hostId, inputValue).then(response => {
      return parseServices(response);
    });
  }, [props, inputValue, datasource]);

  const onInputChange = (inputValue, { action }) => {
    if (action === 'input-change') {
      setInputValue(inputValue);
    }
  };

  const onChange = value => {
    setInputValue('');
    if (!props.query.serviceSelection) {
      setServiceValue(value);
    }
    props.onChange({
      ...props.query,
      serviceId: parseInt(value.value),
      serviceSelection: value,
      metricSelection: undefined,
      metricId: undefined,
    });
    props.onRunQuery();
  };

  const onChangeCallback = useCallback(
    value => {
      setInputValue('');
      props.onChange({
        ...props.query,
        serviceId: parseInt(value.value),
        serviceSelection: value,
        metricSelection: undefined,
        metricId: undefined,
        service: {
          name: value.label,
          id: parseInt(value.value),
        },
      });
      props.onRunQuery();
    },
    [props]
  );

  useEffect(() => {
    // Setting default value to null doesn't work.  Set to SelectableValue with placeholder string
    setServiceValue(props.query.serviceSelection ? props.query.serviceSelection : { label: PLACEHOLDER_TEXT });
  }, [props.query.serviceSelection]);

  const onRegexChange = value => {
    console.log('service onregex change');
    console.log(value.target.value);

    const service = props.query.service;

    props.onChange({
      ...props.query,
      service: {
        name: value.target.value,
        id: -1,
      },
    });
  };

  if (props.query.service_regex) {
    return <Input value={props.query.service.name || ''} onChange={onRegexChange} placeholder=".*" />;
  } else {
    return (
      // key value is a hack workaround to reloading options
      <AsyncSelect
        key={JSON.stringify(props.query.hostSelection)}
        loadOptions={loadSelectItems}
        defaultOptions
        isMulti={false}
        filterOption={() => true}
        value={serviceValue || null}
        onChange={onChangeCallback}
        onInputChange={onInputChange}
        inputValue={inputValue}
        placeholder={PLACEHOLDER_TEXT}
      />
    );
  }
};

export const MetricSelectComponent = props => {
  const query = defaults(props, defaultQuery);
  const { datasource, onRunQuery } = query;

  const [value, setValue] = useState<SelectableValue<string>>();
  const [inputValue, setInputValue] = useState('');

  //Promise<SelectableValue<T>[]>
  const loadAsyncHosts = () => {
    console.log('Metric Input: ' + inputValue);
    return datasource.getMetrics(props.query.hostId, props.query.serviceId).then(response => {
      return parseMetrics(response);
    });
  };

  const onInputChange = (inputValue, { action }) => {
    if (action === 'input-change') {
      setInputValue(inputValue);
    }
  };

  const onChange = value => {
    setInputValue('');
    setValue(value);
    props.onChange({
      ...props.query,
      metricId: parseInt(value.value),
      metricSelection: value,
      metric: {
        name: value.label,
        id: parseInt(value.value),
      },
    });
    props.onRunQuery();
  };

  const onChangeCallback = useCallback(
    value => {
      setInputValue('');
      props.onChange({
        ...props.query,
        metricSelection: value,
        metricId: parseInt(value.value),
      });
      props.onRunQuery();
    },
    [props]
  );

  useEffect(() => {
    // Setting default value to null doesn't work.  Set to SelectableValue with placeholder string
    setValue(props.query.metricSelection ? props.query.metricSelection : { label: PLACEHOLDER_TEXT });
  }, [props.query.metricSelection]);

  const onRegexChange = value => {
    console.log('metric onregex change');
    console.log(value.target.value);

    const metric = props.query.metric;

    props.onChange({
      ...props.query,
      metric: {
        name: value.target.value,
        id: -1,
      },
    });
  };

  if (props.query.metric_regex) {
    return <Input value={props.query.metric.name || ''} onChange={onRegexChange} placeholder=".*" />;
  } else {
    return (
      // key value is a hack workaround to reloading options
      <AsyncSelect
        key={JSON.stringify(props.query.serviceSelection)}
        loadOptions={loadAsyncHosts}
        defaultOptions
        value={value}
        onChange={onChangeCallback}
        onInputChange={onInputChange}
        inputValue={inputValue}
      />
    );
  }
};

function parseHosts(payload: object): Array<SelectableValue<string>> {
  let hostList: Array<SelectableValue<string>> = [];
  const hostCount = payload.data.result.length;
  console.log('Host Count: ' + hostCount);

  // Build array of SelectableValues
  for (let i = 0; i < hostCount; i++) {
    hostList.push({
      label: payload.data.result[i].name,
      value: payload.data.result[i].id,
      description: payload.data.result[i].alias,
    });
  }
  console.log(hostList);
  return hostList;
}

function parseServices(payload: object): Array<SelectableValue<string>> {
  let serviceList: Array<SelectableValue<string>> = [];
  const serviceCount = payload.data.result.length;
  console.log('Service Count: ' + serviceCount);

  // Build array of SelectableValues
  for (let i = 0; i < serviceCount; i++) {
    serviceList.push({
      label: payload.data.result[i].description,
      value: payload.data.result[i].id,
      description: payload.data.result[i].display_name,
    });
  }
  console.log(serviceList);
  return serviceList;
}

function parseMetrics(payload: object): Array<SelectableValue<string>> {
  let list: Array<SelectableValue<string>> = [];
  const count = payload.data.metrics.length;
  console.log('Service Count: ' + count);

  // Build array of SelectableValues
  for (let i = 0; i < count; i++) {
    list.push({
      label: payload.data.metrics[i].metric,
      value: payload.data.metrics[i].metric_id,
      description: payload.data.metrics[i].legend,
    });
  }
  console.log(list);
  return list;
}
