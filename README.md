# grafana-centreon-datasource

[![CI](https://github.com/tallen116/grafana-centreon-datasource/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/tallen116/grafana-centreon-datasource/actions/workflows/ci.yaml)

Centreon datasource plugin for Grafana

## Requirements

- Centreon server with APIv2 access
- Centreon user with API access (preferably readonly to all hosts)
- Grafana server

## Installation

TODO

## Getting started

1. Configure Centreon data source
2. Build dashboard using the datasource plugin

## Contributing

- Found a bug or request a new feature?  Open a Github issue
- Please open an issue prior to submitting a pull request for discussion

## Compiling

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

## Testing

Setup Grafana docker image

```
git clone git@github.com:tallen116/grafana-centreon-datasource.git

cd grafana-centreon-datasource

yarn install

yarn build

docker run -d -p 3000:3000 -v "$(cd ..; pwd)/grafana-centreon-datasource:/var/lib/grafana/plugins/grafana-centreon-datasource" --name=grafana-dev --env GF_DEFAULT_APP_MODE=development grafana/grafana:latest
```

## Learn more

- [Build a data source plugin tutorial](https://grafana.com/tutorials/build-a-data-source-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System
