import React, { useEffect, useState } from 'react';
import { S3AvatarSet } from '../../../clients/s3/S3Agent';
import Swal from 'sweetalert2';
import Carousel from 'react-multi-carousel';
import { AllUserAvatars } from '../../../routes/profile';

const BASE_RES_AVATAR = '/avatars/base-res.svg';
const BASE_SPY_AVATAR = '/avatars/base-spy.svg';

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 2,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

export function AvatarLibrary() {
  const [inputUsername, setInputUsername] = useState<string | null>(null);

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

  const [selectedAvatarLibraryId, setSelectedAvatarLibraryId] = useState<
    number | null
  >(null);
  const [selectedOtherAvatarId, setSelectedOtherAvatarId] = useState<
    number | null
  >(null);
  const [lastSelectedAvatarId, setLastSelectedAvatarId] = useState<
    number | null
  >(null);
  const [lastSelectedAvatarResLink, setLastSelectedAvatarResLink] = useState<
    string | null
  >(null);
  const [lastSelectedAvatarSpyLink, setLastSelectedAvatarSpyLink] = useState<
    string | null
  >(null);

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

    const response = await fetch(
      `/profile/mod/approvedavatars?username=${inputUsername}`,
    );

    if (response.status === 200) {
      const data: AllUserAvatars = await response.json();
      setTargetUsername(inputUsername);
      setTargetUserResAvatar(
        data.currentResLink ? data.currentResLink : BASE_RES_AVATAR,
      );
      setTargetUserSpyAvatar(
        data.currentSpyLink ? data.currentSpyLink : BASE_SPY_AVATAR,
      );
      setTargetUserAvatarLibrary(data.avatarLibrary);
      setTargetUserOtherApprovedAvatars(data.approvedAvatarsNotInLibrary);
    } else {
      Swal.fire({ title: await response.text(), icon: 'error' });
    }
  };

  const handleSetAvatar = () => {
    Swal.fire({
      title: 'Sending request',
      didOpen: async () => {
        Swal.showLoading();
        const response = await fetch('/profile/mod/setavatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: targetUsername,
            resLink: lastSelectedAvatarResLink,
            spyLink: lastSelectedAvatarSpyLink,
          }),
        });

        if (response.status === 200) {
          setTargetUserResAvatar(lastSelectedAvatarResLink);
          setTargetUserSpyAvatar(lastSelectedAvatarSpyLink);
          Swal.close();
          Swal.fire({ title: await response.text(), icon: 'success' });
        } else {
          Swal.close();
          Swal.fire({ title: await response.text(), icon: 'error' });
        }
      },
    });
  };

  const handleSwapAvatar = () => {
    Swal.fire({
      title: 'Sending request',
      didOpen: async () => {
        Swal.showLoading();
        const response = await fetch('/profile/mod/updateuseravatarlibrary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: targetUsername,
            toBeAddedAvatarId: selectedOtherAvatarId,
            toBeRemovedAvatarId: selectedAvatarLibraryId,
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
    selectAvatar(avatarSet);
    setSelectedAvatarLibraryId(avatarSet.avatarSetId);
  };

  const handleClickOnOtherAvatar = (avatarSet: S3AvatarSet) => {
    selectAvatar(avatarSet);
    setSelectedOtherAvatarId(avatarSet.avatarSetId);
  };

  const handleClearUser = () => {
    // TODO-kev: Consider a better way to do this?
    setTargetUsername(null);
    setTargetUserResAvatar(null);
    setTargetUserSpyAvatar(null);
    setTargetUserAvatarLibrary(null);
    setTargetUserOtherApprovedAvatars(null);

    setSelectedAvatarLibraryId(null);
    setSelectedOtherAvatarId(null);
    setLastSelectedAvatarId(null);
    setLastSelectedAvatarResLink(null);
    setLastSelectedAvatarSpyLink(null);

    setInputUsername('');
  };

  const selectAvatar = (avatarSet: S3AvatarSet) => {
    setLastSelectedAvatarId(avatarSet.avatarSetId);
    setLastSelectedAvatarResLink(avatarSet.resLink);
    setLastSelectedAvatarSpyLink(avatarSet.spyLink);
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
              <Carousel
                responsive={responsive}
                containerClass="carousel-container"
                showDots={true}
                keyBoardControl={true}
                removeArrowOnDeviceType={['mobile']}
                centerMode={true}
              >
                {targetUserAvatarLibrary.map((avatarSet) => (
                  <div
                    key={avatarSet.avatarSetId}
                    className={`avatarSet ${
                      selectedAvatarLibraryId === avatarSet.avatarSetId
                        ? 'selected'
                        : ''
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
                centerMode={true}
              >
                {targetUserOtherApprovedAvatars.map((avatarSet) => (
                  <div
                    key={avatarSet.avatarSetId}
                    className={`avatarSet ${
                      selectedOtherAvatarId === avatarSet.avatarSetId
                        ? 'selected'
                        : ''
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
            </div>
          ) : null}

          {targetUserAvatarLibrary || targetUserOtherApprovedAvatars ? (
            <table>
              <tbody>
                <tr>
                  <td>
                    <button
                      className={`btn ${
                        lastSelectedAvatarId ? 'btn-success' : 'btn-danger'
                      }`}
                      onClick={handleSetAvatar}
                      disabled={!lastSelectedAvatarId}
                    >
                      Update Avatar
                    </button>
                  </td>
                  <td>
                    <h4>
                      {lastSelectedAvatarId
                        ? `Set Avatar ${lastSelectedAvatarId} as ${targetUsername}'s current avatar`
                        : `Select an avatar above to set as ${targetUsername}s current avatar`}
                    </h4>
                  </td>
                </tr>
                {targetUserAvatarLibrary && targetUserOtherApprovedAvatars ? (
                  <tr>
                    <td>
                      <button
                        className={`btn ${
                          selectedOtherAvatarId && selectedAvatarLibraryId
                            ? 'btn-success'
                            : 'btn-danger'
                        }`}
                        onClick={handleSwapAvatar}
                        disabled={
                          !selectedOtherAvatarId || !selectedAvatarLibraryId
                        }
                      >
                        Update Library
                      </button>
                    </td>
                    <td>
                      <h4>
                        {selectedOtherAvatarId && selectedAvatarLibraryId
                          ? `Add Avatar ${selectedOtherAvatarId} and remove Avatar ${selectedAvatarLibraryId} from ${targetUsername}'s avatar library`
                          : `Select an avatar from ${targetUsername}'s avatar library and their other approved avatars to update their library.`}
                      </h4>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
