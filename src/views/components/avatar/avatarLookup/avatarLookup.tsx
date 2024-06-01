import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import { S3AvatarSet } from '../../../../clients/s3/S3Agent';
import { AllUserAvatars } from '../../../../routes/profile';
import { BaseAvatarLinks } from '../../constants';
import { AvatarLibraryGridView } from '../common/avatarLibraryGridView';

const getLinks = {
  approvedAvatars: (username: string) =>
    `/profile/mod/approvedavatars?username=${username}`,
  updateUserAvatarLibrary: '/profile/mod/updateuseravatarlibrary',
};

export function AvatarLookup() {
  const [inputUsername, setInputUsername] = useState<string>('');

  const [targetUsername, setTargetUsername] = useState<string | null>(null);
  const [targetUserResAvatar, setTargetUserResAvatar] = useState<string | null>(
    null,
  );
  const [targetUserSpyAvatar, setTargetUserSpyAvatar] = useState<string | null>(
    null,
  );
  const [targetUserAvatarLibrary, setTargetUserAvatarLibrary] = useState<
    S3AvatarSet[] | null
  >(null);
  const [targetUserOtherApprovedAvatars, setTargetUserOtherApprovedAvatars] =
    useState<S3AvatarSet[] | null>(null);

  const [selectedAvatarLibrarySet, setSelectedAvatarLibrarySet] =
    useState<S3AvatarSet | null>(null);
  const [selectedOtherAvatarSet, setSelectedOtherAvatarSet] =
    useState<S3AvatarSet | null>(null);

  useEffect(() => {
    require('./styles.css');
  }, []);

  const handleGetAvatars = async () => {
    if (!inputUsername) {
      Swal.fire({
        title: 'Please enter a username.',
        icon: 'warning',
      });
      return;
    }

    const response = await fetch(getLinks.approvedAvatars(inputUsername));

    if (response.status === 200) {
      const data: AllUserAvatars = await response.json();
      setTargetUsername(inputUsername);
      setTargetUserResAvatar(
        data.currentResLink ? data.currentResLink : BaseAvatarLinks.baseRes,
      );
      setTargetUserSpyAvatar(
        data.currentSpyLink ? data.currentSpyLink : BaseAvatarLinks.baseSpy,
      );
      setTargetUserAvatarLibrary(data.allApprovedAvatars.avatarLibrary);
      setTargetUserOtherApprovedAvatars(
        data.allApprovedAvatars.approvedAvatarsNotInLibrary,
      );
    } else {
      Swal.fire({ title: await response.text(), icon: 'error' });
    }
  };

  const handleSwapAvatar = () => {
    Swal.fire({
      title: 'Sending request',
      didOpen: async () => {
        Swal.showLoading();
        const response = await fetch(getLinks.updateUserAvatarLibrary, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: targetUsername,
            toBeAddedAvatarId: selectedOtherAvatarSet.avatarSetId,
            toBeRemovedAvatarId: selectedAvatarLibrarySet.avatarSetId,
          }),
        });

        if (response.status === 200) {
          await handleGetAvatars();
          Swal.close();
          Swal.fire({ title: await response.text(), icon: 'success' });
        } else {
          Swal.close();
          Swal.fire({ title: await response.text(), icon: 'error' });
        }
      },
    });
  };

  const handleClickOnAvatarInLibrary = (avatarSet: S3AvatarSet) => {
    selectedAvatarLibrarySet === avatarSet
      ? setSelectedAvatarLibrarySet(null)
      : setSelectedAvatarLibrarySet(avatarSet);
  };

  const handleClickOnOtherAvatar = (avatarSet: S3AvatarSet) => {
    selectedOtherAvatarSet === avatarSet
      ? setSelectedOtherAvatarSet(null)
      : setSelectedOtherAvatarSet(avatarSet);
  };

  const handleClearUser = () => {
    setInputUsername('');
    setTargetUsername(null);
    setTargetUserResAvatar(null);
    setTargetUserSpyAvatar(null);
    setTargetUserAvatarLibrary(null);
    setTargetUserOtherApprovedAvatars(null);

    setSelectedAvatarLibrarySet(null);
    setSelectedOtherAvatarSet(null);
  };

  return (
    <div>
      <h1>
        <u>User's Avatars:</u>
      </h1>
      <br />
      <div id="approvedAvatarsForUser" className="scrollableWindow alignCenter">
        <p>Here you can see all the approved avatars for a user.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', width: '333px' }}>
        <input
          type="text"
          name="username"
          className="form-control"
          id="getUserAvatarsInput"
          placeholder="Enter username"
          style={{ marginRight: '10px' }}
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              await handleGetAvatars();
            }
          }}
        />
        <button
          className="btn btn-warning"
          id="getUserAvatarsButton"
          onClick={handleGetAvatars}
        >
          Get Avatars
        </button>

        {targetUsername ? (
          <button
            className="btn btn-danger"
            id="getUserAvatarsButton"
            style={{ marginLeft: '5px' }}
            onClick={handleClearUser}
          >
            Clear
          </button>
        ) : null}
      </div>

      {targetUsername ? (
        <div>
          <h3>
            <u>{targetUsername}'s current avatar:</u>
          </h3>
          <br />
          <div className="avatarSet" id="currentAvatarSetDiv">
            <img
              alt="Current Resistance Avatar"
              className="avatarImg"
              src={targetUserResAvatar}
            />
            <img
              alt="Current Spy Avatar"
              className="avatarImg"
              src={targetUserSpyAvatar}
            />
          </div>

          {targetUserAvatarLibrary ? (
            <div>
              <h3>
                <u>{targetUsername}'s avatar library:</u>
              </h3>
              <AvatarLibraryGridView
                avatarLibrary={targetUserAvatarLibrary}
                selectedAvatarSet={selectedAvatarLibrarySet}
                handleClickOnAvatar={handleClickOnAvatarInLibrary}
              />
            </div>
          ) : null}

          {targetUserOtherApprovedAvatars ? (
            <div>
              <h3>
                <u>{targetUsername}'s other approved avatars:</u>
              </h3>

              <AvatarLibraryGridView
                avatarLibrary={targetUserOtherApprovedAvatars}
                selectedAvatarSet={selectedOtherAvatarSet}
                handleClickOnAvatar={handleClickOnOtherAvatar}
              />

              <button
                className={'btn btn-info'}
                onClick={handleSwapAvatar}
                disabled={!selectedOtherAvatarSet || !selectedAvatarLibrarySet}
              >
                Swap Avatars
              </button>

              {selectedOtherAvatarSet && selectedAvatarLibrarySet ? (
                <h4 className="button-label">
                  Add{' '}
                  <strong>Avatar {selectedOtherAvatarSet.avatarSetId}</strong>{' '}
                  and remove{' '}
                  <strong>Avatar {selectedAvatarLibrarySet.avatarSetId}</strong>{' '}
                  from the avatar library
                </h4>
              ) : (
                <h4 className="button-label">
                  Select an avatar from the avatar library and the other
                  approved avatars.
                </h4>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
