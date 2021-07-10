import React, { Fragment } from 'react';
import { hydrate } from 'react-dom';

import Techradar from '../../lib/Techradar';

const Demo = () => (
  <Fragment>
    <Techradar />
  </Fragment>
)

hydrate(<Demo />, document.getElementById('root'));
