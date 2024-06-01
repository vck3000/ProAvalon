import React, { useEffect, useState } from 'react';
import { S3AvatarSet } from '../../../../clients/s3/S3Agent';

interface AvatarLibraryProps {
  avatarLibrary: S3AvatarSet[] | null;
  selectedAvatarSet: S3AvatarSet | null;
  handleClickOnAvatar: (avatarSet: S3AvatarSet) => void;
}

export function AvatarLibraryGridView({
  avatarLibrary,
  selectedAvatarSet,
  handleClickOnAvatar,
}: AvatarLibraryProps) {
  useEffect(() => {
    require('./styles.css');
  }, []);

  return (
    <div className="grid-container">
      {avatarLibrary.map((avatarSet) => (
        <div
          key={avatarSet.avatarSetId}
          className={`avatarSet grid-item ${
            selectedAvatarSet === avatarSet ? 'selected' : ''
          }`}
          onClick={() => handleClickOnAvatar(avatarSet)}
        >
          <h3 className="avatarTitle">Avatar {avatarSet.avatarSetId}</h3>
          <img
            src={avatarSet.resLink}
            alt={`Resistance avatar ${avatarSet.avatarSetId}`}
            className="avatarImg"
            draggable={false}
          />
          <img
            src={avatarSet.spyLink}
            alt={`Spy avatar ${avatarSet.avatarSetId}`}
            className="avatarImg"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
