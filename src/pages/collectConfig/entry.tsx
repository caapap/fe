import React from 'react';
import List from './pages/List';
import Add from './pages/Add';
import Edit from './pages/Edit';
import { NS } from './constants';
import './locale';

export default {
  routes: [
    {
      path: '/collect-configs',
      component: List,
      exact: true,
    },
    {
      path: '/collect-configs/add',
      component: Add,
      exact: true,
    },
    {
      path: '/collect-configs/edit/:id',
      component: Edit,
      exact: true,
    },
  ],
};

export { NS };
