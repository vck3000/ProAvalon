import React, { useEffect, useState } from 'react';
import Carousel from 'react-multi-carousel';
import Swal from 'sweetalert2';

import { S3AvatarSet } from '../../../clients/s3/S3Agent';
import { AllUserAvatars } from '../../../routes/profile';
import { BaseAvatarLinks } from '../constants';

const responsive = {
  avatar3: {
    breakpoint: { max: 3000, min: 1098 },
    items: 3,
  },
  avatar2: {
    breakpoint: { max: 1098, min: 732 },
    items: 2,
  },
  avatar1: {
    breakpoint: { max: 732, min: 464 },
    items: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

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
    require('react-multi-carousel/lib/styles.css');
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
    // TODO-kev: Consider a better way to do this?
    setInputUsername(null);
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
      {/*Below is a temporary grid view, to be removed before merge*/}
      {targetUserOtherApprovedAvatars ? (
        <div>
          <h3>
            <u>{targetUsername}'s other approved avatars:</u>
          </h3>
          <div className="grid-container">
            {targetUserOtherApprovedAvatars.map((avatarSet) => (
              <div
                key={avatarSet.avatarSetId}
                className={`avatarSet grid-item ${
                  selectedOtherAvatarSet === avatarSet ? 'selected' : ''
                }`}
                onClick={() => handleClickOnOtherAvatar(avatarSet)}
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
        </div>
      ) : null}

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
              <Carousel
                responsive={responsive}
                containerClass="carousel-container"
                showDots={true}
                keyBoardControl={true}
                removeArrowOnDeviceType={['mobile']}
              >
                {targetUserAvatarLibrary.map((avatarSet) => (
                  <div
                    key={avatarSet.avatarSetId}
                    className={`avatarSet ${
                      selectedAvatarLibrarySet === avatarSet ? 'selected' : ''
                    }`}
                    onClick={() => handleClickOnAvatarInLibrary(avatarSet)}
                  >
                    <h3 className="avatarTitle">
                      Avatar {avatarSet.avatarSetId}
                    </h3>
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
              </Carousel>
            </div>
          ) : null}

          {targetUserOtherApprovedAvatars ? (
            <div>
              <h3>
                <u>{targetUsername}'s other approved avatars:</u>
              </h3>

              <Carousel
                responsive={responsive}
                containerClass="carousel-container"
                showDots={true}
                keyBoardControl={true}
                removeArrowOnDeviceType={['mobile']}
              >
                {targetUserOtherApprovedAvatars.map((avatarSet) => (
                  <div
                    key={avatarSet.avatarSetId}
                    className={`avatarSet ${
                      selectedOtherAvatarSet === avatarSet ? 'selected' : ''
                    }`}
                    onClick={() => handleClickOnOtherAvatar(avatarSet)}
                  >
                    <h3 className="avatarTitle">
                      Avatar {avatarSet.avatarSetId}
                    </h3>
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
              </Carousel>

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
