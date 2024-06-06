import React from 'react';
import { hydrate } from 'react-dom';
import AvatarLookup from './index';

hydrate(<AvatarLookup />, document.getElementById('avatarLibraryDiv'));
