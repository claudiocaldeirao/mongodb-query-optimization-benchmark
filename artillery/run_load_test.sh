#! bin/bash

artillery run artillery-config-stage-01.yml --record --key $ARTILLERY_CLOUD_API_KEY
artillery run artillery-config-stage-02.yml --record --key $ARTILLERY_CLOUD_API_KEY
artillery run artillery-config-stage-03.yml --record --key $ARTILLERY_CLOUD_API_KEY
artillery run artillery-config-stage-04.yml --record --key $ARTILLERY_CLOUD_API_KEY