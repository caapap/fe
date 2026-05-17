import React from 'react';

import { PATHS } from './constants';
import Artifacts from './pages/Artifacts';
import Knowledge from './pages/Knowledge';
import Pipelines from './pages/Pipelines';
import Tests from './pages/Tests';
import './locale';

export default {
  routes: [
    {
      path: PATHS.pipelines,
      component: Pipelines,
      exact: true,
    },
    {
      path: PATHS.artifacts,
      component: Artifacts,
      exact: true,
    },
    {
      path: PATHS.knowledge,
      component: Knowledge,
      exact: true,
    },
    {
      path: PATHS.tests,
      component: Tests,
      exact: true,
    },
  ],
};
