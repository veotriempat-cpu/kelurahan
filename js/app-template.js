import { sharedTemplate } from './components/shared.js';
import { authTemplate } from './layouts/auth.js';
import { loggedTemplate } from './layouts/app-layout.js';

export const template = `
<div id="app-inner">
    ${sharedTemplate}
    ${authTemplate}
    ${loggedTemplate}
</div>`;
