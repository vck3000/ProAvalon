import React from 'react';
import { hydrate } from 'react-dom';
import AvatarLibrary from './index';

hydrate(<AvatarLibrary />, document.getElementById('avatarLibraryDiv'));
