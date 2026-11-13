/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import './engine.ts';

export default function App() {
  useEffect(() => {
    window.initHamudiApp?.();
  }, []);

  return <div id="app"></div>;
}
